import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { WaveSurfer, WaveForm, Region, Marker } from "wavesurfer-react";

import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import MarkersPlugin from "wavesurfer.js/src/plugin/markers";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";

import { useParams } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAnnotationDataApi } from "../../services/job.services";
import {
  usePostAnnotationMutation,
  usePutAnnotationMutation,
  useRemoveAnnotationMutation,
} from "../../services/Annotations/useMutations";
import { useGetAllAnnotation } from "../../services/Annotations/useQueries";
import { useLabelsQuery } from "../../services/Labels/useQueries";
import { toast } from "react-hot-toast";
import UndoToast from "../../components/UndoToast/UndoToast";
import { v4 as uuid } from "uuid";
import audioBufferToWav from "audiobuffer-to-wav";

import formatTime from "../../utils/formatTime";
import TopBar from "./components/TopBar";
import RegionsList from "./components/RegionsList";
import EditableFields from "./components/EditableFields";
import WaveButtons from "./components/WaveButtons";
import ConflictsList from "./components/ConflictsList";
import AudinoPopover from "../../components/Popover/Popover";
import { Fragment } from "react";
import {
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/24/outline";
import {
  JOB_DETAIL_KEY,
  useJobDetail,
  useJobMetaData,
} from "../../services/Jobs/useQueries";
import {
  usePatchJobMetaMutation,
  useJobUpdateMutation,
} from "../../services/Jobs/useMutations";

function generateNum(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function generateTwoNumsWithDistance(distance, min, max) {
  // Ensure that the inputs are valid
  if (min >= max || distance <= 0) {
    throw new Error(
      "Invalid input values. Make sure min < max and distance > 0."
    );
  }

  // Calculate the range
  const range = max - min;

  // Ensure that the range is greater than or equal to twice the distance
  // if (range < distance * 2) {
  //   throw new Error("Invalid input values. The range should be greater than or equal to twice the distance.");
  // }

  // Generate the first random number
  const firstNumber = Math.random() * (range - distance) + min;

  // Generate the second random number with the specified distance
  const secondNumber = firstNumber + distance;

  return [firstNumber, secondNumber];
}

export default function AnnotatePage({}) {
  const { id: jobId } = useParams();

  const [timelineVis, setTimelineVis] = useState(true);
  const [horizontalZoom, setHorizontalZoom] = useState(1);
  const [volume, setVolume] = useState(50);
  const [currentLabel, setCurrentLabel] = useState(null);
  const annotationDataRef = useRef(null);
  const initialVerticalZoom = 1;
  const initialVerticalHeight = 130;
  const unique_id = uuid();
  const queryClient = useQueryClient();

  const [markers, setMarkers] = useState([
    // {
    //   time: 5.5,
    //   label: "V1",
    //   color: "#FACC15",
    //   draggable: true,
    // },
    // {
    //   time: 10,
    //   label: "V2",
    //   color: "#FACC15",
    //   position: "top",
    // },
  ]);

  const plugins = useMemo(() => {
    return [
      {
        plugin: RegionsPlugin,
        options: { dragSelection: true },
      },
      timelineVis && {
        plugin: TimelinePlugin,
        options: {
          container: "#timeline",
        },
      },
      {
        plugin: MarkersPlugin,
        options: {
          markers: [{ draggable: true }],
        },
      },
      // {
      //   plugin: MinimapPlugin,
      // },
    ].filter(Boolean);
  }, []);

  const [regions, setRegions] = useState([
    // {
    //   id: "region-1",
    //   start: 0.5,
    //   end: 2,
    //   color: "rgb(254, 202, 202, .5)",
    //   attributes: {
    //     label: 'Region Name1'
    //   },
    //   data: {
    //     transcription: "31"
    //   }
    // },
    // {
    //   id: "region-1",
    //   start: 3,
    //   end: 5,
    //   color: "rgb(190, 242, 100, 0.5)",
    //   attributes: {
    //     label: "region1",
    //   },
    //   data: {
    //     transcription: "32",
    //     systemRegionId: 32,
    //     labels: [
    //       {
    //         id: "1",
    //         name: "label 1",
    //         attributes: [
    //           {
    //             id: "1",
    //             name: "attr1",
    //             values: ["val 1", "val 2"],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
    // {
    //   id: "region-3",
    //   start: 6,
    //   end: 10,
    //   color: "rgb(147, 197, 253, .5)",
    //   attributes: {
    //     label: "region3",
    //   },
    //   data: {
    //     transcription: "33",
    //     systemRegionId: 33,
    //   },
    // },
  ]);
  const [isWaveformLoading, setIsWaveformLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isInputGiven, setIsInputGiven] = useState("");
  const [changeHistory, setChangeHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);

  // use regions ref to pass it inside useCallback
  // so it will use always the most fresh version of regions list
  const regionsRef = useRef(regions);
  const selectedSegmentRef = useRef(selectedSegment);
  const progressBarRef = useRef(null);
  const inputTextRef = useRef(null);
  const undoButtonRef = useRef(null);
  const redoButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const wavesurferRef = useRef();
  const oneTimeApiCallRef = useRef(false);

  // only use for shortucts
  const isPlayingRef = useRef(isPlaying);
  const tabs = [{ name: "Regions" }, { name: "Conflicts" }];
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  useEffect(() => {
    selectedSegmentRef.current = selectedSegment;
  }, [selectedSegment]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (document.activeElement === inputTextRef.current) {
        return; // If focus is on input element, do nothing
      }
      if (event.key === " ") {
        event.preventDefault();
        handlePlay();
      } else if (
        event.key === "Delete" &&
        !removeAnnotationMutation.isLoading
      ) {
        event.preventDefault();
        deleteButtonRef.current.click();
      } else if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "z" || event.key === "Z")
      ) {
        if (undoButtonRef.current && !undoButtonRef.current.disabled) {
          event.preventDefault();
          undoButtonRef.current.click();
        }
      } else if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "y" || event.key === "Y") &&
        !redoButtonRef.current.disabled
      ) {
        if (redoButtonRef.current && !redoButtonRef.current.disabled) {
          event.preventDefault();
          redoButtonRef.current.click();
        }
      } else if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "ArrowRight"
      ) {
        getNextObject(selectedSegmentRef.current?.id);
      } else if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "ArrowLeft"
      ) {
        getPreviousObject(selectedSegmentRef.current?.id);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleForward();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleBackward();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const getNextObject = (currentId) => {
    const index = regionsRef?.current?.findIndex((obj) => obj.id === currentId);
    if (index === -1) return null;
    const nextSegment =
      regionsRef?.current[(index + 1) % regionsRef?.current?.length];
    setSelectedSegment(nextSegment);
    setCurrentLabel(nextSegment?.data?.labels[0]);
  };

  const getPreviousObject = (currentId) => {
    const index = regionsRef?.current?.findIndex((obj) => obj.id === currentId);
    if (index === -1) return null;
    const nextSegment =
      regionsRef?.current[
        (index - 1 + regionsRef?.current?.length) % regionsRef?.current?.length
      ];
    setSelectedSegment(nextSegment);
    setCurrentLabel(nextSegment?.data?.labels[0]);
  };

  const regionCreatedHandler = useCallback(
    (region) => {
      console.log("region-created --> region:", region);

      if (region.data.systemRegionId) return;

      // if the region has no systemRegionId, add it
      region.data.systemRegionId = region.id;
      setRegions((prev) => [...prev, { ...region }]);
      setSelectedSegment({
        ...region,
      });
      setIsInputGiven((prev) => prev + "rc");
      setCurrentLabel(null);
    },
    [regionsRef]
  );

  const handleWSMount = useCallback(
    (waveSurfer) => {
      setIsWaveformLoading(true);
      if (waveSurfer.markers) {
        waveSurfer.clearMarkers();
      }

      wavesurferRef.current = waveSurfer;

      if (wavesurferRef.current) {
        // wavesurferRef.current.load(require("../../assets/audio/audio.wav"));
        // wavesurferRef.current.load(task?.files[currentJob]);
        wavesurferRef.current.on("region-created", regionCreatedHandler);

        wavesurferRef.current.on("ready", () => {
          console.log("WaveSurfer is ready", volume / 100);
          setTotalDuration(wavesurferRef.current.getDuration());
          updateTimeUi();

          wavesurferRef.current.params.scrollParent = true;
          wavesurferRef.current.zoom(horizontalZoom);
          wavesurferRef.current.barHeight(initialVerticalZoom);
          wavesurferRef.current.setHeight(initialVerticalHeight);
          wavesurferRef.current.setVolume(volume / 100);
          wavesurferRef.current.drawBuffer();
        });

        wavesurferRef.current.on("region-removed", (region) => {
          console.log("region-removed --> ", region);
        });

        wavesurferRef.current.on("loading", (data) => {
          console.log("loading --> ", data);
          if (data === 100) {
            setIsWaveformLoading(false);
          }
        });

        wavesurferRef.current.on("region-click", (r, e) => {
          handleRegionClick(r.id, e);
        });

        wavesurferRef.current.on("finish", () => {
          setIsPlaying(false);
        });

        wavesurferRef.current.on("pause", (r, e) => {
          setIsPlaying(false);
        });

        wavesurferRef.current.on("audioprocess", () => {
          updateTimeUi();
        });

        wavesurferRef.current.on("seek", () => {
          setIsPlaying(false);
          wavesurferRef.current.pause();
          updateTimeUi();
        });

        if (window) {
          window.surferidze = wavesurferRef.current;
        }
      }
    },
    [regionCreatedHandler]
  );

  const handleRegionClick = (id, event) => {
    const region = wavesurferRef.current.regions.list[id];
    // console.log("onclick regions", region);
    if (event) event.stopPropagation();
    if (region.drag) {
      setIsPlaying(true);
      setSelectedSegment(region);
      setCurrentLabel(region.data.labels[0]);
      region.play();
    }
  };

  const updateTimeUi = () => {
    let currentTime = wavesurferRef.current.getCurrentTime();

    document.getElementById("currentTime").innerText = formatTime(currentTime);

    // Calculate the percentage of progress
    const progressPercentage =
      (currentTime / wavesurferRef.current.getDuration()) * 100;
    // Set the width of the progress bar
    progressBarRef.current.style.width = `${progressPercentage}%`;
  };

  // remove annotation data
  const removeAnnotationMutation = useRemoveAnnotationMutation({
    mutationConfig: {
      onSuccess: (data) => {
        console.log("data", data);
        toast.success(`Annotation deleted successfully`);
        // Update the regions
        setRegions((prevRegions) =>
          prevRegions.filter((reg) => reg?.id !== data.shapes[0].id)
        );
        setSelectedSegment(null);
        setIsInputGiven("");
        setCurrentLabel(null);
      },
    },
  });

  const removeCurrentRegion = () => {
    if (selectedSegment?.id) {
      const currentSegmentId = selectedSegment.id;
      const hasWavesurfer = /wavesurfer/i.test(selectedSegment.id);
      let undoTimer = null;

      if (!hasWavesurfer) {
        // Backend call after 5 seconds if the user doesn't click "Undo"
        undoTimer = setTimeout(() => {
          // index of current label selected
          const labelIndex = selectedSegment.data.labels.findIndex(
            (label) => label.id === currentLabel?.id
          );
          removeAnnotationMutation.mutate({
            data: {
              shapes: [
                {
                  attributes: selectedSegment.data.labels[
                    labelIndex
                  ].attributes.map((a) => {
                    return {
                      spec_id: a.id,
                      value: a.values[0] ?? "",
                    };
                  }),
                  frame: 0,
                  id: selectedSegment.id,
                  label_id: selectedSegment.data.labels[labelIndex].id,
                  points: [
                    parseFloat(selectedSegment.start),
                    parseFloat(selectedSegment.start),
                    parseFloat(selectedSegment.end),
                    parseFloat(selectedSegment.end),
                  ],
                  type: "rectangle",
                  transcript: selectedSegment.data.transcription,
                  gender: selectedSegment.data.gender,
                  locale: selectedSegment.data.locale,
                  age: selectedSegment.data.age,
                  accent: selectedSegment.data.accent,
                  emotion: selectedSegment.data.emotion,
                  color: selectedSegment.color,
                },
              ],
              tags: [],
              tracks: [],
            },
            jobId,
          });
        }, 5000);

        toast.custom((t) => (
          <UndoToast
            t={t}
            regionName={selectedSegment.attributes.label}
            undoTimer={undoTimer}
            undoButtonRef={undoButtonRef}
          />
        ));
      } else {
        setRegions((prevRegions) =>
          prevRegions.filter((reg) => reg.id !== currentSegmentId)
        );
        setSelectedSegment(null);
        setIsInputGiven("");
        setCurrentLabel(null);
        setCurrentHistoryIndex(changeHistory.length);
        setChangeHistory([
          ...changeHistory,
          {
            type: "annotation",
            subType: "delete",
            data: selectedSegment,
          },
        ]);
      }
    } else {
      toast.error("Please select a segment to delete");
    }
  };

  const handlePlay = useCallback(() => {
    wavesurferRef.current.playPause();
    setIsPlaying(!isPlayingRef.current);
  }, [isPlaying]);

  const handleRegionUpdate = useCallback(
    (region, smth) => {
      console.log("region-update-end --> region:", region);
      const updatedRegion = [...regions];
      const regionIndex = updatedRegion.findIndex(
        (reg) => reg.id === region.id
      );
      if (regionIndex >= 0) {
        // region created using drag selection
        setCurrentHistoryIndex(changeHistory.length);
        if (
          !updatedRegion[regionIndex].data.hasOwnProperty("transcription") &&
          !updatedRegion[regionIndex].data.hasOwnProperty("labels")
        ) {
          setChangeHistory([
            ...changeHistory,
            {
              type: "annotation",
              subType: "create",
              data: updatedRegion[regionIndex],
            },
          ]);

          const r = generateNum(0, 255);
          const g = generateNum(0, 255);
          const b = generateNum(0, 255);

          updatedRegion[regionIndex].start = region.start.toFixed(2);
          updatedRegion[regionIndex].end = region.end.toFixed(2);
          updatedRegion[regionIndex].color = `rgba(${r}, ${g}, ${b}, 0.5)`;
          updatedRegion[regionIndex].attributes.label =
            "#" + unique_id.slice(0, 3);
          updatedRegion[regionIndex].data.transcription = "";
          updatedRegion[regionIndex].data.gender = "";
          updatedRegion[regionIndex].data.locale = "";
          updatedRegion[regionIndex].data.age = "";
          updatedRegion[regionIndex].data.accent = "";
          updatedRegion[regionIndex].data.emotion = "";
          updatedRegion[regionIndex].data.labels = getLabelsForRegion();
        } else {
          // store the unchanged data in history
          setChangeHistory([
            ...changeHistory,
            {
              type: "annotation",
              subType: "update",
              data: { ...updatedRegion[regionIndex] },
            },
          ]);
          // update the region start time and end time only
          updatedRegion[regionIndex].start = region.start.toFixed(2);
          updatedRegion[regionIndex].end = region.end.toFixed(2);
        }
        updatedRegion[regionIndex].data.isSaved = false;
        setRegions(updatedRegion);
        setSelectedSegment(updatedRegion[regionIndex]);

        setIsInputGiven((prev) => prev + "ur");
      }
    },
    [regions]
  );

  const handleForward = () => {
    wavesurferRef.current.skipForward(10);
  };

  const handleBackward = () => {
    wavesurferRef.current.skipBackward(10);
  };

  const getAllLoading = () => {
    console.log(
      getJobDetailQuery.isLoading,
      getLabelsQuery.isLoading,
      getAnnotationDataQuery.isFetching,
      isWaveformLoading
    );
    return (
      getJobDetailQuery.isLoading ||
      getLabelsQuery.isLoading ||
      getAnnotationDataQuery.isFetching ||
      isWaveformLoading
    );
  };

  // fetch job detail using params jobId
  const getJobDetailQuery = useJobDetail({
    queryConfig: {
      queryKey: [jobId],
      apiParams: {
        jobId,
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => console.log(data),
    },
  });

  // fetch job meta data using params jobId
  const getJobMetaDataQuery = useJobMetaData({
    queryConfig: {
      queryKey: [jobId],
      apiParams: {
        jobId,
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => console.log("Job Meta Data", data),
    },
  });

  useEffect(() => {
    if (jobId) {
      getJobDetailQuery.refetch();
      getJobMetaDataQuery.refetch();
    }
  }, [jobId]);

  // fetch project detail when job detail fetched
  const getLabelsQuery = useLabelsQuery({
    queryConfig: {
      queryKey: [getJobDetailQuery.data?.id],
      apiParams: {
        job_id: getJobDetailQuery.data?.id,
        page_size: 500,
        page: 1,
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => getAllAnnotations.refetch(),
    },
  });

  const computeAudioData = async (
    start,
    end,
    jobId,
    combinedBuffer,
    offset,
    audioUrls,
    urlIndex,
    noOfChunks
  ) => {
    // Audio context creation
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Function to fetch and decode audio
    async function fetchAndDecodeAudio(index) {
      try {
        const arrayBuffer = await fetchAnnotationDataApi({
          id: jobId,
          quality: "compressed",
          number: index,
        });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
      } catch (error) {
        console.error("Error fetching or decoding audio from:", error);
        return null;
      }
    }

    // Loop through the specified range
    for (let index = start; index <= end; index++) {
      const audioBuffer = await fetchAndDecodeAudio(index);
      if (!audioBuffer) continue; // Skip if fetching or decoding failed

      // Calculate total audio length
      let audioLength = audioBuffer.length * noOfChunks;

      // Create the combined buffer if it doesn't exist
      if (!combinedBuffer) {
        combinedBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          audioLength,
          audioBuffer.sampleRate
        );
      }

      // Copy the audioBuffer into the combinedBuffer
      let copyLength = Math.min(
        audioBuffer.length,
        combinedBuffer.length - offset
      );
      if (copyLength > 0) {
        for (
          let channel = 0;
          channel < audioBuffer.numberOfChannels;
          channel++
        ) {
          combinedBuffer
            .getChannelData(channel)
            .set(
              audioBuffer.getChannelData(channel).subarray(0, copyLength),
              offset
            );
        }
        offset += copyLength;
      } else {
        console.warn(
          `Offset ${offset} exceeds combinedBuffer length, skipping copy.`
        );
      }

      // Create a Blob and URL for each combined chunk
      const blob = new Blob([audioBufferToWav(combinedBuffer)], {
        type: "audio/wav",
      });
      const url = URL.createObjectURL(blob);
      audioUrls.push(url);

      if (urlIndex % 5 === 0) {
        wavesurferRef.current.load(audioUrls[urlIndex]);
      }
      urlIndex += 1;
    }

    // Load the last audio URL into wavesurfer
    if (audioUrls.length > 0) {
      wavesurferRef.current.load(audioUrls[audioUrls.length - 1]);
    }

    return { combinedBuffer, offset, urlIndex };
  };

  const fetchAudioDataRecursive = async (
    startNo,
    endNo,
    jobId,
    included_frames,
    segment_size
  ) => {
    let combinedBuffer = null;
    let offset = 0;
    const audioUrls = [];
    let noOfChunks = endNo + 1 - startNo;
    let urlIndex = 0;
    let start = startNo;
    let end = endNo;
    // if (start <= 0) start = 1;

    // ground truth job
    if (included_frames) {
      let start_frame = included_frames[0];
      let jobs = [];

      for (let i = 1; i < included_frames.length; i++) {
        if (included_frames[i] - start_frame >= segment_size) {
          jobs.push({
            start_frame,
            endFrame: included_frames[i - 1],
          });
          start_frame = included_frames[i];
        }
      }

      if (start_frame !== included_frames[included_frames.length - 1]) {
        jobs.push({
          start_frame,
          endFrame: included_frames[included_frames.length - 1],
        });
      }

      noOfChunks = jobs.reduce(
        (acc, job) =>
          acc +
          Math.trunc(job.endFrame / getJobMetaDataQuery.data.chunk_size) -
          Math.trunc(job.start_frame / getJobMetaDataQuery.data.chunk_size) +
          1,
        0
      );

      for (let i = 0; i < jobs.length; i++) {
        start = Math.trunc(
          jobs[i].start_frame / getJobMetaDataQuery.data.chunk_size
        );
        end = Math.trunc(
          jobs[i].endFrame / getJobMetaDataQuery.data.chunk_size
        );

        const result = await computeAudioData(
          start,
          end,
          jobId,
          combinedBuffer,
          offset,
          audioUrls,
          urlIndex,
          noOfChunks
        );

        combinedBuffer = result.combinedBuffer;
        offset = result.offset;
        urlIndex = result.urlIndex;
      }
    } else {
      const result = await computeAudioData(
        start,
        end,
        jobId,
        combinedBuffer,
        offset,
        audioUrls,
        urlIndex,
        noOfChunks
      );
    }

    return combinedBuffer;
  };

  const getAnnotationDataQuery = useQuery({
    queryKey: ["annotation-data"],
    enabled: false,
    staleTime: Infinity,
    queryFn: () =>
      fetchAudioDataRecursive(
        Math.trunc(
          getJobMetaDataQuery.data.start_frame /
            getJobMetaDataQuery.data.chunk_size
        ),
        Math.trunc(
          getJobMetaDataQuery.data.stop_frame /
            getJobMetaDataQuery.data.chunk_size
        ),
        jobId,
        getJobMetaDataQuery.data.included_frames,
        getJobMetaDataQuery.data.chunk_size
      ),
    onSuccess: (arrayBuffer) => {
      // console.log(arrayBuffer);
      // wavesurferRef.current.load(require("../../assets/audio/audio.wav"));
    },
  });

  // fetch all annotations when job detail fetched
  const getAllAnnotations = useGetAllAnnotation({
    queryConfig: {
      queryKey: [jobId],
      apiParams: {
        id: jobId,
      },
      enabled: false,
      staleTime: Infinity,
      onSuccess: (data) => {
        console.log("Annotations", data);
        // label color map
        const labelColorMap = {};
        getLabelsQuery.data?.forEach((label) => {
          labelColorMap[label.id] = label.color + "80";
        });

        const updatedData = data.shapes.map((item) => {
          return {
            id: item.id,
            start: item.points[0],
            end: item.points[3],
            color: labelColorMap[item.label_id],
            attributes: {
              label: `#${item.id}`,
            },
            drag: true,
            data: {
              isSaved: true,
              transcription: item.transcript || "",
              gender: item.gender || "",
              locale: item.locale || "",
              age: item.age || "",
              accent: item.accent || "",
              emotion: item.emotion || "",
              systemRegionId: item.id,
              labels: [
                {
                  id: item.label_id,
                  name: item.label_id,
                  attributes: item.attributes.map((a) => {
                    return {
                      id: a.spec_id,
                      values: [a.value],
                    };
                  }),
                },
              ],
              // labels:
              //   item.labels &&
              //   item.labels.map((label) => {
              //     return {
              //       id: label.label,
              //       name: label.name,
              //       attributes:
              //         label.attributes &&
              //         label.attributes.map((attr) => {
              //           return {
              //             id: attr.attribute,
              //             name: attr.name,
              //             values: attr.values,
              //           };
              //         }),
              //     };
              //   }),

              // [
              //   {
              //     id: "1",
              //     name: "label 1",
              //     attributes: [
              //       {
              //         id: "1",
              //         name: "attr1",
              //         values: ["val 1", "val 2"],
              //       },
              //     ],
              //   },
              // ],
            },
          };
        });

        setRegions(updatedData);
        console.log("all annotations", data);
      },
    },
  });

  useEffect(() => {
    if (getJobDetailQuery.data?.task_id) {
      getLabelsQuery.refetch();
    }
  }, [getJobDetailQuery.data?.task_id]);

  useEffect(() => {
    if (getJobMetaDataQuery.data?.size) {
      getAnnotationDataQuery.refetch();
    }
  }, [getJobMetaDataQuery.data?.size]);

  const getLabelsForRegion = () => {
    const labels = [];

    const labelQueryData = getLabelsQuery.data;
    for (
      let labelIndex = 1;
      labelIndex <= labelQueryData?.length;
      labelIndex++
    ) {
      const label = {
        id: labelQueryData?.[labelIndex - 1].id,
        name: labelQueryData?.[labelIndex - 1].name,
        attributes: [],
      };

      // Create two attribute objects for each label
      for (
        let attributeIndex = 1;
        attributeIndex <= labelQueryData[labelIndex - 1].attributes?.length;
        attributeIndex++
      ) {
        const attribute = {
          id: labelQueryData[labelIndex - 1].attributes?.[attributeIndex - 1]
            .id,
          name: labelQueryData[labelIndex - 1].attributes?.[attributeIndex - 1]
            .name,
          values: [],
        };

        // Add the attribute to the label's attributes array
        label.attributes.push(attribute);
      }

      // Add the label to the labels array
      labels.push(label);
    }
    return labels;
  };

  const generateRegion = useCallback(() => {
    if (!wavesurferRef.current) return;
    const minTimestampInSeconds = 0;
    const maxTimestampInSeconds = wavesurferRef.current.getDuration();
    const distance = generateNum(0, 0.1);
    console.log({ maxTimestampInSeconds });
    const [min, max] = generateTwoNumsWithDistance(
      distance,
      minTimestampInSeconds,
      maxTimestampInSeconds
    );

    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    if (getLabelsQuery?.data?.length > 0) {
      const labels = getLabelsForRegion();

      const id = parseInt(generateNum(0, 9999));
      const tempRegion = {
        id,
        start: parseFloat(min.toFixed(2)),
        end: parseFloat(max.toFixed(2)),
        color: `rgba(${r}, ${g}, ${b}, 0.5)`,
        attributes: {
          label: "#" + unique_id.slice(0, 3),
        },
        drag: true,
        data: {
          isSaved: false,
          systemRegionId: id,
          transcription: "",
          gender: "",
          locale: "",
          age: "",
          accent: "",
          emotion: "",
          labels: labels,
        },
      };
      setRegions([...regions, tempRegion]);
      setCurrentHistoryIndex(changeHistory.length);
      setChangeHistory([
        ...changeHistory,
        {
          type: "annotation",
          subType: "create",
          data: tempRegion,
        },
      ]);
      setIsInputGiven((prev) => prev + " nr");
    }
  }, [regions, wavesurferRef, getLabelsQuery]);

  const generateMissingRegionsFromGroundTruth = (conflicts, shapes) => {
    console.log("final data", conflicts, shapes);
    const missing_regions = [];
    const missing_annotations = conflicts.reduce((acc, conflict) => {
      if (conflict.type === "missing_annotation") {
        acc.push(conflict?.annotation_ids[0]?.obj_id);
      }
      return acc;
    }, []);

    missing_annotations.map((missing_annotation) => {
      const groundtruth_annotation = shapes.find(
        (shape) => shape?.id === missing_annotation
      );
      const {
        id,
        points,
        attributes,
        transcript,
        gender,
        locale,
        age,
        accent,
        emotion,
      } = groundtruth_annotation;
      const tempRegion = {
        id,
        start: parseFloat(points[0].toFixed(2)),
        end: parseFloat(points[2].toFixed(2)),
        color: `rgba(255, 0, 0, 0.5)`,
        attributes: {
          label: "#" + id + " (Missing)",
        },
        drag: false,
        data: {
          isSaved: false,
          systemRegionId: id,
          transcription: transcript,
          gender,
          locale,
          age,
          accent,
          emotion,
          // labels: labels,
        },
      };
      missing_regions.push(tempRegion);
    });
    setRegions([...regions, ...missing_regions]);
  };

  // post annotation data
  const postAnnotationMutation = usePostAnnotationMutation({
    mutationConfig: {
      onSuccess: (data, { id, index }) => {
        toast.success(`Annotation saved successfully`);
        // Update the region object with backend id
        const oldRegionId = selectedSegment.id;
        const updatedRegion = [...regions];
        const regionIndex = regions.findIndex(
          (reg) => reg.id === selectedSegment.id
        );
        updatedRegion[regionIndex].id = data["shapes"][0].id;
        updatedRegion[regionIndex].data.systemRegionId = data["shapes"][0].id;
        updatedRegion[regionIndex].data.isSaved = true;

        // // update the history state with the new id
        const updatedChangeHistory = [...changeHistory];
        const updatedChangeHistoryIndex = updatedChangeHistory.findIndex(
          (ch) => ch.data.id === oldRegionId
        );
        updatedChangeHistory[updatedChangeHistoryIndex].data.id =
          data["shapes"][0].id;

        setChangeHistory(updatedChangeHistory);
        setSelectedSegment(updatedRegion[regionIndex]);
        setIsInputGiven("");
        setRegions(updatedRegion);

        // check if no annotation is there then call the job detail api to update the state
        if (getAllAnnotations.data.shapes.length === 0) {
          handleStateChange("state", "in progress");
        }
        // Add the new annotation to the list of annotations
        queryClient.setQueryData(["annotations"], (oldData) => {
          return {
            ...oldData,
            shapes: [...oldData.shapes, updatedRegion[regionIndex]],
          };
        });
      },
    },
  });

  // put annotation data
  const putAnnotationMutation = usePutAnnotationMutation({
    mutationConfig: {
      onSuccess: (data, { id, index }) => {
        console.log("Update Annotation data", data);
        toast.success(`Annotation edited successfully`);
      },
    },
  });

  // Patch Job Meta
  const patchJobMeta = usePatchJobMetaMutation({
    mutationConfig: {
      onSuccess: (data, { action }) => {
        console.log("patch job meta data", data, action);

        if (action === "create") {
          postAnnotationMutation.mutate({
            data: annotationDataRef.current,
            jobId: jobId,
          });
        } else if (action === "update") {
          putAnnotationMutation.mutate({
            data: annotationDataRef.current,
            jobId: jobId,
          });
        }
      },
    },
  });

  const handleSave = () => {
    console.log("selectedSegment", selectedSegment);
    console.log("getAllAnnotations.data", getAllAnnotations.data);
    // check if the region is already saved or not
    const regionIndex = getAllAnnotations.data.shapes.findIndex(
      (reg) => reg.id === selectedSegment.id
    );

    // index of current label selected
    const labelIndex = selectedSegment.data.labels.findIndex(
      (label) => label.id === currentLabel?.id
    );

    if (labelIndex < 0) {
      toast.error("Please select a label to save the annotation");
      return;
    }

    const payload = {
      shapes: [
        {
          attributes: selectedSegment.data.labels[labelIndex].attributes
            .filter((a) => a.values && a.values.length > 0)
            .map((a) => {
              return {
                spec_id: a.id,
                value: a.values[0],
              };
            }),
          frame: 0,
          label_id: selectedSegment.data.labels[labelIndex].id,
          points: [
            parseFloat(selectedSegment.start),
            parseFloat(selectedSegment.start),
            parseFloat(selectedSegment.end),
            parseFloat(selectedSegment.end),
          ],
          type: "rectangle",
          transcript: selectedSegment.data.transcription,
          gender: selectedSegment.data.gender,
          locale: selectedSegment.data.locale,
          age: selectedSegment.data.age,
          accent: selectedSegment.data.accent,
          emotion: selectedSegment.data.emotion,
          color: selectedSegment.color,
        },
      ],
      tags: [],
      tracks: [],
    };

    annotationDataRef.current = payload;

    const action = regionIndex < 0 ? "create" : "update";

    if (action === "update") {
      annotationDataRef.current.shapes[0].id = selectedSegment.id;
    }
    patchJobMeta.mutate({ data: {}, jobId, action });
    setIsInputGiven("");
  };

  const jobUpdateMutation = useJobUpdateMutation({
    mutationConfig: {
      onSuccess: (resData, { data }) => {
        if (data.hasOwnProperty("state")) {
          toast.success(`Job state updated to ${resData?.state}`);
        }
      },
      onError: (err) => {
        toast.error("Failed to assign job to user. Please try again.");
      },
    },
  });

  const handleStateChange = (name, value) => {
    const jobData = queryClient.getQueryData([JOB_DETAIL_KEY, jobId]);
    console.log("====================================");
    console.log("jobData", jobData, value);
    console.log("====================================");

    queryClient.setQueryData([JOB_DETAIL_KEY, jobId], {
      ...jobData,
      state: value,
    });

    jobUpdateMutation.mutate({
      jobId,
      data: {
        [name]: value,
      },
    });
  };

  const getScrollPercent = () => {
    var h = document.documentElement,
      b = document.body,
      st = "scrollTop",
      sh = "scrollHeight";
    return ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
  };

  useEffect(() => {
    const scrollListener = () => {
      const p = getScrollPercent();

      if (p > 1) setIsScrolled(true);
      else setIsScrolled(false);
    };

    window.addEventListener("scroll", scrollListener);
    return () => {
      window.removeEventListener("scroll", scrollListener);
    };
  }, []);

  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    // console.log("isInputGiven---", isInputGiven);
    if (isInputGiven) window.addEventListener("beforeunload", unloadCallback);

    return () => {
      if (isInputGiven) {
        window.removeEventListener("beforeunload", unloadCallback);
      }
    };
  }, [isInputGiven]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <TopBar
        getJobDetailQuery={getJobDetailQuery}
        jobUpdateMutation={jobUpdateMutation}
        handleStateChange={handleStateChange}
        isScrolled={isScrolled}
        jobId={jobId}
      />

      <main className=" -mt-32 grid grid-cols-12 gap-4 sm:px-6 lg:px-8">
        <div className="pb-12 col-span-9 ">
          <div className="bg-white shadow min-h-full rounded-lg">
            {
              <>
                {(getAnnotationDataQuery.isLoading ||
                  getAnnotationDataQuery.isFetching) && (
                  <div className="p-2 text-center text-gray-500">
                    <p>Please wait your audio is loading...</p>{" "}
                  </div>
                )}
                <div
                  className={`rounded-lg bg-white ${
                    isScrolled ? "sticky top-[5rem] z-10 px-6 pt-4" : "p-6"
                  }`}
                >
                  <WaveSurfer plugins={plugins} onMount={handleWSMount}>
                    <WaveForm
                      id="waveform"
                      cursorColor="transparent"
                      waveColor="#65B892"
                    >
                      {regions.map((regionProps) => {
                        const tempRegion = { ...regionProps };
                        // const attributes = tempRegion.attributes;
                        // delete tempRegion.attributes;

                        // const labelSuffix = tempRegion.data.isSaved ? " (saved)" : " (unsaved)";
                        // const updatedLabel = `${attributes?.label}${labelSuffix}`;
                        return (
                          <Region
                            // onOut={() => {
                            //   alert("onOut");
                            //   // setIsPlaying(false);
                            // }}
                            onUpdateEnd={handleRegionUpdate}
                            className="text-base font-semibold leading-6 text-gray-900 "
                            key={tempRegion.id}
                            // attributes={{
                            //   label: updatedLabel,
                            // }}
                            {...tempRegion}
                          />
                        );
                      })}
                      {markers.map((marker, index) => {
                        return (
                          <Marker
                            key={index}
                            {...marker}
                            region
                            onClick={(...args) => {
                              console.log("onClick", ...args);
                            }}
                            onDrag={(...args) => {
                              console.log("onDrag", ...args);
                            }}
                            onDrop={(...args) => {
                              console.log("onDrop", ...args);
                            }}
                          />
                        );
                      })}
                    </WaveForm>
                    <div id="timeline" />
                  </WaveSurfer>
                  {getAllLoading() ? (
                    <div className="p-2 mt-8">
                      {[...Array(5).keys()].map((val) => (
                        <div
                          key={`annotButton-${val}`}
                          className="h-16 bg-gray-200 rounded-md w-full mb-2.5 pt-4 animate-pulse"
                        ></div>
                      ))}{" "}
                    </div>
                  ) : (
                    <WaveButtons
                      wavesurferRef={wavesurferRef}
                      progressBarRef={progressBarRef}
                      undoButtonRef={undoButtonRef}
                      redoButtonRef={redoButtonRef}
                      // generateRegion={generateRegion}
                      isPlaying={isPlaying}
                      initialVerticalZoom={initialVerticalZoom}
                      initialVerticalHeight={initialVerticalHeight}
                      totalDuration={totalDuration}
                      volume={volume}
                      setVolume={setVolume}
                      regions={regions}
                      setRegions={setRegions}
                      changeHistory={changeHistory}
                      setChangeHistory={setChangeHistory}
                      currentHistoryIndex={currentHistoryIndex}
                      setCurrentHistoryIndex={setCurrentHistoryIndex}
                      horizontalZoom={horizontalZoom}
                      setHorizontalZoom={setHorizontalZoom}
                      setSelectedSegment={setSelectedSegment}
                      setIsInputGiven={setIsInputGiven}
                      //
                      handleBackward={handleBackward}
                      handleForward={handleForward}
                      handlePlay={handlePlay}
                    />
                  )}
                </div>

                {selectedSegment ? (
                  <div className="w-1/2 mx-auto">
                    <EditableFields
                      inputTextRef={inputTextRef}
                      totalDuration={totalDuration}
                      regions={regions}
                      setRegions={setRegions}
                      selectedSegment={selectedSegment}
                      setSelectedSegment={setSelectedSegment}
                      currentLabel={currentLabel}
                      setCurrentLabel={setCurrentLabel}
                      changeHistory={changeHistory}
                      setChangeHistory={setChangeHistory}
                      setCurrentHistoryIndex={setCurrentHistoryIndex}
                      setIsInputGiven={setIsInputGiven}
                      getLabelsQuery={getLabelsQuery}
                    />

                    {/* Action buttons */}
                    <div className="flex-shrink-0 border-t border-gray-200 my-8 py-4">
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          className="rounded-md bg-white px-3 py-2 text-sm font-medium text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                          onClick={removeCurrentRegion}
                          disabled={removeAnnotationMutation.isLoading}
                          ref={deleteButtonRef}
                        >
                          {removeAnnotationMutation.isLoading
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                        <PrimaryButton
                          onClick={() => handleSave()}
                          loading={
                            postAnnotationMutation.isLoading ||
                            patchJobMeta.isLoading
                          }
                        >
                          Save
                        </PrimaryButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-400 text-center">
                    Drag over audio wave to create a region or Select a region
                    to annotate
                  </p>
                )}
              </>
            }
          </div>
        </div>
        <div className="pb-12 col-span-3 ">
          <div
            className={`bg-white shadow rounded-lg px-4 pt-0 ${
              isScrolled ? "sticky top-[5rem] z-10 " : ""
            }`}
          >
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
              <select
                id="tabs"
                name="tabs"
                onChange={(e) => setCurrentTab(e.target.value)}
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                defaultValue={tabs[currentTab]?.name}
              >
                {tabs.map((tab, index) => (
                  <option key={tab.name} value={index}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex pt-4 " aria-label="Tabs">
                  {tabs.map((tab, index) => (
                    <p
                      key={tab.name}
                      onClick={() => setCurrentTab(index)}
                      className={classNames(
                        currentTab === index
                          ? "border-[#70CBA2] text-[#70CBA2]"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "w-1/4 cursor-pointer border-b-2 px-1 pb-2  text-center text-sm font-medium"
                      )}
                      aria-current={currentTab === index ? "page" : undefined}
                    >
                      {tab.name}
                    </p>
                  ))}

                  <div className="ml-auto ">
                    <AudinoPopover
                      content={
                        currentTab === 0 ? (
                          <Fragment>
                            Drag the card to change the region's order. The top
                            region will appear in the foreground of all other
                            regions, while the last region will be in the
                            background. You can also use the{" "}
                            <ChevronDoubleUpIcon className="inline h-4 w-4" />{" "}
                            and{" "}
                            <ChevronDoubleDownIcon className="inline h-4 w-4" />{" "}
                            arrows to adjust the order. To bring a region to the
                            top, click the{" "}
                            <ChevronDoubleUpIcon className="inline h-4 w-4" />{" "}
                            icon or drag it to the desired position. To move a
                            region down, click the{" "}
                            <ChevronDoubleDownIcon className="inline h-4 w-4" />{" "}
                            icon or drag it accordingly.
                          </Fragment>
                        ) : (
                          <Fragment>
                            Below is the list of annotation conflicts in a
                            quality report. Each conflict card contains the
                            following information: ID, type of conflict, and
                            conflict severity.
                          </Fragment>
                        )
                      }
                    />
                  </div>
                </nav>
              </div>
            </div>
            {currentTab === 0 ? (
              <RegionsList
                regions={regions}
                setRegions={setRegions}
                changeHistory={changeHistory}
                setChangeHistory={setChangeHistory}
                setCurrentHistoryIndex={setCurrentHistoryIndex}
                isScrolled={isScrolled}
                selectedSegment={selectedSegment}
                removeAnnotationMutation={removeAnnotationMutation}
                removeCurrentRegion={removeCurrentRegion}
                handleRegionClick={handleRegionClick}
              />
            ) : (
              <ConflictsList
                conflicts={conflicts}
                setConflicts={setConflicts}
                oneTimeApiCallRef={oneTimeApiCallRef}
                taskId={getJobDetailQuery.data?.task_id}
                jobId={jobId}
                handleRegionClick={handleRegionClick}
                selectedSegment={selectedSegment}
                generateMissingRegionsFromGroundTruth={
                  generateMissingRegionsFromGroundTruth
                }
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

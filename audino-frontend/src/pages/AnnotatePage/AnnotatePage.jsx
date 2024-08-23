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

import { useParams } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAnnotationDataApi } from "../../services/job.services";
import {
  usePostAnnotationMutation,
  usePutAnnotationMutation,
  useRemoveAnnotationMutation,
} from "../../services/Annotations/useMutations";
import {
  ANNOTATIONS_KEY,
  useGetAllAnnotation,
} from "../../services/Annotations/useQueries";
import { useLabelsQuery } from "../../services/Labels/useQueries";
import { toast } from "react-hot-toast";
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
import { useJobUpdateMutation } from "../../services/Jobs/useMutations";
import AlertModal from "../../components/Alert/AlertModal";

import { Transition } from "@headlessui/react";
import Spinner from "../../components/loader/spinner";

export default function AnnotatePage({}) {
  const { id: jobId } = useParams();

  const [timelineVis, setTimelineVis] = useState(true);
  const [horizontalZoom, setHorizontalZoom] = useState(1);
  const [volume, setVolume] = useState(50);
  const initialVerticalZoom = 1;
  const initialVerticalHeight = 130;
  const unique_id = uuid();
  const queryClient = useQueryClient();

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
    ].filter(Boolean);
  }, []);

  const [regions, setRegions] = useState([]);
  const [isWaveformLoading, setIsWaveformLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const tabs = [{ name: "Regions" }, { name: "Conflicts" }];
  const [currentTab, setCurrentTab] = useState(0);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentAnnotationIndex, setCurrentAnnotationIndex] = useState(null);
  const [dataChangedLog, setDataChangedLog] = useState({
    created: [],
    updated: [],
    deleted: [],
  });
  const [mutationCount, setMutationCount] = useState({
    totalMutation: 0,
    successMutation: 0,
  });
  const [gtAnnotations, setGtAnnotations] = useState([]);

  // use regions ref to pass it inside useCallback
  // so it will use always the most fresh version of regions list
  const regionsRef = useRef(regions);
  const progressBarRef = useRef(null);
  const inputTextRef = useRef(null);
  const undoButtonRef = useRef(null);
  const redoButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const wavesurferRef = useRef();
  const oneTimeApiCallRef = useRef(false);
  const currentAnnotationIndexRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  // only use for shortucts
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    regionsRef.current = regions;
  }, [regions]);

  useEffect(() => {
    currentAnnotationIndexRef.current = currentAnnotationIndex;
  }, [currentAnnotationIndex]);

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
        getNextObject(currentAnnotationIndexRef.current);
      } else if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "ArrowLeft"
      ) {
        getPreviousObject(currentAnnotationIndexRef.current);
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

  const getNextObject = (currentIndex) => {
    if (currentIndex >= 0 && currentIndex < regionsRef?.current?.length - 1) {
      setCurrentAnnotationIndex(currentIndex + 1);
    }
  };

  const getPreviousObject = (currentIndex) => {
    if (currentIndex > 0 && currentIndex < regionsRef?.current?.length) {
      setCurrentAnnotationIndex(currentIndex - 1);
    }
  };

  const regionCreatedHandler = useCallback(
    (region) => {
      console.log("region-created --> region:", region);

      if (region.data.systemRegionId) return;

      // if the region has no systemRegionId, add it
      region.data.systemRegionId = region.id;

      undoStackRef.current.push(regionsRef.current.map((r) => ({ ...r })));
      redoStackRef.current = [];

      setRegions((prev) => [
        ...prev,
        {
          id: region.id,
          start: region.start.toFixed(2),
          end: region.end.toFixed(2),
          color: region.color,
          attributes: {
            label: "new",
          },
          drag: true,
          data: {
            isSaved: false,
            transcription: "",
            locale: "",
            gender: "",
            age: "",
            accent: "",
            emotion: "",
            systemRegionId: region.id,
          },
        },
      ]);
    },
    [regionsRef]
  );

  const handleRegionUpdate = useCallback(
    (region, smth) => {
      console.log("region-update-end --> region:", region);
      const updatedRegions = [...regions];
      const regionIndex = updatedRegions.findIndex(
        (reg) => reg.id === region.id
      );

      if (regionIndex >= 0) {
        // region created using drag selection
        if (!updatedRegions[regionIndex].data.hasOwnProperty("label")) {
          updatedRegions[regionIndex].start = region.start.toFixed(2);
          updatedRegions[regionIndex].end = region.end.toFixed(2);
          updatedRegions[regionIndex].color =
            getLabelsQuery.data[0].color + "80";
          updatedRegions[regionIndex].attributes.label =
            "#" + unique_id.slice(0, 3);
          updatedRegions[regionIndex].data.label = getLabelsQuery.data[0];
          // we need to update the label of the region in wavesurfer directly to show the label on the region
          wavesurferRef.current.regions.list[region.id].update({
            attributes: {
              label: "#" + unique_id.slice(0, 3),
            },
          });
        } else {
          undoStackRef.current.push(regionsRef.current.map((r) => ({ ...r })));
          redoStackRef.current = [];

          // update the region start time and end time only
          updatedRegions[regionIndex].start = region.start.toFixed(2);
          updatedRegions[regionIndex].end = region.end.toFixed(2);
        }
        // updatedRegions[regionIndex].data.isSaved = false;
        setRegions(updatedRegions);
        setCurrentAnnotationIndex(regionIndex);
      }
    },
    [regions]
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
          // console.log("loading --> ", data);
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
    if (event) event.stopPropagation();
    if (region.drag) {
      setIsPlaying(true);
      region.play();
    }

    // need to check id in regionsRef.current bcoz this function is being called in wavesurfer event
    const regionIndex = regionsRef.current.findIndex((reg) => reg.id === id);
    setCurrentAnnotationIndex(regionIndex);
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

  const removeCurrentRegion = () => {
    if (regions[currentAnnotationIndex]?.id) {
      const currentAnnotation = regions[currentAnnotationIndex];

      setCurrentAnnotationIndex(null);
      setRegions((prevRegions) =>
        prevRegions.filter((reg) => reg.id !== currentAnnotation.id)
      );
      setDeleteModal(false);
      undoStackRef.current.push(regionsRef.current.map((r) => ({ ...r })));
      redoStackRef.current = [];
    } else {
      toast.error("Please select a segment to delete");
    }
  };

  const handlePlay = useCallback(() => {
    wavesurferRef.current.playPause();
    setIsPlaying(!isPlayingRef.current);
  }, [isPlaying]);

  const handleForward = () => {
    wavesurferRef.current.skipForward(10);
  };

  const handleBackward = () => {
    wavesurferRef.current.skipBackward(10);
  };

  const getAllLoading = () => {
    // console.log(
    //   getJobDetailQuery.isLoading,
    //   getLabelsQuery.isLoading,
    //   getAnnotationDataQuery.isFetching,
    //   isWaveformLoading
    // );
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
      // onSuccess: (data) => console.log(data),
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
      // onSuccess: (data) => console.log("Job Meta Data", data),
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
        // label color map
        const labelMapping = {};
        getLabelsQuery.data?.forEach((label) => {
          labelMapping[label.id] = {
            color: label.color + "80",
            name: label.name,
          };
        });

        const updatedData = data.shapes.map((item) => {
          return {
            id: item.id,
            start: item.points[0],
            end: item.points[3],
            color: labelMapping[item.label_id].color,
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
              label: {
                id: item.label_id,
                name: labelMapping[item.label_id].name,
                attributes: item.attributes.map((a) => {
                  return {
                    id: a.spec_id,
                    values: [a.value],
                  };
                }),
              },
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

  const generateMissingRegionsFromGroundTruth = () => {
    console.log("final data", conflicts, gtAnnotations);
    const missing_regions = [];
    const missing_annotations = conflicts.reduce((acc, conflict) => {
      if (conflict.type === "missing_annotation") {
        acc.push(conflict?.annotation_ids[0]?.obj_id);
      }
      return acc;
    }, []);
    const labelMapping = {};
    getLabelsQuery.data?.forEach((label) => {
      labelMapping[label.id] = {
        color: label.color + "80",
        name: label.name,
      };
    });
    missing_annotations.map((missing_annotation) => {
      const groundtruth_annotation = gtAnnotations.find(
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
        label_id,
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
          label: {
            id: label_id,
            name: labelMapping[label_id].name,
            attributes: attributes.map((a) => {
              return {
                id: a.spec_id,
                values: [a.value],
              };
            }),
          },
        },
      };
      missing_regions.push(tempRegion);
    });
    setRegions([...regions, ...missing_regions]);
  };

  const removeMissingRegionsFromGroundTruth = () => {
    const missing_annotations = conflicts.reduce((acc, conflict) => {
      if (conflict.type === "missing_annotation") {
        acc.push(conflict?.annotation_ids[0]?.obj_id);
      }
      return acc;
    }, []);
    const updatedRegions = regions.filter((region) => {
      return !missing_annotations.includes(region.id);
    });
    setRegions(updatedRegions);
    setCurrentAnnotationIndex(null);
  };

  // post annotation data
  const postAnnotationMutation = usePostAnnotationMutation({
    mutationConfig: {
      onSuccess: (data) => {
        for (let index = 0; index < dataChangedLog.created.length; index++) {
          const element = dataChangedLog.created[index];
          const regionIndex = regions.findIndex((reg) => reg.id === element.id);
          regions[regionIndex].id = data.shapes[index].id;
          regions[regionIndex].data.systemRegionId = data.shapes[index].id;
          regions[regionIndex].attributes.label = `#${data.shapes[index].id}`;
        }

        // Add the new annotation to the list of annotations
        queryClient.setQueryData([ANNOTATIONS_KEY, jobId], (_oldData) => {
          return {
            ..._oldData,
            shapes: [..._oldData.shapes, ...data.shapes],
          };
        });

        setDataChangedLog((prev) => ({
          ...prev,
          created: [],
        }));
        setMutationCount((prev) => ({
          ...prev,
          successMutation: prev.successMutation + 1,
        }));
      },
    },
  });

  // put annotation data
  const putAnnotationMutation = usePutAnnotationMutation({
    mutationConfig: {
      onSuccess: (data) => {
        // update the all annotations list
        queryClient.setQueryData([ANNOTATIONS_KEY, jobId], (_oldData) => {
          return {
            ..._oldData,
            shapes: _oldData.shapes.map((shape) => {
              const updatedShape = data.shapes.find(
                (updatedShape) => updatedShape.id === shape.id
              );
              if (updatedShape) {
                return updatedShape;
              }
              return shape;
            }),
          };
        });

        setDataChangedLog((prev) => ({
          ...prev,
          updated: [],
        }));
        setMutationCount((prev) => ({
          ...prev,
          successMutation: prev.successMutation + 1,
        }));
      },
    },
  });

  // remove annotation data
  const removeAnnotationMutation = useRemoveAnnotationMutation({
    mutationConfig: {
      onSuccess: (data) => {
        // update the all annotations list
        queryClient.setQueryData([ANNOTATIONS_KEY, jobId], (_oldData) => {
          // Extract ids from data.shapes into a Set for efficient lookup
          const dataShapeIds = new Set(data.shapes.map((shape) => shape.id));

          return {
            ..._oldData,
            shapes: _oldData.shapes.filter(
              (shape) => !dataShapeIds.has(shape.id)
            ),
          };
        });

        setDataChangedLog((prev) => ({
          ...prev,
          deleted: [],
        }));
        setMutationCount((prev) => ({
          ...prev,
          successMutation: prev.successMutation + 1,
        }));
      },
    },
  });

  const checkIfUpdateRequired = (local, server) => {
    if (
      local.points[0] !== server.points[0] ||
      local.points[2] !== server.points[2]
    ) {
      return true;
    } else if (
      local.accent !== server.accent ||
      local.age !== server.age ||
      local.emotion !== server.emotion ||
      local.gender !== server.gender ||
      local.locale !== server.locale
    ) {
      return true;
    } else if (local.transcript !== server.transcript) {
      return true;
    } else if (local.label_id !== server.label_id) {
      return true;
    }
    for (let i = 0; i < local.attributes.length; i++) {
      if (
        local.attributes[i].spec_id !== server.attributes[i].spec_id ||
        local.attributes[i].value !== server.attributes[i].value
      ) {
        return true;
      }
    }
    return false;
  };

  const handleSave = () => {
    if (currentTab === 1) {
      toast.error("Please switch to regions tab to save annotations");
      return;
    }
    const serverAnnotations = getAllAnnotations.data?.shapes;
    const localAnnotations = regions;
    const result = {
      created: [],
      updated: [],
      deleted: [],
    };
    let tempTotalMutation = 0;

    // Create maps for fast lookup
    const localMap = new Map(
      localAnnotations.map((item) => [
        item.id,
        {
          attributes: item.data.label.attributes.map((a) => {
            return {
              spec_id: a.id,
              value: a.values[0] ?? "",
            };
          }),
          frame: 0,
          label_id: item.data.label.id,
          points: [
            parseFloat(item.start),
            parseFloat(item.start),
            parseFloat(item.end),
            parseFloat(item.end),
          ],
          type: "rectangle",
          transcript: item.data.transcription,
          gender: item.data.gender,
          locale: item.data.locale,
          age: item.data.age,
          accent: item.data.accent,
          emotion: item.data.emotion,
          id: item.id,
        },
      ])
    );
    const serverMap = new Map(serverAnnotations.map((item) => [item.id, item]));

    // Check for created and updated items
    for (const [id, serverItem] of serverMap.entries()) {
      if (!localMap.has(id)) {
        result.deleted.push(serverItem);
      } else {
        const localItem = localMap.get(id);
        if (checkIfUpdateRequired(localItem, serverItem)) {
          result.updated.push(localItem);
        }
        localMap.delete(id); // Remove matched item to find deleted ones later
      }
    }

    // Remaining items in localMap are created
    for (const [id, localItem] of localMap.entries()) {
      result.created.push(localItem);
    }

    setDataChangedLog(result);

    // change the job state to in progress if no server annotations
    if (serverAnnotations.length === 0) {
      handleStateChange("state", "in progress");
    }

    if (result.created.length > 0) {
      // remove the id from the created data
      let payload = JSON.parse(JSON.stringify([...result.created]));
      payload.forEach((item) => {
        delete item.id;
      });
      postAnnotationMutation.mutate({
        data: {
          shapes: payload,
        },
        jobId: jobId,
      });
      tempTotalMutation++;
    }
    if (result.updated.length > 0) {
      putAnnotationMutation.mutate({
        data: {
          shapes: result.updated,
        },
        jobId: jobId,
      });
      tempTotalMutation++;
    }
    if (result.deleted.length > 0) {
      removeAnnotationMutation.mutate({
        data: {
          shapes: result.deleted,
        },
        jobId: jobId,
      });
      tempTotalMutation++;
    }

    setMutationCount((prev) => ({
      ...prev,
      totalMutation: tempTotalMutation,
    }));

    if (
      result.created.length === 0 &&
      result.updated.length === 0 &&
      result.deleted.length === 0
    ) {
      toast("No changes to save");
    }
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

  const isChangeMade = () => {
    let isChange = false;

    if (regions.length !== getAllAnnotations?.data?.shapes?.length) {
      isChange = true;
    } else if (regions.length > 0) {
      regions.forEach((region, index) => {
        const serverRegion = getAllAnnotations?.data?.shapes[index];
        if (
          region.start !== serverRegion.points[0] ||
          region.end !== serverRegion.points[2]
        ) {
          console.log("start end not matching");
          isChange = true;
        } else if (
          region.data.accent !== serverRegion.accent ||
          region.data.age !== serverRegion.age ||
          region.data.emotion !== serverRegion.emotion ||
          region.data.locale !== serverRegion.locale ||
          region.data.gender !== serverRegion.gender ||
          region.data.transcription !== serverRegion.transcript
        ) {
          console.log("other data not matching");
          isChange = true;
        } else if (region.data.label.id !== serverRegion.label_id) {
          console.log("label id not matching");
          isChange = true;
        }

        if (region.data.label.id === serverRegion.label_id) {
          for (let i = 0; i < region.data.label.attributes.length; i++) {
            if (
              region.data.label.attributes[i].id !==
                serverRegion.attributes[i].spec_id ||
              region.data.label.attributes[i].values[0] !==
                serverRegion.attributes[i].value
            ) {
              console.log("attributes not matching");
              isChange = true;
            }
          }
        }
      });
    }

    return isChange;
  };

  useEffect(() => {
    const unloadCallback = (e) => {
      if (isChangeMade()) {
        e.preventDefault();
        e.returnValue = true;
      }
    };

    window.addEventListener("beforeunload", unloadCallback);

    return () => {
      window.removeEventListener("beforeunload", unloadCallback);
    };
  }, [regions]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const isSaveLoading = () => {
    return (
      postAnnotationMutation?.isLoading ||
      putAnnotationMutation?.isLoading ||
      removeAnnotationMutation?.isLoading
    );
  };

  useEffect(() => {
    if (
      mutationCount.totalMutation > 0 &&
      mutationCount.totalMutation === mutationCount.successMutation
    ) {
      toast.success("Data saved successfully");
      setMutationCount({
        totalMutation: 0,
        successMutation: 0,
      });
    }
  }, [mutationCount]);

  useEffect(() => {
    if (currentTab === 0 && conflicts.length > 0) {
      removeMissingRegionsFromGroundTruth();
    } else if (
      currentTab === 1 &&
      conflicts.length > 0 &&
      gtAnnotations.length > 0
    ) {
      generateMissingRegionsFromGroundTruth();
    }
  }, [currentTab, conflicts, gtAnnotations]);

  return (
    <>
      <TopBar
        getJobDetailQuery={getJobDetailQuery}
        jobUpdateMutation={jobUpdateMutation}
        handleStateChange={handleStateChange}
        isScrolled={isScrolled}
        jobId={jobId}
        onSave={handleSave}
        saveLoading={isSaveLoading()}
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
                      {regions.map((regionProps, regionIdx) => {
                        const tempRegion = { ...regionProps };
                        if (
                          currentAnnotationIndex >= 0 &&
                          regionIdx === currentAnnotationIndex
                        ) {
                          tempRegion.color = "rgba(16,255,0, 0.5)";
                        }

                        return (
                          <Region
                            // onOut={() => {
                            //   alert("onOut");
                            //   // setIsPlaying(false);
                            // }}
                            onUpdateEnd={handleRegionUpdate}
                            className="text-base font-semibold leading-6 text-gray-900"
                            key={tempRegion.id}
                            // attributes={{
                            //   label: updatedLabel,
                            // }}
                            {...tempRegion}
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
                      horizontalZoom={horizontalZoom}
                      setHorizontalZoom={setHorizontalZoom}
                      undoStackRef={undoStackRef}
                      redoStackRef={redoStackRef}
                      //
                      handleBackward={handleBackward}
                      handleForward={handleForward}
                      handlePlay={handlePlay}
                    />
                  )}
                </div>

                {regions[currentAnnotationIndex]?.data?.label ? (
                  <div className="w-1/2 mx-auto">
                    <EditableFields
                      inputTextRef={inputTextRef}
                      totalDuration={totalDuration}
                      regions={regions}
                      setRegions={setRegions}
                      currentAnnotationIndex={currentAnnotationIndex}
                      undoStackRef={undoStackRef}
                      redoStackRef={redoStackRef}
                      getLabelsQuery={getLabelsQuery}
                      getJobDetailQuery={getJobDetailQuery}
                    />

                    {/* Action buttons */}
                    <div className="flex-shrink-0 border-t border-gray-200 my-8 py-4">
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          className="rounded-md bg-white px-3 py-2 text-sm font-medium text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                          onClick={() => setDeleteModal(true)}
                          disabled={removeAnnotationMutation.isLoading}
                          ref={deleteButtonRef}
                        >
                          Delete
                        </button>
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
                currentAnnotationIndex={currentAnnotationIndex}
                handleRegionClick={handleRegionClick}
                onDelete={(index) => {
                  setCurrentAnnotationIndex(index);
                  setDeleteModal(true);
                }}
              />
            ) : (
              <ConflictsList
                conflicts={conflicts}
                setConflicts={setConflicts}
                oneTimeApiCallRef={oneTimeApiCallRef}
                handleRegionClick={handleRegionClick}
                currentAnnotationIndex={currentAnnotationIndex}
                setGtAnnotations={setGtAnnotations}
                regions={regions}
              />
            )}
          </div>
        </div>
      </main>

      <AlertModal
        open={deleteModal}
        setOpen={setDeleteModal}
        onSuccess={() => removeCurrentRegion()}
        onCancel={() => setDeleteModal(false)}
        text="Are you sure, you want to delete this annotation?"
        isLoading={removeAnnotationMutation.isLoading}
      />

      {isSaveLoading() && (
        <div
          aria-live="assertive"
          className="fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6  bg-gray-500 bg-opacity-75 z-50"
        >
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={isSaveLoading()}
            className="flex w-full flex-col items-center space-y-4 sm:items-end"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Spinner
                      aria-hidden="true"
                      className="h-6 w-6 text-green-400"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      Processing...
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Please wait while we save your changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      )}
    </>
  );
}

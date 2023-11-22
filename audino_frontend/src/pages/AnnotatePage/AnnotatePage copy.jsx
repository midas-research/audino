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
import MinimapPlugin from "wavesurfer.js/dist/plugin/wavesurfer.minimap.min";
import MarkersPlugin from "wavesurfer.js/src/plugin/markers";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import AppBar from "../../components/AppBar/AppBar";
import { json, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectRequest } from "../../store/Actions/projectAction";
import { fetchTaskRequest } from "../../store/Actions/taskAction";
import {
  BackwardIcon,
  ForwardIcon,
  MagnifyingGlassMinusIcon,
  PauseCircleIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import CustomInput from "../../components/CustomInput/CustomInput";
import CustomSelect from "../../components/CustomInput/CustomSelect";
import { MagnifyingGlassPlusIcon } from "@heroicons/react/20/solid";
import { createAnnotationRequest } from "../../store/Actions/annotateAction";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteAnnotationAPi,
  fetchAllAnnotationApi,
  fetchAnnotationDataApi,
  fetchJobDetailApi,
  postAnnotationApi,
  putAnnotationApi,
} from "../../services/job.services";
import { fetchLabelsApi } from "../../services/project.services";
import { toast, Toaster } from "react-hot-toast";

/**
 * @param min
 * @param max
 * @returns {*}
 */
function generateNum(min, max) {
  return Math.random() * (max - min + 1) + min;
}

/**
 * @param distance
 * @param min
 * @param max
 * @returns {([*, *]|[*, *])|*[]}
 */
function generateTwoNumsWithDistance(distance, min, max) {
  const num1 = generateNum(min, max);
  const num2 = generateNum(min, max);
  // if num2 - num1 < 10
  if (num2 - num1 >= 10) {
    return [num1, num2];
  }
  return generateTwoNumsWithDistance(distance, min, max);
}

export default function AnnotatePage({}) {
  const { taskId: taskId } = useParams();
  const { id: jobId } = useParams();
  const dispatch = useDispatch();
  const { task, isTaskLoading } = useSelector((state) => state.taskReducer);
  const { project, isProjectLoading } = useSelector(
    (state) => state.projectReducer
  );
  const { isCreateAnnotationLoading } = useSelector(
    (state) => state.annotationReducer
  );

  const [timelineVis, setTimelineVis] = useState(true);
  const [currentJob, setCurrentJob] = useState(null);
  const [zoom, setZoom] = useState(0);

  const [markers, setMarkers] = useState([]);

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
      {
        plugin: MinimapPlugin,
      },
    ].filter(Boolean);
  }, [timelineVis]);

  const toggleTimeline = useCallback(() => {
    setTimelineVis(!timelineVis);
  }, [timelineVis]);

  const [regions, setRegions] = useState([]);
  const [isWaveformLoading, setIsWaveformLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);

  const regionsRef = useRef(regions);

  useEffect(() => {
    regionsRef.current = regions;
    // console.log(regionsRef.current);
  }, [regions]);

  const regionCreatedHandler = useCallback(
    (region) => {
      console.log("region-created --> region:", region);

      if (region.data.systemRegionId) return;

      // generateRegion(region.start, region.end);
      setRegions([...regionsRef.current, { ...region }]);

      setSelectedSegment({
        ...region,
      });
    },
    [regionsRef]
  );

  const wavesurferRef = useRef();

  const handleWSMount = useCallback(
    (waveSurfer) => {
      setIsWaveformLoading(true);
      if (waveSurfer.markers) {
        waveSurfer.clearMarkers();
      }

      wavesurferRef.current = waveSurfer;

      if (wavesurferRef.current) {
        wavesurferRef.current.on("region-created", regionCreatedHandler);

        wavesurferRef.current.on("ready", () => {
          console.log("WaveSurfer is ready");
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
          console.log(r);
          e.stopPropagation();
          setIsPlaying(true);
          setSelectedSegment(r);
          r.play();
        });

        if (window) {
          window.surferidze = wavesurferRef.current;
        }
      }
    },
    [regionCreatedHandler]
  );

  const generateMarker = useCallback(() => {
    if (!wavesurferRef.current) return;
    const minTimestampInSeconds = 0;
    const maxTimestampInSeconds = wavesurferRef.current.getDuration();
    const distance = generateNum(0, 10);
    const [min] = generateTwoNumsWithDistance(
      distance,
      minTimestampInSeconds,
      maxTimestampInSeconds
    );

    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    setMarkers([
      ...markers,
      {
        label: `custom-${generateNum(0, 9999)}`,
        time: min,
        color: `rgba(${r}, ${g}, ${b}, 0.5)`,
      },
    ]);
  }, [markers, wavesurferRef]);

  const removeLastRegion = useCallback(() => {
    let nextRegions = [...regions];

    nextRegions.pop();

    setRegions(nextRegions);
    setSelectedSegment(null);
  }, [regions]);

  // remove annotation data
  const removeAnnotationMutation = useMutation({
    mutationFn: deleteAnnotationAPi,
    onSuccess: (data, { id, index }) => {
      console.log("data", data);
      toast.success(`Annotation deleted successfully`);
      // Update the regions
      setRegions((prevRegions) =>
        prevRegions.filter((reg) => reg.id !== selectedSegment.id)
      );
      setSelectedSegment(null);
    },
  });

  const removeCurrentRegion = () => {
    if (selectedSegment?.id) {
      const hasWavesurfer = /wavesurfer/i.test(selectedSegment.id);
      if (!hasWavesurfer) {
        removeAnnotationMutation.mutate({
          data: {},
          jobId,
          annotationId: selectedSegment.id,
        });
      } else {
        setRegions((prevRegions) =>
          prevRegions.filter((reg) => reg.id !== selectedSegment.id)
        );
        setSelectedSegment(null);
      }
    } else {
      toast.error("Please select a segment to delete");
    }
  };

  
  const removeLastMarker = useCallback(() => {
    let nextMarkers = [...markers];

    nextMarkers.pop();

    setMarkers(nextMarkers);
  }, [markers]);

  const shuffleLastMarker = useCallback(() => {
    setMarkers((prev) => {
      const next = [...prev];
      let lastIndex = next.length - 1;

      const minTimestampInSeconds = 0;
      const maxTimestampInSeconds = wavesurferRef.current.getDuration();
      const distance = generateNum(0, 10);
      const [min] = generateTwoNumsWithDistance(
        distance,
        minTimestampInSeconds,
        maxTimestampInSeconds
      );

      next[lastIndex] = {
        ...next[lastIndex],
        time: min,
      };

      return next;
    });
  }, []);

  const handlePlay = useCallback(() => {
    wavesurferRef.current.playPause();
    setIsPlaying(!isPlaying);
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
        if (
          !updatedRegion[regionIndex].data.hasOwnProperty("transcription") &&
          !updatedRegion[regionIndex].data.hasOwnProperty("labels")
        ) {
          const r = generateNum(0, 255);
          const g = generateNum(0, 255);
          const b = generateNum(0, 255);

          updatedRegion[regionIndex].start = region.start.toFixed(2);
          updatedRegion[regionIndex].end = region.end.toFixed(2);
          updatedRegion[regionIndex].color = `rgba(${r}, ${g}, ${b}, 0.5)`;
          updatedRegion[regionIndex].attributes.label =
            "#" + r.toString().slice(0, 2);
          updatedRegion[regionIndex].data.transcription = "";
          updatedRegion[regionIndex].data.labels = getLabelsForRegion();
        } else {
          // update the region start time and end time only
          updatedRegion[regionIndex].start = region.start.toFixed(2);
          updatedRegion[regionIndex].end = region.end.toFixed(2);
        }
        updatedRegion[regionIndex].data.isSaved = false;
        setRegions(updatedRegion);
        setSelectedSegment(updatedRegion[regionIndex]);
      }
    },
    [regions]
  );

  const handleZoomChange = (event) => {
    const newZoom = event.target.value;
    setZoom(newZoom);
    wavesurferRef.current.zoom(newZoom);
  };

  const handleForward = useCallback(() => {
    wavesurferRef.current.skipForward(5);
    if (isPlaying) setIsPlaying(true);
  }, [isPlaying]);

  const handleBackward = useCallback(() => {
    wavesurferRef.current.skipBackward(5);
    if (isPlaying) setIsPlaying(true);
  }, [isPlaying]);

  const handleOnChangeLabel = (attr, event, id, labelId) => {
    const { name, value } = event.target;
    let newValue = [value];
    if (attr.input_type === "select") {
      // Multiple select
      newValue = [...event.target.options]
        .filter((option) => option.selected)
        .map((x) => x.value);

      // console.log("handleOnChangeLabel",updatedSelectedValues);
    }
    const updatedRegion = [...regions];
    const regionIndex = regions.findIndex((reg) => reg.id === id);
    const newState = updatedRegion[regionIndex];

    const label = newState.data.labels.find((l) => l.id === labelId);

    // If the label is found, find the attribute with the specified attributeId
    if (label) {
      const attribute = label.attributes.find((a) => a.id === attr.id);

      // If the attribute is found, update its values array
      if (attribute) {
        attribute.values = newValue;
      } else {
        attribute.values = [];
      }
    }
    console.log("newState", newState);
    updatedRegion[regionIndex] = newState;

    setRegions(updatedRegion);
  };

  const currentRegionValue = (labelId, attrId) => {
    const regionIndex = regions.findIndex(
      (reg) => reg.id === selectedSegment.id
    );
    // console.log("labelId", labelId, attrId, regions[regionIndex]);
    if (!regions[regionIndex].data?.labels) {
      return "";
    } else {
      const labelIndex = regions[regionIndex].data.labels.findIndex(
        (reg) => reg.id == labelId
      );
      // console.log("att", regions[regionIndex].data.labels, labelIndex);
      const attrIndex = regions[regionIndex].data.labels[
        labelIndex
      ].attributes.findIndex((reg) => reg.id == attrId);
      const attrValue =
        regions[regionIndex].data.labels[labelIndex].attributes[attrIndex]
          ?.values;
      // console.log("attrValue", attrValue);
      if (attrValue) return attrValue;
      else return "";
    }
    // return {name: attrValue, label: attrValue};
  };

  const getAllLoading = () => {
    return (
      getJobDetailQuery.isLoading ||
      getLabelsQuery.isLoading ||
      getAnnotationDataQuery.isLoading ||
      isWaveformLoading
    );
  };

  // fetch job detail using params jobId
  const getJobDetailQuery = useQuery({
    queryKey: ["job-detail", jobId],
    enabled: false,
    staleTime: Infinity,
    queryFn: () => fetchJobDetailApi({ jobId }),
    onSuccess: (data) => console.log(data),
  });

  useEffect(() => {
    if (jobId) {
      getJobDetailQuery.refetch();
    }
  }, [jobId]);

  // fetch project detail when job detail fetched
  const getLabelsQuery = useQuery({
    queryKey: ["labels", getJobDetailQuery.data?.project_id],
    enabled: false,
    staleTime: Infinity,
    queryFn: () =>
      fetchLabelsApi({
        data: {},
        params: {
          project_id: getJobDetailQuery.data?.project_id,
          org: "",
          page_size: 500,
          page: 1,
        },
      }),
    onSuccess: (data) => console.log(data),
  });

  // fetch annotation data when job detail fetched
  const getAnnotationDataQuery = useQuery({
    queryKey: ["annotation-data"],
    enabled: false,
    staleTime: Infinity,
    queryFn: () =>
      fetchAnnotationDataApi({
        id: taskId,
        org: "",
      }),
    onSuccess: (data) =>
      wavesurferRef.current.load(
        process.env.REACT_APP_BACKEND_FILE_URL + data.file
      ),
  });

  // fetch all annotations when job detail fetched
  const getAllAnnotations = useQuery({
    queryKey: ["annotations"],
    enabled: false,
    staleTime: Infinity,
    queryFn: () =>
      fetchAllAnnotationApi({
        id: jobId,
        org: "",
      }),
    onSuccess: (data) => {
      const updatedData = data.map((item) => {
        return {
          id: item.id,
          start: item.start,
          end: item.end,
          color: item.color,
          attributes: {
            label: item.name,
          },
          data: {
            isSaved: true,
            transcription: item.transcription,
            systemRegionId: item.id,
            labels:
              item.labels &&
              item.labels.map((label) => {
                return {
                  id: label.label,
                  name: label.name,
                  attributes:
                    label.attributes &&
                    label.attributes.map((attr) => {
                      return {
                        id: attr.attribute,
                        name: attr.name,
                        values: attr.values,
                      };
                    }),
                };
              }),
          },
        };
      });
      setRegions(updatedData);

      console.log("all annotations", data);
    },
  });

  useEffect(() => {
    if (getJobDetailQuery.data?.project_id) {
      getAnnotationDataQuery.refetch();
      getAllAnnotations.refetch();
      getLabelsQuery.refetch();
    }
  }, [getJobDetailQuery.data?.project_id]);

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
    const distance = generateNum(0, 10);
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
      setRegions([
        ...regions,
        {
          id: `custom-${generateNum(0, 9999)}`,
          start: min.toFixed(2),
          end: max.toFixed(2),
          color: `rgba(${r}, ${g}, ${b}, 0.5)`,
          attributes: {
            label: "#" + r.toString().slice(0, 2),
          },
          data: {
            isSaved: false,
            transcription: "",
            labels: labels,
          },
        },
      ]);
    }
  }, [regions, wavesurferRef, getLabelsQuery]);

  // post annotation data
  const postAnnotationMutation = useMutation({
    mutationFn: postAnnotationApi,
    onSuccess: (data, { id, index }) => {
      console.log("data", data);
      toast.success(`Annotation ${data.name} saved successfully`);
      // Update the region object with backend id
      const updatedRegion = [...regions];
      const regionIndex = regions.findIndex(
        (reg) => reg.id === selectedSegment.id
      );
      updatedRegion[regionIndex].id = data.id;
      updatedRegion[regionIndex].data.isSaved = true;
      setRegions(updatedRegion);
      setSelectedSegment(updatedRegion[regionIndex]);
      getAllAnnotations.data.push(updatedRegion[regionIndex]);
    },
  });

  // put annotation data
  const putAnnotationMutation = useMutation({
    mutationFn: putAnnotationApi,
    onSuccess: (data, { id, index }) => {
      console.log("data", data);
      toast.success(`Annotation ${data.name} edited successfully`);
      // Update the region object with backend id
      const updatedRegion = [...regions];
      const regionIndex = regions.findIndex(
        (reg) => reg.id === selectedSegment.id
      );
      updatedRegion[regionIndex].id = data.id;
      updatedRegion[regionIndex].data.isSaved = true;
      setRegions(updatedRegion);
      setSelectedSegment(updatedRegion[regionIndex]);
    },
  });

  const handleSave = () => {
    // Initialize an empty payload object
    const tempLabels = [];

    // Loop through the labels in your state
    for (const label of selectedSegment.data.labels) {
      // Create a new label object for the payload
      const labelPayload = {
        id: label.id,
        attributes: [],
      };

      // Loop through the attributes in each label
      for (const attribute of label.attributes) {
        // Create a new attribute object for the payload
        const attributePayload = {
          id: attribute.id,
          values: attribute.values,
        };

        // Add the attribute to the label payload
        labelPayload.attributes.push(attributePayload);
      }

      // Add the label payload to the overall payload
      tempLabels.push(labelPayload);
    }
    console.log("selectedSegment", selectedSegment.id);
    console.log("getAllAnnotations.data", getAllAnnotations.data);
    // check if the region is already saved or not
    const regionIndex = getAllAnnotations.data.findIndex(
      (reg) => reg.id === selectedSegment.id
    );
    const payload = {
      id: selectedSegment.id,
      name: selectedSegment.attributes.label,
      start: selectedSegment.start,
      end: selectedSegment.end,
      color: selectedSegment.color,
      transcription: selectedSegment.data.transcription,
      label: tempLabels,
    };
    if (regionIndex < 0) {
      postAnnotationMutation.mutate({ data: payload, jobId: jobId });
    } else {
      console.log("editing....");
      putAnnotationMutation.mutate({ data: payload, jobId: jobId });
    }
  };

  const textAreaValue = () => {
    const regionIndex = regions.findIndex(
      (reg) => reg.id === selectedSegment.id
    );
    return regions[regionIndex].data.transcription;
  };

  console.log("regions --->>> ", regions);
  console.log("selectedsegment --->>> ", selectedSegment);
  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Annotate #{jobId}
              {getJobDetailQuery.data?.task &&
                `- ${getJobDetailQuery.data?.task.name}`}
            </h1>
          </div>
        </header>
      </AppBar>
      <main className="-mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full"> */}
        <div className="bg-white shadow min-h-full rounded-lg">
          {
            <>
              {getAllLoading() ? (
                <div className="p-2">
                  {[...Array(1).keys()].map((val) => (
                    <div
                      key={`annotatehead-${val}`}
                      className="h-16 bg-gray-200 rounded-md w-full mb-2.5 pt-4 animate-pulse"
                    ></div>
                  ))}{" "}
                </div>
              ) : (
                <div className="px-4 py-5 sm:px-6 flex flex-wrap items-center justify-between sm:flex-nowrap border-b border-gray-200 ">
                  <div className="">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      Audio: {getAnnotationDataQuery.data.filename}
                    </h3>
                  </div>
                </div>
              )}
              {/* </div> */}
              <div className="p-6">
                <WaveSurfer plugins={plugins} onMount={handleWSMount}>
                  <WaveForm
                    id="waveform"
                    cursorColor="transparent"
                    waveColor="#65B892"
                  >
                    {regions.map((regionProps) => {
                      const tempRegion = { ...regionProps };

                      return (
                        <Region
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
                    {[...Array(2).keys()].map((val) => (
                      <div
                        key={`annotButton-${val}`}
                        className="h-16 bg-gray-200 rounded-md w-full mb-2.5 pt-4 animate-pulse"
                      ></div>
                    ))}{" "}
                  </div>
                ) : (
                  <>
                    <div className="mt-6 flex gap-2 mx-auto justify-center">
                      <PrimaryButton onClick={generateRegion}>
                        Generate random region
                      </PrimaryButton>
                      {/* <PrimaryButton onClick={generateMarker}>
                        Generte Marker
                      </PrimaryButton> */}
                      {/* <PrimaryButton onClick={removeLastRegion}>
                        Remove last region
                      </PrimaryButton> */}
                      <PrimaryButton
                        onClick={removeCurrentRegion}
                        loading={removeAnnotationMutation.isLoading}
                      >
                        Remove current region
                      </PrimaryButton>
                      {/* <PrimaryButton onClick={removeLastMarker}>
                        Remove last marker
                      </PrimaryButton> */}
                      {/* <PrimaryButton onClick={shuffleLastMarker}>
                        Shuffle last marker
                      </PrimaryButton> */}
                      <PrimaryButton onClick={toggleTimeline}>
                        Toggle timeline
                      </PrimaryButton>
                    </div>
                    <div className="isolate flex justify-center mx-auto mt-8">
                      <button
                        type="button"
                        className="relative inline-flex items-center rounded-l-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                        onClick={handleBackward}
                      >
                        <span className="sr-only">Backward</span>
                        <BackwardIcon
                          className="h-10 w-10"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        className="relative inline-flex items-center bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                        onClick={handlePlay}
                      >
                        <span className="sr-only">Play/ Pause</span>
                        {isPlaying ? (
                          <PauseCircleIcon
                            className="h-10 w-10 text-audino-primary"
                            aria-hidden="true"
                          />
                        ) : (
                          <PlayCircleIcon
                            className="h-10 w-10"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
                        onClick={handleForward}
                      >
                        <span className="sr-only">Forward</span>
                        <ForwardIcon className="h-10 w-10" aria-hidden="true" />
                      </button>
                    </div>
                    {/* zoom slider */}
                    <div className="flex items-center gap-2 justify-center mx-auto mt-4">
                      <MagnifyingGlassMinusIcon className="h-6 w-6 text-audino-primary" />
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={zoom}
                        onChange={handleZoomChange}
                        className="h-6 w-24 mx-2"
                      />
                      <MagnifyingGlassPlusIcon className="h-6 w-6 text-audino-primary" />
                    </div>
                  </>
                )}
              </div>

              {selectedSegment ? (
                <div className="w-1/2 mx-auto">
                  {/* table info */}
                  <div className="px-4 sm:px-0">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">
                      Segment Details
                    </h3>
                    {/* <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Personal details and application.</p> */}
                  </div>
                  <div className="mt-6 border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Segment name
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          {selectedSegment.attributes.label}
                        </dd>
                      </div>
                      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          Start time
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          {selectedSegment.start} sec
                        </dd>
                      </div>
                      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          End time
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          {selectedSegment.end} sec
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mb-4 pt-4 border-t border-gray-100">
                    <label
                      htmlFor="transcription"
                      className="block text-sm font-medium leading-6 text-gray-900 mb-2"
                    >
                      Segment transcription
                    </label>
                    <CustomInput
                      type="text"
                      inputType="textarea"
                      name="transcription"
                      id="transcription"
                      // formError={formError}
                      placeholder="Transcription"
                      value={textAreaValue()}
                      onChange={(e) => {
                        const updatedRegion = [...regions];
                        const regionIndex = updatedRegion.findIndex(
                          (reg) => reg.id === selectedSegment.id
                        );
                        updatedRegion[regionIndex].data.transcription =
                          e.target.value;
                        setRegions(updatedRegion);
                      }}
                    />
                  </div>

                  <div className="mt-6 border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                      {getLabelsQuery?.data.map((label, index) => (
                        <div
                          className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
                          key={`alllabels-${index}`}
                        >
                          <dt className="text-sm font-medium leading-6 text-gray-900">
                            {label.name}
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {label.attributes.map((attr) => (
                              <div
                                className="mb-4"
                                key={`projectatt-${attr.id}`}
                              >
                                <label
                                  htmlFor={attr.name}
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  {attr.name}
                                </label>
                                <CustomSelect
                                  id={attr.name}
                                  name={attr.name}
                                  options={attr.values.map((label_value) => {
                                    return {
                                      label: label_value,
                                      value: label_value,
                                    };
                                  })}
                                  // formError={formError}
                                  value={currentRegionValue(label.id, attr.id)}
                                  // value={selectedSegment.proj.name}
                                  isMultiple={attr.input_type === "select"}
                                  onChange={(e) =>
                                    handleOnChangeLabel(
                                      attr,
                                      e,
                                      selectedSegment.id,
                                      label.id
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Action buttons */}
                  <div className="flex-shrink-0 border-t border-gray-200 my-8 py-4">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                        onClick={removeCurrentRegion}
                        disabled={removeAnnotationMutation.isLoading}
                      >
                        {removeAnnotationMutation.isLoading
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                      <PrimaryButton
                        onClick={() => handleSave()}
                        loading={postAnnotationMutation.isLoading}
                      >
                        Save
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          }
        </div>
      </main>
    </>
  );
}
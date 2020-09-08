import axios from "axios";
import React from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearchMinus,
  faSearchPlus,
  faBackward,
  faForward,
  faPlayCircle,
  faPauseCircle,
} from "@fortawesome/free-solid-svg-icons";
import Alert from "../components/alert";
import { IconButton, Button } from "../components/button";
import Loader from "../components/loader";

class Annotate extends React.Component {
  constructor(props) {
    super(props);

    const projectId = Number(this.props.match.params.projectid);
    const dataId = Number(this.props.match.params.dataid);

    this.state = {
      isPlaying: false,
      projectId,
      dataId,
      labels: {},
      labelsUrl: `/api/projects/${projectId}/labels`,
      dataUrl: `/api/projects/${projectId}/data/${dataId}`,
      segmentationUrl: `/api/projects/${projectId}/data/${dataId}/segmentations`,
      isDataLoading: false,
      wavesurfer: null,
      zoom: 100,
      referenceTranscription: null,
      isMarkedForReview: false,
      selectedSegment: null,
      isSegmentDeleting: false,
      errorMessage: null,
      successMessage: null,
    };

    this.labelRef = {};
    this.transcription = null;
  }

  componentDidMount() {
    const { labelsUrl, dataUrl } = this.state;
    this.setState({ isDataLoading: true });
    const wavesurfer = WaveSurfer.create({
      container: "#waveform",
      barWidth: 2,
      barHeight: 1,
      barGap: null,
      mediaControls: false,
      plugins: [
        RegionsPlugin.create(),
        TimelinePlugin.create({ container: "#timeline" }),
      ],
    });
    this.showSegmentTranscription(null);
    this.props.history.listen((location, action) => {
      wavesurfer.stop();
    });
    wavesurfer.on("ready", () => {
      wavesurfer.enableDragSelection({ color: "rgba(0, 102, 255, 0.3)" });
    });
    wavesurfer.on("region-in", (region) => {
      this.showSegmentTranscription(region);
    });
    wavesurfer.on("region-out", () => {
      this.showSegmentTranscription(null);
    });
    wavesurfer.on("region-play", (r) => {
      r.once("out", () => {
        wavesurfer.play(r.start);
        wavesurfer.pause();
      });
    });

    wavesurfer.on("region-click", (r, e) => {
      e.stopPropagation();
      this.setState({
        isPlaying: true,
        selectedSegment: r,
      });
      r.play();
    });
    wavesurfer.on("pause", (r, e) => {
      this.setState({ isPlaying: false });
    });

    axios
      .all([axios.get(labelsUrl), axios.get(dataUrl)])
      .then((response) => {
        this.setState({
          isDataLoading: false,
          labels: response[0].data,
        });

        const {
          reference_transcription,
          is_marked_for_review,
          segmentations,
          filename,
        } = response[1].data;

        const regions = segmentations.map((segmentation) => {
          return {
            start: segmentation.start_time,
            end: segmentation.end_time,
            data: {
              segmentation_id: segmentation.segmentation_id,
              transcription: segmentation.transcription,
              annotations: segmentation.annotations,
            },
          };
        });

        this.setState({
          isDataLoading: false,
          referenceTranscription: reference_transcription,
          isMarkedForReview: is_marked_for_review,
          filename,
        });

        wavesurfer.load(`/audios/${filename}`);
        wavesurfer.drawBuffer();
        const { zoom } = this.state;
        wavesurfer.zoom(zoom);

        this.setState({ wavesurfer });
        this.loadRegions(regions);
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isDataLoading: false,
        });
      });
  }

  loadRegions(regions) {
    const { wavesurfer } = this.state;
    regions.forEach((region) => {
      wavesurfer.addRegion(region);
    });
  }

  showSegmentTranscription(region) {
    this.segmentTranscription.textContent =
      (region && region.data.transcription) || "–";
  }

  handlePlay() {
    const { wavesurfer } = this.state;
    this.setState({ isPlaying: true });
    wavesurfer.play();
  }

  handlePause() {
    const { wavesurfer } = this.state;
    this.setState({ isPlaying: false });
    wavesurfer.pause();
  }

  handleForward() {
    const { wavesurfer } = this.state;
    wavesurfer.skipForward(5);
  }

  handleBackward() {
    const { wavesurfer } = this.state;
    wavesurfer.skipBackward(5);
  }

  handleZoom(e) {
    const { wavesurfer } = this.state;
    const zoom = Number(e.target.value);
    wavesurfer.zoom(zoom);
    this.setState({ zoom });
  }

  handleIsMarkedForReview(e) {
    const { dataUrl } = this.state;
    const isMarkedForReview = e.target.checked;
    this.setState({ isDataLoading: true });

    axios({
      method: "patch",
      url: dataUrl,
      data: {
        is_marked_for_review: isMarkedForReview,
      },
    })
      .then((response) => {
        this.setState({
          isDataLoading: false,
          isMarkedForReview: response.data.is_marked_for_review,
          errorMessage: null,
          successMessage: "Marked for review status changed",
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isDataLoading: false,
          errorMessage: "Error changing review status",
          successMessage: null,
        });
      });
  }

  handleSegmentDelete() {
    const { wavesurfer, selectedSegment, segmentationUrl } = this.state;
    this.setState({ isSegmentDeleting: true });
    if (selectedSegment.data.segmentation_id) {
      axios({
        method: "delete",
        url: `${segmentationUrl}/${selectedSegment.data.segmentation_id}`,
      })
        .then((response) => {
          wavesurfer.regions.list[selectedSegment.id].remove();
          this.setState({
            selectedSegment: null,
            isSegmentDeleting: false,
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            isSegmentDeleting: false,
          });
        });
    } else {
      wavesurfer.regions.list[selectedSegment.id].remove();
      this.setState({
        selectedSegment: null,
        isSegmentDeleting: false,
      });
    }
  }

  handleSegmentSave(e) {
    const { selectedSegment, segmentationUrl } = this.state;
    const { start, end } = selectedSegment;

    const {
      transcription,
      annotations,
      segmentation_id = null,
    } = selectedSegment.data;

    this.setState({ isSegmentSaving: true });

    if (segmentation_id === null) {
      axios({
        method: "post",
        url: segmentationUrl,
        data: {
          start,
          end,
          transcription,
          annotations,
        },
      })
        .then((response) => {
          const { segmentation_id } = response.data;
          selectedSegment.data.segmentation_id = segmentation_id;
          this.setState({
            isSegmentSaving: false,
            selectedSegment,
            successMessage: "Segment saved",
            errorMessage: null,
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            isSegmentSaving: false,
            errorMessage: "Error saving segment",
            successMessage: null,
          });
        });
    } else {
      axios({
        method: "put",
        url: `${segmentationUrl}/${segmentation_id}`,
        data: {
          start,
          end,
          transcription,
          annotations,
        },
      })
        .then((response) => {
          this.setState({
            isSegmentSaving: false,
            successMessage: "Segment saved",
            errorMessage: null,
          });
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            isSegmentSaving: false,
            errorMessage: "Error saving segment",
            successMessage: null,
          });
        });
    }
  }

  handleTranscriptionChange(e) {
    const { selectedSegment } = this.state;
    selectedSegment.data.transcription = e.target.value;
    this.setState({ selectedSegment });
  }

  handleLabelChange(key, e) {
    const { selectedSegment, labels } = this.state;
    selectedSegment.data.annotations = selectedSegment.data.annotations || {};
    if (labels[key]["type"] === "multiselect") {
      selectedSegment.data.annotations[key] = {
        label_id: labels[key]["label_id"],
        values: Array.from(e.target.selectedOptions, (option) => option.value),
      };
    } else {
      selectedSegment.data.annotations[key] = {
        label_id: labels[key]["label_id"],
        values: e.target.value,
      };
    }
    this.setState({ selectedSegment });
  }

  handleAlertDismiss(e) {
    e.preventDefault();
    this.setState({
      successMessage: "",
      errorMessage: "",
    });
  }

  handleDeleteData(e) {
    const { dataId, projectId } = this.state;
    const { history } = this.props;
    console.log("Data to be detelted: ", dataId);
    axios({
      method: "post",
      url: "/api/rmdata",
      data: {
        dataId,
        projectId
      },
    })
      .then((response) => {
        if (response.status === 201) {
          this.setState({ successMessage: response.data.message });
        }
        // TODO: Then revert to the index page
        console.log("history ", history);
        history.replace({ pathname: "/empty" });
        setTimeout(() => {
          history.replace({ pathname: `/projects/${projectId}/data` });
        });
      })
      .catch((error) => {
        console.log(error.response);
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: "",
          isSubmitting: false,
        });
      });
  }

  render() {
    const {
      zoom,
      isPlaying,
      labels,
      isDataLoading,
      isMarkedForReview,
      referenceTranscription,
      selectedSegment,
      isSegmentDeleting,
      isSegmentSaving,
      errorMessage,
      successMessage,
    } = this.state;
    return (
      <div>
        <Helmet>
          <title>Annotate</title>
        </Helmet>
        <div className="container h-100">
          <div className="h-100 mt-5 text-center">
            {errorMessage ? (
              <Alert
                type="danger"
                message={errorMessage}
                onClose={(e) => this.handleAlertDismiss(e)}
              />
            ) : null}
            {successMessage ? (
              <Alert
                type="success"
                message={successMessage}
                onClose={(e) => this.handleAlertDismiss(e)}
              />
            ) : null}
            {isDataLoading ? <Loader /> : null}
            <div className="row justify-content-md-center my-4">
              <div ref={(el) => (this.segmentTranscription = el)}></div>
              <div id="waveform"></div>
              <div id="timeline"></div>
            </div>
            {!isDataLoading ? (
              <div>
                <div className="row justify-content-md-center my-4">
                  <div className="col-1">
                    <IconButton
                      icon={faBackward}
                      size="2x"
                      title="Skip Backward"
                      onClick={() => {
                        this.handleBackward();
                      }}
                    />
                  </div>
                  <div className="col-1">
                    {!isPlaying ? (
                      <IconButton
                        icon={faPlayCircle}
                        size="2x"
                        title="Play"
                        onClick={() => {
                          this.handlePlay();
                        }}
                      />
                    ) : null}
                    {isPlaying ? (
                      <IconButton
                        icon={faPauseCircle}
                        size="2x"
                        title="Pause"
                        onClick={() => {
                          this.handlePause();
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="col-1">
                    <IconButton
                      icon={faForward}
                      size="2x"
                      title="Skip Forward"
                      onClick={() => {
                        this.handleForward();
                      }}
                    />
                  </div>
                </div>
                <div className="row justify-content-center">
                  <div className="col-1">
                    <FontAwesomeIcon icon={faSearchMinus} title="Zoom out" />
                  </div>
                  <div className="col-2">
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={zoom}
                      onChange={(e) => this.handleZoom(e)}
                    />
                  </div>
                  <div className="col-1">
                    <FontAwesomeIcon icon={faSearchPlus} title="Zoom in" />
                  </div>
                </div>
                <div className="row justify-content-center my-4">
                  {referenceTranscription ? (
                    <div className="form-group">
                      <label className="font-weight-bold">
                        Reference Transcription
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        cols="50"
                        disabled={true}
                        value={referenceTranscription}
                      ></textarea>
                    </div>
                  ) : null}
                </div>
                {selectedSegment ? (
                  <div>
                    <div className="row justify-content-center my-4">
                      <div className="form-group">
                        <label className="font-weight-bold">
                          Segment Transcription
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          cols="50"
                          value={
                            (selectedSegment &&
                              selectedSegment.data.transcription) ||
                            ""
                          }
                          onChange={(e) => this.handleTranscriptionChange(e)}
                          ref={(el) => (this.transcription = el)}
                        ></textarea>
                      </div>
                    </div>
                    <div className="row justify-content-center my-4">
                      {Object.entries(labels).map(([key, value], index) => {
                        if (!value["values"].length) {
                          return null;
                        }
                        return (
                          <div className="col-3 text-left" key={index}>
                            <label htmlFor={key} className="font-weight-bold">
                              {key}
                            </label>

                            <select
                              className="form-control"
                              name={key}
                              multiple={
                                value["type"] === "multiselect" ? true : false
                              }
                              value={
                                (selectedSegment &&
                                  selectedSegment.data.annotations &&
                                  selectedSegment.data.annotations[key] &&
                                  selectedSegment.data.annotations[key][
                                  "values"
                                  ]) ||
                                (value["type"] === "multiselect" ? [] : "")
                              }
                              onChange={(e) => this.handleLabelChange(key, e)}
                              ref={(el) => (this.labelRef[key] = el)}
                            >
                              {value["type"] !== "multiselect" ? (
                                <option value="-1">Choose Label Type</option>
                              ) : null}
                              {value["values"].map((val) => {
                                return (
                                  <option
                                    key={val["value_id"]}
                                    value={`${val["value_id"]}`}
                                  >
                                    {val["value"]}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                    <div className="row justify-content-center my-4">
                      <div className="col-2">
                        <Button
                          size="lg"
                          type="danger"
                          disabled={isSegmentDeleting}
                          isSubmitting={isSegmentDeleting}
                          onClick={(e) => this.handleSegmentDelete(e)}
                          text="Delete"
                        />
                      </div>
                      <div className="col-2">
                        <Button
                          size="lg"
                          type="primary"
                          disabled={isSegmentSaving}
                          onClick={(e) => this.handleSegmentSave(e)}
                          isSubmitting={isSegmentSaving}
                          text="Save"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="row justify-content-center my-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isMarkedForReview"
                      value={true}
                      checked={isMarkedForReview}
                      onChange={(e) => this.handleIsMarkedForReview(e)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="isMarkedForReview"
                    >
                      Mark for review
                    </label>
                    <Button
                      size="lg"
                      type="primary"
                      disabled={isDataLoading ? true : false}
                      onClick={(e) => this.handleDeleteData(e)}
                      text="Delete DataPoint"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Annotate);

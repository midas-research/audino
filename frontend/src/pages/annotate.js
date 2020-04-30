import $ from "jquery";
import axios from "axios";
import React from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";
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
import { IconButton } from "../components/button";
import Loader from "../components/loader";

class Annotate extends React.Component {
  constructor(props) {
    super(props);

    const projectId = Number(this.props.match.params.projectid);
    const dataId = Number(this.props.match.params.dataid);

    const { location } = this.props;
    this.state = {
      isPlaying: true,
      projectId,
      dataId,
      segmentations: [],
      labels: {},
      getLabelsUrl: `/api/projects/${projectId}/labels`,
      getDataUrl: `/api/projects/${projectId}/data/${dataId}`,
      isDataLoading: false,
    };
  }

  componentDidMount() {
    const { getLabelsUrl, getDataUrl } = this.state;
    this.setState({ isDataLoading: true });
    const wavesurfer = WaveSurfer.create({
      container: "#waveform",
      barWidth: 2,
      barHeight: 1,
      barGap: null,
      mediaControls: false,
      plugins: [RegionsPlugin.create()],
    });
    wavesurfer.on("ready", function () {
      wavesurfer.play();
    });
    axios({
      method: "get",
      url: getLabelsUrl,
    })
      .then((response) => {
        this.setState({
          isDataLoading: false,
          labels: response.data,
        });
        wavesurfer.load("/audios/f0f026d0060c4153a83cf48e94545824.wav");
        wavesurfer.drawBuffer();
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isDataLoading: false,
        });
      });

    // axios({
    //   method: "get",
    //   url: getDataUrl,
    // })
    //   .then((response) => {
    //     // wavesurfer.load(`/audios/${response.data.filename}`);
    //     this.setState({
    //       isDataLoading: false,
    //       data: response.data,
    //     });
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     this.setState({
    //       isDataLoading: false,
    //     });
    //   });
  }

  render() {
    const { zoomValue, isPlaying, labels, isDataLoading } = this.state;
    return (
      <div>
        <Helmet>
          <title>Annotate</title>
        </Helmet>
        <div className="container h-100">
          <div className="h-100 mt-5 text-center">
            {isDataLoading ? <Loader /> : null}
            <div id="waveform"></div>
            {!isDataLoading ? (
              <div>
                <div className="row justify-content-md-center my-4">
                  <div className="col-1">
                    <IconButton
                      icon={faBackward}
                      size="2x"
                      title="Skip Backward"
                    />
                  </div>
                  <div className="col-1">
                    {!isPlaying ? (
                      <IconButton icon={faPlayCircle} size="2x" title="Play" />
                    ) : null}
                    {isPlaying ? (
                      <IconButton
                        icon={faPauseCircle}
                        size="2x"
                        title="Pause"
                      />
                    ) : null}
                  </div>
                  <div className="col-1">
                    <IconButton
                      icon={faForward}
                      size="2x"
                      title="Skip Forward"
                    />
                  </div>
                </div>
                <div className="row justify-content-md-center">
                  <div className="col-1">
                    <FontAwesomeIcon icon={faSearchMinus} title="Zoom out" />
                  </div>
                  <div className="col-2">
                    <input
                      ref={(el) => (this.zoomSlider = el)}
                      type="range"
                      min="1"
                      max="200"
                      value={zoomValue}
                    />
                  </div>
                  <div className="col-1">
                    <FontAwesomeIcon icon={faSearchPlus} title="Zoom in" />
                  </div>
                </div>
                <div className="row">
                  {Object.entries(labels).map(([key, value], index) => {
                    return (
                      <div className="col-3 text-left" key={index}>
                        <label
                          htmlFor={labels[key]}
                          className="font-weight-bold"
                        >
                          {key}
                        </label>

                        <select
                          className="form-control"
                          name={key}
                          multiple={
                            value["type"] == "multiselect" ? true : false
                          }
                        >
                          <option value="-1">Choose Label Type</option>
                          <option value="1">Select</option>
                          <option value="2">Multi-Select</option>
                        </select>
                      </div>
                    );
                  })}
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

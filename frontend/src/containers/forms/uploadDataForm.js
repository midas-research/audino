import React from "react";
import { withRouter } from "react-router";
import Dropzone from "react-dropzone-uploader";
import { withStore } from "@spyna/react-store";
import "react-dropzone-uploader/dist/styles.css";

class UploadDataForm extends React.Component {
  constructor(props) {
    super(props);

    const projectId = this.props.projectId;

    this.initialState = {
      projectId,
      addDataUrl: `/api/projects/${projectId}/upload`,
    };

    this.state = Object.assign({}, this.initialState);
    console.log(this.props);
  }

  getUploadParams = ({ file, meta }) => {
    const body = new FormData();
    body.append("fileField", file);
    return {
      url: this.state.addDataUrl,
      body,
      headers: {
        Authorization: localStorage.getItem("access_token"),
      },
    };
  };

  handleSubmit = (files, allFiles) => {
    allFiles.forEach((f) => f.remove());
  };

  render() {
    return (
      <Dropzone
        onSubmit={this.handleSubmit}
        getUploadParams={this.getUploadParams}
        accept="application/zip,application/x-zip,application/x-zip-compressed,application/octet-stream, audio/*, application/json"
      />
    );
  }
}

export default withStore(withRouter(UploadDataForm));

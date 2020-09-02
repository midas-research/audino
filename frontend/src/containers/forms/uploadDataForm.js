import React from 'react';
import { withRouter } from "react-router";
import Dropzone from 'react-dropzone-uploader';
import { withStore } from "@spyna/react-store";
import 'react-dropzone-uploader/dist/styles.css'

class UploadDataForm extends React.Component {
    constructor(props) {
        super(props);

        const projectId = this.props.projectId;
        const userId = this.props.userId;

        this.initialState = {
            userId,
            projectId,
            addDataUrl: `/api/datazip`,
        };

        this.state = Object.assign({}, this.initialState);
        console.log(this.props);
    }

    getUploadParams = ({ file, meta }) => {
        const body = new FormData()
        body.append('fileField', file)
        body.append('userId', this.state.userId)
        body.append('projectId', this.state.projectId)
        return { url: this.state.addDataUrl, body }
    }
    handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }

    render() {
        return (
            <Dropzone
                getUploadParams={this.getUploadParams}
                onChangeStatus={this.handleChangeStatus}
                accept="application/zip,application/x-zip,application/x-zip-compressed,application/octet-stream"
            // accept="image/*,audio/*,video/*"
            />
        )
    }

}

export default withStore(withRouter(UploadDataForm));

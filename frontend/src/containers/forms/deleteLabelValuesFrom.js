import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";

class DeleteLabelValuesForm extends React.Component {
  constructor(props) {
    super(props);

    const labelId = this.props.labelId;
    const projectId = this.props.projectId;
    const labelValueId = this.props.labelValueId;
    console.log(labelId, labelValueId, projectId);
    this.initialState = {
      labelId,
      projectId,
      labelValueId,
      message: `Are you sure you want to delete the label: ${labelId}`,
      refreshPath: `/labels`,
      deleteLabelValueUrl: `/api/labels/${labelId}/values/${labelValueId}`,
      errorMessage: "",
      successMessage: "",
      isSubmitting: false,
    };

    this.state = Object.assign({}, this.initialState);
  }

  resetState() {
    this.setState(this.initialState);
  }

  refreshPage() {
    const { history } = this.props;
    const { refreshPath } = this.state;
    history.replace({ pathname: "/empty" });
    setTimeout(() => {
      history.replace({
        pathname: refreshPath,
      });
    });
  }

  handleLabelDelete(e) {
    const { labelId, labelValueId, deleteLabelValueUrl } = this.state;
    console.log("The data to be deleted will be:", labelId, labelValueId);
    axios({
      method: "DELETE",
      url: deleteLabelValueUrl,
    })
      .then((response) => {
        if (response.status === 201) {
          this.setState({ successMessage: response.data.message });
        }
        this.refreshPage();
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
      labelId,
      message,
      isSubmitting,
      errorMessage,
      successMessage,
    } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="new_project"
            ref={(el) => (this.form = el)}
          >
            {errorMessage ? (
              <Alert type="danger" message={errorMessage} />
            ) : null}
            {successMessage ? (
              <Alert type="success" message={successMessage} />
            ) : null}
            <div className="form-group text-left">{message}</div>
            <div className="form-row">
              <div className="form-group col">
                <Button
                  size="lg"
                  type="primary"
                  disabled={isSubmitting ? true : false}
                  onClick={(e) => this.handleLabelDelete(e, labelId)}
                  isSubmitting={isSubmitting}
                  text="Delete LabelValue"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(DeleteLabelValuesForm));

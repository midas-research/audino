import axios from "axios";
import React from "react";

import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";

class CreateLabelForm extends React.Component {
  constructor(props) {
    super(props);

    const projectId = this.props.projectId;

    this.initialState = {
      projectId,
      name: null,
      type: null,
      errorMessage: "",
      successMessage: "",
      isSubmitting: false,
      createLabelUrl: `/api/projects/${projectId}/labels`,
    };

    this.state = Object.assign({}, this.initialState);
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleLabelNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleLabelTypeChange(e) {
    this.setState({ type: e.target.value });
  }

  handleLabelCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { name, type, createLabelUrl } = this.state;

    if (!name || name === "") {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please enter a valid label name!",
        successMessage: "",
      });
      return;
    }

    if (!type || !["1", "2"].includes(type)) {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please select a valid label type!",
        successMessage: "",
      });
      return;
    }

    axios({
      method: "post",
      url: createLabelUrl,
      data: {
        name,
        type,
      },
    })
      .then((response) => {
        if (response.status === 201) {
          this.resetState();
          this.form.reset();

          this.setState({
            successMessage: response.data.message,
          });
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: "",
          isSubmitting: false,
        });
      });
  }

  handleAlertDismiss(e) {
    e.preventDefault();
    this.setState({
      successMessage: "",
      errorMessage: "",
    });
  }

  render() {
    const { isSubmitting, errorMessage, successMessage } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="new_user"
            ref={(el) => (this.form = el)}
          >
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
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                id="label_name"
                placeholder="Label Name"
                autoFocus={true}
                required={true}
                onChange={(e) => this.handleLabelNameChange(e)}
              />
            </div>
            <div className="form-group">
              <select
                className="form-control"
                name="label_type"
                onChange={(e) => this.handleLabelTypeChange(e)}
              >
                <option value="-1">Choose Label Type</option>
                <option value="1">Select</option>
                <option value="2">Multi-Select</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group col">
                <Button
                  size="lg"
                  type="primary"
                  disabled={isSubmitting ? true : false}
                  onClick={(e) => this.handleLabelCreation(e)}
                  isSubmitting={isSubmitting}
                  text="Save"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(CreateLabelForm));

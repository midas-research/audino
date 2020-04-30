import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";
import Loader from "../../components/loader";

class EditLabelForm extends React.Component {
  constructor(props) {
    super(props);

    const projectId = this.props.projectId;
    const labelId = this.props.labelId;

    this.initialState = {
      projectId,
      labelId,
      name: "",
      type: "-1",
      errorMessage: null,
      successMessage: null,
      isLoading: false,
      labelUrl: `/api/projects/${projectId}/labels/${labelId}`,
    };

    this.state = Object.assign({}, this.initialState);
  }

  componentDidMount() {
    const { labelUrl } = this.state;
    this.setState({ isLoading: true });
    axios({
      method: "get",
      url: labelUrl,
    })
      .then((response) => {
        if (response.status === 200) {
          const { label_name, label_type_id } = response.data;
          this.setState({
            name: label_name,
            type: String(label_type_id),
            isLoading: false,
          });
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: null,
          isLoading: false,
        });
      });
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleLabelTypeChange(e) {
    this.setState({ type: e.target.value });
  }

  clearForm() {
    this.form.reset();
  }

  handleLabelUpdation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { labelUrl, type } = this.state;

    // TODO: Get these values from api
    if (!type || !["1", "2"].includes(type)) {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please select a valid label type id!",
        successMessage: null,
      });
      return;
    }

    axios({
      method: "patch",
      url: labelUrl,
      data: {
        type,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          const { label_name, label_type_id } = response.data;
          console.log(label_name, label_type_id);
          this.setState({
            name: label_name,
            type: label_type_id,
            isLoading: false,
            isSubmitting: false,
            successMessage: "Label has been updated",
            errorMessage: null,
          });
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: null,
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
    const {
      name,
      type,
      isSubmitting,
      errorMessage,
      successMessage,
      isLoading,
    } = this.state;

    console.log(name, type);
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="edit_label"
            ref={(el) => (this.form = el)}
          >
            {isLoading ? <Loader /> : null}
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
            {!isLoading ? (
              <div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Name"
                    value={name}
                    autoFocus={true}
                    required={true}
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <select
                    className="form-control"
                    name="type"
                    value={type}
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
                      onClick={(e) => this.handleLabelUpdation(e)}
                      isSubmitting={isSubmitting}
                      text="Update"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(EditLabelForm));

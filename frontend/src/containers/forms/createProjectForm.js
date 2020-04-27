import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";

class CreateProjectForm extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      name: "",
      errorMessage: "",
      successMessage: "",
      isSubmitting: false,
    };

    this.state = Object.assign({}, this.initialState);
  }

  handleCancel() {
    const { history } = this.props;
    history.push("/admin");
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleProjectNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleProjectCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { name } = this.state;

    if (!name || name === "") {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please enter a valid project name!",
      });
      return;
    }

    axios({
      method: "post",
      url: "/api/projects",
      data: {
        name,
      },
    })
      .then((response) => {
        this.resetState();
        this.form.reset();
        if (response.status === 201) {
          this.setState({ successMessage: response.data.message });
        }
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
    const { isSubmitting, errorMessage, successMessage } = this.state;
    return (
      <form className="col-4" name="new_project" ref={(el) => (this.form = el)}>
        {errorMessage ? <Alert type="danger" message={errorMessage} /> : null}
        {successMessage ? (
          <Alert type="success" message={successMessage} />
        ) : null}
        <h1 className="h3 mb-3 font-weight-normal">New Project</h1>
        <div className="form-group text-left font-weight-bold">
          <label htmlFor="project_name">Project Name</label>
          <input
            type="text"
            className="form-control"
            id="project_name"
            placeholder="Project Name"
            autoFocus={true}
            required={true}
            onChange={(e) => this.handleProjectNameChange(e)}
          />
        </div>
        <div className="form-row">
          <div className="form-group col">
            <Button
              size="lg"
              type="danger"
              disabled={isSubmitting ? true : false}
              onClick={(e) => this.handleCancel(e)}
              text="Cancel"
            />
          </div>
          <div className="form-group col">
            <Button
              size="lg"
              type="primary"
              disabled={isSubmitting ? true : false}
              onClick={(e) => this.handleProjectCreation(e)}
              isSubmitting={isSubmitting}
              text="Save"
            />
          </div>
        </div>
      </form>
    );
  }
}

export default withStore(withRouter(CreateProjectForm));

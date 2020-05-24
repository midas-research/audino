import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";
import Loader from "../../components/loader";

class ManageUsersProjectForm extends React.Component {
  constructor(props) {
    super(props);

    const projectId = Number(this.props.projectId);

    this.initialState = {
      projectId,
      projectName: this.props.projectName,
      users: [],
      selectedUsers: [],
      errorMessage: "",
      successMessage: "",
      isLoading: false,
      isSubmitting: false,
      projectUrl: `/api/projects/${projectId}`,
      getUsersUrl: "/api/users",
      updateUsersProject: `/api/projects/${projectId}/users`,
    };

    this.state = Object.assign({}, this.initialState);
  }

  componentDidMount() {
    const { projectUrl, getUsersUrl } = this.state;

    this.setState({ isLoading: true });

    axios
      .all([axios.get(projectUrl), axios.get(getUsersUrl)])
      .then((response) => {
        const selectedUsers = response[0].data.users.map((user) =>
          Number(user["user_id"])
        );
        this.setState({
          selectedUsers,
          users: response[1].data.users,
          isLoading: false,
        });
      });
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleUsersChange(e) {
    const users = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    this.setState({ selectedUsers: users });
  }

  handleManageUsersProject(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { selectedUsers, updateUsersProject } = this.state;

    if (!selectedUsers || !Array.isArray(selectedUsers)) {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please select users!",
        successMessage: "",
      });
      return;
    }

    axios({
      method: "patch",
      url: updateUsersProject,
      data: {
        users: selectedUsers,
      },
    })
      .then((response) => {
        this.setState({
          isSubmitting: false,
          successMessage: response.data.message,
          errorMessage: null,
        });
      })
      .catch((error) => {
        this.setState({
          isSubmitting: false,
          errorMessage: error.response.data.message,
          successMessage: "",
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
      isSubmitting,
      errorMessage,
      successMessage,
      users,
      selectedUsers,
      isLoading,
    } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="manage_users"
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
                <div className="form-group text-left font-weight-bold">
                  <label htmlFor="users">Users</label>
                  <select
                    className="form-control"
                    name="users"
                    id="users"
                    multiple
                    size="10"
                    value={selectedUsers}
                    onChange={(e) => this.handleUsersChange(e)}
                  >
                    {users.map((user, index) => {
                      return (
                        <option value={user["user_id"]} key={index}>
                          {user["username"]}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <Button
                      size="lg"
                      type="primary"
                      disabled={isSubmitting}
                      onClick={(e) => this.handleManageUsersProject(e)}
                      isSubmitting={isSubmitting}
                      alt={"Save"}
                      text="Save"
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

export default withStore(withRouter(ManageUsersProjectForm));

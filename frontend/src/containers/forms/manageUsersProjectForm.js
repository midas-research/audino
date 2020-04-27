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

    const projectId = Number(this.props.match.params.id);

    this.initialState = {
      projectId,
      projectName: "",
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
        const selectedUsers = response[0].data.users.map((user, index) =>
          Number(user["user_id"])
        );
        console.log(selectedUsers);
        this.setState({
          projectName: response[0].data.name,
          selectedUsers,
          users: response[1].data.users,
          isLoading: false,
        });
      });
  }

  handleCancel() {
    const { history } = this.props;
    history.push("/admin");
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleUsersChange(e) {
    let users = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    console.log(users);
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
        console.log(response.data);
        if (response.status === 201) {
          this.setState({
            isSubmitting: false,
            successMessage: response.data.message,
            errorMessage: null,
          });
        }
      })
      .catch((error) => {
        this.setState({
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
      projectName,
      isLoading,
    } = this.state;
    return (
      <form className="col-5" name="new_project" ref={(el) => (this.form = el)}>
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
            <h1 className="h3 mb-3 font-weight-normal">
              Project <span className="font-weight-bold">{projectName}</span>:
              Manage User Access
            </h1>
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
                  type="danger"
                  disabled={isSubmitting ? true : false}
                  onClick={(e) => this.handleCancel(e)}
                  alt={"Cancel"}
                  text="Cancel"
                />
              </div>
              <div className="form-group col">
                <Button
                  size="lg"
                  type="primary"
                  disabled={isSubmitting ? true : false}
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
    );
  }
}

export default withStore(withRouter(ManageUsersProjectForm));

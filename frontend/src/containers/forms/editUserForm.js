import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";
import Loader from "../../components/loader";

class EditUserForm extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      userId: Number(this.props.userId),
      username: "",
      role: "-1",
      errorMessage: null,
      successMessage: null,
      isLoading: false,
      url: `/api/users/${this.props.userId}`,
    };

    this.state = Object.assign({}, this.initialState);
  }

  componentDidMount() {
    const { url } = this.state;
    this.setState({ isLoading: true });
    axios({
      method: "get",
      url,
    })
      .then((response) => {
        if (response.status === 200) {
          const { username, role_id } = response.data;
          this.setState({ username, role: String(role_id), isLoading: false });
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

  handleRoleChange(e) {
    this.setState({ role: e.target.value });
  }

  clearForm() {
    this.form.reset();
  }

  handleUserUpdation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { url, role } = this.state;

    // TODO: Get these values from api
    if (!role || !["1", "2"].includes(role)) {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please select a valid role!",
        successMessage: null,
      });
      return;
    }

    axios({
      method: "patch",
      url,
      data: {
        role,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          const { username, role_id } = response.data;
          this.setState({
            username,
            role: String(role_id),
            isLoading: false,
            isSubmitting: false,
            successMessage: "User has been updated",
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
      username,
      isSubmitting,
      errorMessage,
      successMessage,
      isLoading,
      role,
    } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form
            className="col-6"
            name="edit_user"
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
                <h1 className="h3 mb-3 font-weight-normal">Edit User</h1>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Username"
                    value={username}
                    autoFocus={true}
                    required={true}
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <select
                    className="form-control"
                    name="role"
                    value={role}
                    onChange={(e) => this.handleRoleChange(e)}
                  >
                    <option value="-1">Choose role</option>
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <Button
                      size="lg"
                      type="primary"
                      disabled={isSubmitting ? true : false}
                      onClick={(e) => this.handleUserUpdation(e)}
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

export default withStore(withRouter(EditUserForm));

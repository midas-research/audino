import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";

class CreateUserForm extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      username: "",
      password: "",
      role: "user",
      errorMessage: "",
      successMessage: "",
      isSubmitting: false,
    };

    this.state = Object.assign({}, this.initialState);
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  handleRoleChange(e) {
    this.setState({ role: e.target.value });
  }

  handleUserCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { username, password, role } = this.state;

    if (!username || username === "") {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please enter a valid username!",
        successMessage: "",
      });
      return;
    }

    if (!password || password === "") {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please enter a valid password!",
        successMessage: "",
      });
      return;
    }

    if (!role || !["1", "2"].includes(role)) {
      this.setState({
        isSubmitting: false,
        errorMessage: "Please select a valid role!",
        successMessage: "",
      });
      return;
    }

    axios({
      method: "post",
      url: "/api/users",
      data: {
        username,
        password,
        role,
      },
    })
      .then((response) => {
        if (response.status === 201) {
          this.resetState();
          this.form.reset();

          this.setState({ successMessage: response.data.message });
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
                id="username"
                placeholder="Username"
                autoFocus={true}
                required={true}
                onChange={(e) => this.handleUsernameChange(e)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
                required={true}
                onChange={(e) => this.handlePasswordChange(e)}
              />
            </div>
            <div className="form-group">
              <select
                className="form-control"
                name="role"
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
                  onClick={(e) => this.handleUserCreation(e)}
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

export default withStore(withRouter(CreateUserForm));

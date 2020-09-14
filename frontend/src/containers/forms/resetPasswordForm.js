import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";

import { setAuthorizationToken } from "../../utils";

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      newpassword: "",
      oldpassword: "",
      isResetIn: false,
      errorMessage: "",
      successMessage: "",
    };

    this.state = Object.assign({}, this.initialState);
  }

  resetState() {
    this.setState(this.initialState);
  }

  handlePasswordChange(e) {
    console.log();
    const passType = e.target.id;
    if (passType == "old-password") {
      this.setState({ oldpassword: e.target.value });
    } else {
      this.setState({ newpassword: e.target.value });
    }
  }

  handleResetPass(e) {
    const { oldpassword, newpassword } = this.state;

    axios({
      method: "patch",
      url: "auth/reset",
      data: {
        oldpassword,
        newpassword,
      },
    })
      .then((response) => {
        this.setState({
          errorMessage: null,
          successMessage: "Password Succesfully reset!",
        });
      })
      .catch((error) => {
        this.setState({
          isResetIn: false,
          successMessage: "",
          errorMessage: error.response.data.message,
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
    const { isResetIn, successMessage, errorMessage } = this.state;
    return (
      <form className="col-10" name="reset-password">
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
            type="password"
            className="form-control"
            id="old-password"
            placeholder="Enter Current password"
            required={true}
            onChange={(e) => this.handlePasswordChange(e)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-control"
            id="new-password"
            placeholder="Enter New Password"
            required={true}
            onChange={(e) => this.handlePasswordChange(e)}
          />
        </div>
        <div className="form-group">
          <Button
            size="lg"
            type="primary"
            disabled={isResetIn ? true : false}
            onClick={(e) => this.handleResetPass(e)}
            isSubmitting={isResetIn}
            text="Reset Password"
          />
        </div>
      </form>
    );
  }
}
export default withStore(withRouter(ResetPassword));

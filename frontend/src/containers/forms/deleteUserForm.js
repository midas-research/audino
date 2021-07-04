import React from "react";
import axios from "axios";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import Alert from "../../components/alert";
import { Button } from "../../components/button";

class DeleteUserForm extends React.Component {
  constructor(props) {
    super(props);

    const user = this.props.user;

    const userId = user["user_id"];
    const username = user["username"];
    this.initialState = {
      userId,
      username,
      message: `The User to be deleted is "${username}"`,
      errorMessage: "",
      successMessage: "",
      isSubmitting: false,
    };

    this.state = Object.assign({}, this.initialState);
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleUserDelete(e, userId) {
    axios({
      method: "post",
      url: "/api/rmusers",
      data: {
        rmuserId: userId,
      },
    })
      .then((response) => {
        if (response.status === 201) {
          console.log("YES");
          this.setState({ successMessage: response.data.message });
        }
        // TODO: After the opration revert to the /admin page
        // this.refreshPage();
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
      userId,
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
                  onClick={(e) => this.handleUserDelete(e, userId)}
                  isSubmitting={isSubmitting}
                  text="Delete User"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(DeleteUserForm));

import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import { withStore } from "@spyna/react-store";

import { setAuthorizationToken } from "../utils";

import FormModal from "./modal";

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalShow: false };
  }

  handleLogout(e) {
    const { history } = this.props;

    axios({
      method: "delete",
      url: "/auth/logout",
    })
      .then(() => {
        localStorage.removeItem("access_token");
        this.props.store.set("isUserLoggedIn", false);
        this.props.store.set("isAdmin", false);
        this.props.store.set("isLoading", false);

        setAuthorizationToken(null);

        history.push("/");
      })
      .catch((error) => {
        // TODO: Show error logging out
        console.log(error);
      });
  }

  setModalShow(modalShow) {
    this.setState({ modalShow });
  }

  handleResetPassword(e) {
    this.setModalShow(true);
  }

  render() {
    const isUserLoggedIn = this.props.store.get("isUserLoggedIn");
    const isAdmin = this.props.store.get("isAdmin");

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <Link to="/" className="navbar-brand">
          audino
        </Link>
        {isUserLoggedIn && (
          <div>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className={`nav-item`}>
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                {isAdmin && (
                  <li className={`nav-item`}>
                    <Link className="nav-link" to="/admin">
                      Admin Panel
                    </Link>
                  </li>
                )}
              </ul>
              <ul className="navbar-nav">
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link btn btn-link text-decoration-none"
                    onClick={(e) => this.handleLogout(e)}
                  >
                    Logout
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link btn btn-link text-decoration-none"
                    onClick={(e) => this.handleResetPassword(e)}
                  >
                    Reset Password
                  </button>
                </li>
                {this.state.modalShow ? (
                  <FormModal
                    formType="RESET_USER"
                    title="Reset Password"
                    show={this.state.modalShow}
                    onHide={() => this.setModalShow(false)}
                  />
                ) : null}
              </ul>
            </div>
          </div>
        )}
      </nav>
    );
  }
}

export default withRouter(withStore(NavBar));

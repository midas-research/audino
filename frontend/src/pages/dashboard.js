import axios from "axios";
import React from "react";
import { Helmet } from "react-helmet";

import Loader from "../components/loader";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      isProjectLoading: false,
    };
  }

  componentDidMount() {
    this.setState({ isProjectLoading: true });

    axios({
      method: "get",
      url: "/api/current_user/projects",
    })
      .then((response) => {
        this.setState({
          projects: response.data.projects,
          isProjectLoading: false,
        });
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          isProjectLoading: false,
        });
      });
  }

  render() {
    const { isProjectLoading, projects } = this.state;
    return (
      <div>
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        <div className="container h-100">
          <div className="h-100 mt-5">
            <div className="row border-bottom my-3">
              <div className="col float-left">
                <h1>Projects</h1>
              </div>
              <hr />
              {!isProjectLoading && projects.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Created By</th>
                      <th scope="col">Created On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row" className="align-middle">
                            {index + 1}
                          </th>
                          <td className="align-middle">
                            <a href={`/projects/${project["project_id"]}/data`}>
                              {project["name"]}
                            </a>
                          </td>
                          <td className="align-middle">
                            {project["created_by"]}
                          </td>
                          <td className="align-middle">
                            {project["created_on"]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </div>
            <div className="row my-4 justify-content-center align-items-center">
              {isProjectLoading ? <Loader /> : null}
              {!isProjectLoading && projects.length === 0 ? (
                <div className="font-weight-bold">No projects exists! To proceed, please create one in admin panel.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;

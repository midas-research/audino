import axios from "axios";
import React from "react";
import { Helmet } from "react-helmet";

import Loader from "../components/loader";
import { ListGroup, Form, FormControl, Button } from "react-bootstrap";
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      searchValue: "",
      searchResults: [],
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

  handleSearchSubmit = () => {
    if (this.state.searchValue) {
      axios({
        method: "get",
        url: `/api/current_user/projects/search?search_query=${this.state.searchValue}`,
      }).then((response) => {
        this.setState({ searchResults: response.data.projects.slice(0, 5) });
      });
      this.setState({ searchValue: "" });
    } else {
      alert("Please enter some search text!");
    }
  };

  render() {
    const { isProjectLoading, projects, searchResults } = this.state;
    return (
      <div>
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        <div className="container h-100">
          <div className="row border-bottom my-5">
            <Form inline onSubmit={this.handleFormSubmit}>
              <FormControl
                onChange={(e) => this.setState({ searchValue: e.target.value })}
                value={this.state.searchValue}
                onKeyUp={(event) => {
                  event.preventDefault();
                  if (event.key === "Enter" && event.keyCode === 13) {
                    this.handleSearchSubmit();
                  }
                }}
                type="text"
                placeholder="Search for files by name"
                className="mr-sm-2"
              />
              <Button onClick={this.handleSearchSubmit} variant="outline-info">
                Search
              </Button>
            </Form>
          </div>
          {searchResults.length ? (
            <div className="h-100 mt-5">
              <h2>Search Results:</h2>
              <ListGroup>
                {searchResults.map((item, itr) => {
                  return <ListGroup.Item key={itr}>{item}</ListGroup.Item>;
                })}
              </ListGroup>
            </div>
          ) : null}
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

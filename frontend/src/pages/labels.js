import axios from "axios";
import React from "react";
import { withRouter } from "react-router-dom";
import { Helmet } from "react-helmet";

import {
  faPlusSquare,
  faEdit,
  faTrashAlt,
  faUserPlus,
  faTags,
} from "@fortawesome/free-solid-svg-icons";

import { IconButton } from "../components/button";
import Loader from "../components/loader";

class Labels extends React.Component {
  constructor(props) {
    super(props);

    const projectId = Number(this.props.match.params.id);

    this.state = {
      projectId,
      labels: [],
      isLabelsLoading: false,
      newLabelUrl: `/projects/${projectId}/labels/new`,
      getLabelsUrl: `/api/projects/${projectId}`,
    };
  }

  componentDidMount() {
    const { getLabelsUrl } = this.state;
    this.setState({ isLabelsLoading: true });

    axios({
      method: "get",
      url: getLabelsUrl,
    })
      .then((response) => {
        this.setState({
          labels: response.data.labels,
          isLabelsLoading: false,
        });
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.response.data.message,
          isLabelsLoading: false,
        });
      });
  }

  handleNewLabel() {
    const { history } = this.props;
    const { newLabelUrl } = this.state;
    history.push(newLabelUrl);
  }

  render() {
    const { labels, isLabelsLoading } = this.state;
    return (
      <div>
        <Helmet>
          <title>Manage Labels</title>
        </Helmet>
        <div className="container h-100">
          <div className="h-100 mt-5">
            <div className="row border-bottom my-3">
              <div className="col float-left">
                <h1>Labels</h1>
              </div>
              <hr />
              <div className="col float-right">
                <h1 className="text-right">
                  <IconButton
                    icon={faPlusSquare}
                    size="lg"
                    title="Create new label"
                    onClick={(e) => this.handleNewLabel(e)}
                  />
                </h1>
              </div>
              {!isLabelsLoading && labels.length > 0 ? (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Type</th>
                      <th scope="col">Created On</th>
                      <th scope="col">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labels.map((label, index) => {
                      return (
                        <tr key={index}>
                          <th scope="row" className="align-middle">
                            {index + 1}
                          </th>
                          <td className="align-middle">{label["name"]}</td>
                          <td className="align-middle">{label["type"]}</td>
                          <td className="align-middle">
                            {label["created_on"]}
                          </td>
                          <td className="align-middle">
                            <IconButton
                              icon={faUserPlus}
                              size="sm"
                              title={"Manage label values"}
                              onClick={(e) =>
                                this.handleManageLabelValues(
                                  e,
                                  label["label_id"]
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : null}
            </div>
            <div className="row my-4 justify-content-center align-items-center">
              {isLabelsLoading ? <Loader /> : null}
              {!isLabelsLoading && labels.length === 0 ? (
                <div className="font-weight-bold">No projects exists!</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Labels);

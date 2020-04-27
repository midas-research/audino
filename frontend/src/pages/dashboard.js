import React from "react";
import { Helmet } from "react-helmet";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }
  render() {
    const { isLoading } = this.state;
    return (
      <div>
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        <div className="container h-75 text-center">
          <div className="row h-100 justify-content-center align-items-center">
            {/* {isLoading ? <Loader /> : null} */}
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;

import React from "react";
import { Helmet } from "react-helmet";

import ManageUsersProjectForm from "../containers/forms/manageUsersProjectForm";
import CreateProjectForm from "../containers/forms/createProjectForm";

const ManageUsers = () => {
  return (
    <div className="container h-75 text-center">
      <Helmet>
        <title>Manage Users</title>
      </Helmet>
      <div className="row h-100 justify-content-center align-items-center">
        <ManageUsersProjectForm />
      </div>
    </div>
  );
};

const NewProject = () => {
  return (
    <div className="container h-75 text-center">
      <Helmet>
        <title>Create New Project</title>
      </Helmet>
      <div className="row h-100 justify-content-center align-items-center">
        <CreateProjectForm />
      </div>
    </div>
  );
};

export { NewProject, ManageUsers };

import React from "react";
import { Helmet } from "react-helmet";

import EditUserForm from "../containers/forms/editUserForm";
import CreateUserForm from "../containers/forms/createUserForm";

const EditUser = () => {
  return (
    <div className="container h-75 text-center">
      <Helmet>
        <title>Edit User</title>
      </Helmet>
      <div className="row h-100 justify-content-center align-items-center">
        <EditUserForm />
      </div>
    </div>
  );
};

const NewUser = () => {
  return (
    <div className="container h-75 text-center">
      <Helmet>
        <title>Create New User</title>
      </Helmet>
      <div className="row h-100 justify-content-center align-items-center">
        <CreateUserForm />
      </div>
    </div>
  );
};

export { EditUser, NewUser };

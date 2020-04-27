import React from "react";

import LoginForm from "../containers/forms/login";

const Home = () => {
  return (
    <div className="container h-75 text-center">
      <div className="row h-100 justify-content-center align-items-center">
        <LoginForm />
      </div>
    </div>
  );
};

export default Home;

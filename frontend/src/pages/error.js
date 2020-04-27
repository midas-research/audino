import React from "react";

const Error = (props) => {
  return (
    <div className="container h-75 text-center">
      <div className="row h-100 justify-content-center align-items-center">
        {props.message}
      </div>
    </div>
  );
};

export default Error;

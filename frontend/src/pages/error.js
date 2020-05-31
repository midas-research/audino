import React from 'react';
import PropTypes from 'prop-types';

const Error = props => {
  const { message } = props;
  return (
    <div className="container h-75 text-center">
      <div className="row h-100 justify-content-center align-items-center">{message}</div>
    </div>
  );
};

Error.propTypes = {
  message: PropTypes.string.isRequired
};

export default Error;

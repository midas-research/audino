/* eslint-disable react/forbid-prop-types */
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const noop = () => { };

const IconButton = ({ icon, size = 'lg', title = '', onClick = noop }) => {
  return (
    <button type="button" className="btn btn-default" onClick={onClick} title={title}>
      <FontAwesomeIcon icon={icon} size={size} />
    </button>
  );
};

IconButton.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  size: PropTypes.oneOf(['lg', 'sm', '2x']).isRequired,
  onClick: PropTypes.func.isRequired
};

const Button = ({
  text,
  type,
  title = '',
  size = 'lg',
  isDisabled = false,
  onClick = noop,
  isSubmitting: showLoader = false
}) => {
  return (
    <button
      type="button"
      className={`btn btn-${size} btn-${type} btn-block`}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
    >
      {text}
      {showLoader ? (
        <span
          className={`spinner-border ml-2 btn-loader--size-${size}`}
          role="status"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['lg', 'sm']).isRequired,
  type: PropTypes.oneOf(['primary', 'danger']).isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export { Button, IconButton };

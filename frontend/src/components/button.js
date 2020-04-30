import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const noop = () => {};

const IconButton = ({ icon, size = "lg", title = "", onClick = noop }) => {
  return (
    <button
      type="button"
      className="btn btn-default"
      onClick={onClick}
      title={title}
    >
      <FontAwesomeIcon icon={icon} size={size} />
    </button>
  );
};

IconButton.propTypes = {
  icon: PropTypes.object.isRequired,
  size: PropTypes.oneOf(["lg", "sm", "2x"]),
};

const Button = ({
  text,
  type,
  title = "",
  size = "lg",
  isDisabled = false,
  onClick = noop,
  isSubmitting: showLoader = false,
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
        ></span>
      ) : null}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["lg", "sm"]),
  type: PropTypes.oneOf(["primary", "danger"]),
  showLoader: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export { Button, IconButton };

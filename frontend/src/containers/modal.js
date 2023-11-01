import React from "react";
import Modal from "react-bootstrap/Modal";

import CreateUserForm from "./forms/createUserForm";
import EditUserForm from "./forms/editUserForm";
import CreateProjectForm from "./forms/createProjectForm";
import CreateLabelForm from "./forms/createLabelForm";
import EditLabelForm from "./forms/editLabelForm";
import ManageUsersProjectForm from "./forms/manageUsersProjectForm";
import CreateLabelValueForm from "./forms/createLabelValuelForm";
import EditLabelValueForm from "./forms/editLabelValueForm";
import ResetPassword from "./forms/resetPasswordForm";

const FormModal = (props) => {
  return (
    <Modal
      show={props.show}
      onExited={props.onExited}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.formType === "NEW_USER" ? <CreateUserForm /> : null}
        {props.formType === "RESET_USER" ? <ResetPassword /> : null}
        {props.formType === "NEW_PROJECT" ? <CreateProjectForm /> : null}
        {props.formType === "EDIT_USER" ? (
          <EditUserForm userId={props.userId} />
        ) : null}
        {props.formType === "MANAGE_PROJECT_USERS" ? (
          <ManageUsersProjectForm projectId={props.projectId} />
        ) : null}
        {props.formType === "NEW_LABEL" ? (
          <CreateLabelForm projectId={props.projectId} />
        ) : null}
        {props.formType === "EDIT_LABEL" ? (
          <EditLabelForm projectId={props.projectId} labelId={props.labelId} />
        ) : null}
        {props.formType === "NEW_LABEL_VALUE" ? (
          <CreateLabelValueForm labelId={props.labelId} />
        ) : null}
        {props.formType === "EDIT_LABEL_VALUE" ? (
          <EditLabelValueForm
            labelId={props.labelId}
            labelValueId={props.labelValueId}
          />
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default FormModal;

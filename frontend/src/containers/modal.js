// import React from "react";
// import { Button } from "../components/button";

// class FormModal extends React.Component {
//   constructor(props) {
//     super(props);
//     console.log("HELLO");
//     const { title, formType, innerRef } = this.props;
//     console.log(innerRef);
//     this.state = {
//       title,
//       formType,
//       isSubmitting: false,
//     };
//   }

//   handleFormSubmission() {
//     const { onFormSubmission } = this.props;
//     onFormSubmission();
//   }

//   render() {
//     const { innerRef } = this.props;
//     console.log(innerRef);
//     const { title, formType, isSubmitting } = this.state;
//     if (!formType) {
//       return null;
//     }

//     return (
//       <div className="modal" tabIndex="-1" role="dialog" ref={innerRef}>
//         <div className="modal-dialog" role="document">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">{title}</h5>
//               <button
//                 type="button"
//                 className="close"
//                 data-dismiss="modal"
//                 aria-label="Close"
//               >
//                 <span aria-hidden="true">&times;</span>
//               </button>
//             </div>
//             <div className="modal-body"></div>
//             <div className="modal-footer">
//               <Button
//                 size="lg"
//                 type="danger"
//                 data-dismiss="modal"
//                 disabled={isSubmitting ? true : false}
//                 onClick={(e) => this.handleCancel(e)}
//                 text="Cancel"
//               />
//               <Button
//                 size="lg"
//                 type="primary"
//                 disabled={isSubmitting ? true : false}
//                 onClick={(e) => this.handleFormSubmission(e)}
//                 isSubmitting={isSubmitting}
//                 text="Save"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default React.forwardRef((props, ref) => {
//   console.log(ref);
//   return <FormModal innerRef={ref} {...props} />;
// });

import React from "react";
import Modal from "react-bootstrap/Modal";

import CreateUserForm from "./forms/createUserForm";
import CreateProjectForm from "../containers/forms/createProjectForm";

const FormModal = (props) => {
  return (
    <Modal
      show={props.show}
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
        {props.formType == "NEW_USER" ? <CreateUserForm /> : null}
        {props.formType == "NEW_PROJECT" ? <CreateProjectForm /> : null}
      </Modal.Body>
    </Modal>
  );
};

export default FormModal;

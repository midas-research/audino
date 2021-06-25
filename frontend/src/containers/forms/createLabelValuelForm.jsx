import axios from 'axios';
import React from 'react';

import { withRouter } from 'react-router';
import { withStore } from '@spyna/react-store';

import Alert from '../../components/alert';
import { Button } from '../../components/button';

class CreateLabelValueForm extends React.Component {
  constructor(props) {
    super(props);

    const { labelId } = this.props;

    this.initialState = {
      labelId,
      value: null,
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
      createLabelValueUrl: `/api/labels/${labelId}/values`
    };

    this.state = { ...this.initialState };
  }

  resetState() {
    this.setState(this.initialState);
  }

  handleLabelValueChange(e) {
    this.setState({ value: e.target.value });
  }

  handleLabelValueCreation(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { value, createLabelValueUrl } = this.state;

    if (!value || value === '') {
      this.setState({
        isSubmitting: false,
        errorMessage: 'Please enter a valid label value!',
        successMessage: ''
      });
      return;
    }

    axios({
      method: 'post',
      url: createLabelValueUrl,
      data: {
        value
      }
    })
      .then(response => {
        if (response.status === 201) {
          this.resetState();
          this.form.reset();

          this.setState({
            successMessage: response.data.message
          });
        }
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message,
          successMessage: '',
          isSubmitting: false
        });
      });
  }

  handleAlertDismiss(e) {
    e.preventDefault();
    this.setState({
      successMessage: '',
      errorMessage: ''
    });
  }

  render() {
    const { isSubmitting, errorMessage, successMessage } = this.state;
    return (
      <div className="container h-75 text-center">
        <div className="row h-100 justify-content-center align-items-center">
          <form className="col-6" name="new_label_value" ref={el => (this.form = el)}>
            {errorMessage ? (
              <Alert
                type="danger"
                message={errorMessage}
                onClose={e => this.handleAlertDismiss(e)}
              />
            ) : null}
            {successMessage ? (
              <Alert
                type="success"
                message={successMessage}
                onClose={e => this.handleAlertDismiss(e)}
              />
            ) : null}
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                id="label_value"
                placeholder="Label Value"
                autoFocus
                required
                onChange={e => this.handleLabelValueChange(e)}
              />
            </div>
            <div className="form-row">
              <div className="form-group col">
                <Button
                  size="lg"
                  type="primary"
                  disabled={!!isSubmitting}
                  onClick={e => this.handleLabelValueCreation(e)}
                  isSubmitting={isSubmitting}
                  text="Save"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStore(withRouter(CreateLabelValueForm));

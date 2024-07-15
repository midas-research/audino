import Validator from "validatorjs";
import {
  analyticsSettingRule,
  attributeRule,
  exportAnnotationRule,
  jobAddRule,
  organizationRule,
  projectRule,
  taskAddRule,
  taskEditRule,
} from "./rule";

export const projectSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (projectRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: projectRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
};

export const attributeSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (attributeRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: attributeRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
};

export const taskAddSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (taskAddRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: taskAddRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
};
export const taskEditSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (taskEditRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: taskEditRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
};

export const organizationSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (organizationRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: organizationRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
};

export const exportAnnotationSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (exportAnnotationRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: exportAnnotationRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
}

export const jobAddSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (jobAddRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: jobAddRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
};

export const analyticsSettingSingleFieldValidation = ({ key, value }) => {
  const validationResponse = { isValid: true };
  if (analyticsSettingRule[key]) {
    const validation = new Validator(
      { [key]: value },
      { [key]: analyticsSettingRule[key] }
    );
    validationResponse.isValid = validation.passes();
    if (!validationResponse.isValid) {
      validationResponse.errors = validation.errors.all();
    }
  }
  return validationResponse;
}
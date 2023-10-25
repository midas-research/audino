import Validator from "validatorjs";
import { attributeRule, loginRule, projectRule, singupRule, taskAddRule, taskEditRule } from "./rule";

export const loginAllValidation = (data) => {
  const validation = new Validator(data, loginRule);
  const validationResponse = { isValid: validation.passes() };
  if (!validationResponse.isValid) {
    validationResponse.error = validation.errors.all();
  }
  return validationResponse;
};

export const signupAllValidation = (data) => {
  const validation = new Validator(data, singupRule);
  const validationResponse = { isValid: validation.passes() };
  if (!validationResponse.isValid) {
    validationResponse.error = validation.errors.all();
  }
  return validationResponse;
};

export const projectAllValidation = (data) => {
  const validation = new Validator(data, projectRule);
  const validationResponse = { isValid: validation.passes() };
  if (!validationResponse.isValid) {
    validationResponse.error = validation.errors.all();
  }
  return validationResponse;
};

export const attributeAllValidation = (data) => {
  const validation = new Validator(data, attributeRule);
  const validationResponse = { isValid: validation.passes() };
  if (!validationResponse.isValid) {
    validationResponse.error = validation.errors.all();
  }
  return validationResponse;
};

export const taskAddAllValidation = (data) => {
  const validation = new Validator(data, taskAddRule);
  const validationResponse = { isValid: validation.passes() };
  if (!validationResponse.isValid) {
    validationResponse.error = validation.errors.all();
  }
  return validationResponse;
};
export const taskEditAllValidation = (data) => {
  const validation = new Validator(data, taskEditRule);
  const validationResponse = { isValid: validation.passes() };
  if (!validationResponse.isValid) {
    validationResponse.error = validation.errors.all();
  }
  return validationResponse;
};
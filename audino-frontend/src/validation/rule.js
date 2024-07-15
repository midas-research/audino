export const singupRule = {
  first_name: "required|string",
  username: "required",
  email: "required|email",
  password: "required|string",
};
export const loginRule = {
  email: "required",
  password: "required|string",
};
export const projectRule = {
  name: "required|string",
};
export const attributeRule = {
  name: "required|string",
  attribute_values: "required|array",
};
export const taskAddRule = {
  name: "required|string",
  project: "required",
  // subset: "required|string",
  files: "required",
};
export const taskEditRule = {
  name: "required|string",
  project: "required",
  // subset: "required|string",
};

export const organizationRule = {
  slug: "required|string",
};
export const exportAnnotationRule = {
  format: "required|string",
};

export const jobAddRule = {
  type: "required|string",
  frame_selection_method: "required|string",
  quantity: "required|integer|min:1",
}

export const analyticsSettingRule = {
  wer_threshold: "required",
  cer_threshold: "required|numeric",
}
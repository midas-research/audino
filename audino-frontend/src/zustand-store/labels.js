import { create } from "zustand";

export const default_labels_obj = {
  count: 0,
  next: null,
  previous: null,
  results: [
    {
      name: "DEFAULT_LABEL",
      label_type: "any",
      attributes: [
        {
          default_value: "DEFAULT_ATTR_VALUE",
          input_type: "select",
          mutable: false,
          name: "DEFAULT_ATTR",
          values: ["DEFAULT_ATTR_VALUE"],
        },
      ],
    },
  ],
};

export const useLabelStore = create((set) => ({
  labels_obj: default_labels_obj,

  setLabels: (data) => set((state) => ({ labels_obj: data })),
}));

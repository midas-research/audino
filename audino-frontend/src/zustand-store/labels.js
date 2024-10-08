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
    {
      name: "",
      type: "any",
      color:
        "#" +
        ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0"),
      attributes: [],
    },
  ],
};

export const useLabelStore = create((set) => ({
  labels_obj: default_labels_obj,

  setLabels: (data) => set((state) => ({ labels_obj: data })),
}));

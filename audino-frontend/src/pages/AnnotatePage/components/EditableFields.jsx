import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import CustomSelect from "../../../components/CustomInput/CustomSelect";
import CustomInput from "../../../components/CustomInput/CustomInput";
import { toast } from "react-hot-toast";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function EditableFields({
  inputTextRef,
  totalDuration,

  regions,
  setRegions,
  selectedSegment,
  setSelectedSegment,
  currentLabel,
  setCurrentLabel,
  setIsInputGiven,
  changeHistory,
  setChangeHistory,
  setCurrentHistoryIndex,

  getLabelsQuery,
}) {
  // fetch current label name from its id
  const getLabelName = (labelId) => {
    const labelIndex = getLabelsQuery?.data.findIndex(
      (label) => label.id === labelId
    );
    return getLabelsQuery?.data[labelIndex].name;
  };

  const renderAttributesofLabel = (label) => {
    return getLabelsQuery?.data
      ?.find((l) => l.id === label.id)
      ?.attributes.map((attr) => attr);
  };

  const currentRegionValue = (labelId, attrId) => {
    const regionIndex = regions.findIndex(
      (reg) => reg.id === selectedSegment.id
    );
    // console.log("labelId", labelId, attrId, regionIndex, regions);
    if (!regions[regionIndex]?.data?.labels) {
      return "";
    } else {
      const labelIndex = regions[regionIndex]?.data?.labels.findIndex(
        (reg) => reg.id === labelId
      );
      if (labelIndex < 0) return "";
      // console.log("att", regions[regionIndex].data.labels, labelIndex);
      const attrIndex = regions[regionIndex]?.data?.labels[
        labelIndex
      ].attributes.findIndex((reg) => reg.id === attrId);
      const attrValue =
        regions[regionIndex].data.labels[labelIndex].attributes[attrIndex]
          ?.values;
      // console.log("attrValue", attrValue);
      if (attrValue) return attrValue;
      else return "";
    }
    // return {name: attrValue, label: attrValue};
  };

  const handleOnChangeLabel = (attr, event, id, labelId) => {
    const { name, value } = event.target;
    const values = [...event.target.selectedOptions]
      .map((opt) => opt.value)
      .filter((value) => value !== "");

    let newValue = values;
    // if (attr.input_type === "select") {
    //   // Multiple select
    //   newValue = [...event.target.options]
    //     .filter((option) => option.selected)
    //     .map((x) => x.value);
    // }

    const updatedRegion = [...regions];
    const regionIndex = regions.findIndex((reg) => reg.id === id);
    const newState = { ...updatedRegion[regionIndex] }; // Shallow copy of the region object

    const labelIndex = newState.data.labels.findIndex((l) => l.id === labelId);
    // console.log(attr, event, id, labelId, labelIndex, newState.data.labels);

    // If the label is found, find the attribute with the specified attributeId
    if (labelIndex !== -1) {
      const label = { ...newState.data.labels[labelIndex] }; // Shallow copy of the label object
      const attributeIndex = label.attributes.findIndex(
        (a) => a.id === attr.id
      );

      // If the attribute is found, update its values array
      if (attributeIndex !== -1) {
        const updatedAttribute = {
          ...label.attributes[attributeIndex],
          values: newValue,
        }; // Shallow copy of the attribute object with updated values
        const updatedAttributes = [...label.attributes];
        updatedAttributes[attributeIndex] = updatedAttribute;

        // Update the label with updated attributes
        label.attributes = updatedAttributes;
      }

      // Update the label in the region
      const updatedLabels = [...newState.data.labels];
      updatedLabels[labelIndex] = label;
      newState.data.labels = updatedLabels;
    }

    updatedRegion[regionIndex] = newState;
    setRegions(updatedRegion);
  };

  const getInputValue = (key, isDataAttr = true) => {
    const regionIndex = regions.findIndex(
      (reg) => reg.id === selectedSegment.id
    );
    const currentRegion = regions[regionIndex];
    let currentValue = null;

    if (isDataAttr) currentValue = currentRegion.data[key];
    else currentValue = currentRegion[key];

    if (key === "start" || key === "end")
      currentValue = parseFloat(currentValue);

    return currentValue;
  };

  const handleValueChange = (key, value, isDataAttr = true) => {
    const updatedRegion = [...regions];
    const regionIndex = updatedRegion.findIndex(
      (reg) => reg.id === selectedSegment.id
    );

    if ((key === "start" || key === "end") && parseFloat(value) > totalDuration)
      value = totalDuration;

    if (isDataAttr) updatedRegion[regionIndex].data[key] = value;
    else updatedRegion[regionIndex][key] = value;

    setIsInputGiven((prev) => prev + " nv");
    setRegions(updatedRegion);
  };

  const handleValueChangeOnBlur = (key, value) => {
    const updatedRegion = [...regions];
    const regionIndex = updatedRegion.findIndex(
      (reg) => reg.id === selectedSegment.id
    );
    let errorMsg = "";

    if (
      key === "start" &&
      value > parseFloat(updatedRegion[regionIndex].end)
    ) {
      value = parseFloat(updatedRegion[regionIndex].end);
      errorMsg = "Start time should be less than end time.";
    }

    if (
      key === "end" &&
      value < parseFloat(updatedRegion[regionIndex].start)
    ) {
      value = parseFloat(updatedRegion[regionIndex].start);
      errorMsg = "End time should be greater than start time.";
    }

    if (errorMsg !== "") toast.error(errorMsg);

    updatedRegion[regionIndex][key] = value;
    setIsInputGiven((prev) => prev + " nv");
    setRegions(updatedRegion);
  };

  const handleLabelChange = (value) => {
    setCurrentLabel(value);
    // replace the old label with the new label in the annotation coming from server
    const updatedRegion = [...regions];
    const regionIndex = regions.findIndex(
      (reg) => reg.id === selectedSegment.id
    );
    setCurrentHistoryIndex(changeHistory.length);
    setChangeHistory([
      ...changeHistory,
      {
        type: "annotation",
        subType: "update",
        data: { ...updatedRegion[regionIndex] },
      },
    ]);
    const newState = { ...updatedRegion[regionIndex] }; // Shallow copy of the region object
    newState.color = value.color + "80"; // Update the color of the region with 50% opacity
    newState.data.labels = [
      {
        ...value,
        attributes: [
          ...value["attributes"].map((attr) => {
            return {
              ...attr,
              values: [],
            };
          }),
        ],
      },
    ];
    updatedRegion[regionIndex] = newState;
    setRegions(updatedRegion);
    setSelectedSegment(newState);
    setIsInputGiven((prev) => prev + " lb");
  };

  return (
    <>
      {/* table info */}
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          Segment Details
        </h3>
        {/* <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Personal details and application.</p> */}
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Segment name
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {selectedSegment.attributes.label}
            </dd>
          </div>
          <div className="mb-4 pt-4 border-t border-gray-100">
            {" "}
            <Listbox value={currentLabel} onChange={handleLabelChange}>
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                    Select a label
                  </Listbox.Label>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-audino-primary sm:text-sm sm:leading-6">
                      <span className="block truncate">
                        {currentLabel
                          ? getLabelName(currentLabel.id)
                          : "Select a label"}{" "}
                        {/* Render placeholder text when currentLabel is null */}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {getLabelsQuery?.data.map((label) => (
                          <Listbox.Option
                            key={label.id}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? "bg-audino-primary text-white"
                                  : "text-gray-900",
                                "relative cursor-default select-none py-2 pl-3 pr-9"
                              )
                            }
                            value={label}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "block truncate"
                                  )}
                                >
                                  {label.name}
                                </span>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active
                                        ? "text-white"
                                        : "text-audino-primary",
                                      "absolute inset-y-0 right-0 flex items-center pr-4"
                                    )}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </>
              )}
            </Listbox>
          </div>

          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              {currentLabel ? (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    {getLabelName(currentLabel.id)}
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {renderAttributesofLabel(currentLabel).map((attr) => (
                      <div className="mb-4" key={`projectatt-${attr.id}`}>
                        <label
                          htmlFor={attr.name}
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          {attr.name}
                        </label>
                        <CustomSelect
                          id={attr.name}
                          name={attr.name}
                          options={attr.values.map((label_value) => {
                            return {
                              label: label_value,
                              value: label_value,
                            };
                          })}
                          // formError={formError}
                          value={currentRegionValue(currentLabel.id, attr.id)}
                          // value={selectedSegment.proj.name}
                          // isMultiple={attr.input_type === "select"}
                          onChange={(e) =>
                            handleOnChangeLabel(
                              attr,
                              e,
                              selectedSegment.id,
                              currentLabel.id
                            )
                          }
                        />
                      </div>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Start time
            </dt>
            <CustomInput
              type="number"
              name="start_time"
              id="start_time"
              step={0.01}
              value={getInputValue("start", false)}
              placeholder=""
              onChange={(e) =>
                handleValueChange("start", e.target.value, false)
              }
              onBlur={(e) => handleValueChangeOnBlur("start", e.target.value)}
            />
            {/* <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {parseFloat(selectedSegment.start).toFixed(2)} sec
            </dd> */}
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              End time
            </dt>
            <CustomInput
              type="number"
              name="end_time"
              id="end_time"
              step={0.01}
              value={getInputValue("end", false)}
              placeholder=""
              onChange={(e) => handleValueChange("end", e.target.value, false)}
              onBlur={(e) => handleValueChangeOnBlur("end", e.target.value)}
            />
            {/* <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {parseFloat(selectedSegment.end).toFixed(2)} sec
            </dd> */}
          </div>
        </dl>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label
          htmlFor="transcription"
          className="block text-sm font-medium leading-6 text-gray-900 mb-2"
        >
          Segment transcription
        </label>
        <CustomInput
          type="text"
          inputType="textarea"
          refs={inputTextRef}
          name="transcription"
          id="transcription"
          // formError={formError}
          placeholder="Transcription"
          value={getInputValue("transcription")}
          onChange={(e) => {
            handleValueChange("transcription", e.target.value);
          }}
        />
      </div>

      <div className="pt-4">
        <label
          htmlFor="gender"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Gender
        </label>
        <CustomSelect
          id="gender"
          name="gender"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Others", value: "others" },
          ]}
          // formError={formError}
          value={getInputValue("gender")}
          onChange={(e) => handleValueChange("gender", e.target.value)}
        />
      </div>

      <div className="pt-4">
        <label
          htmlFor="locale"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Locale
        </label>
        <CustomSelect
          id="locale"
          name="locale"
          options={[
            { label: "English (US)", value: "en-US" },
            { label: "Spanish (Spain)", value: "es-ES" },
            { label: "French (France)", value: "fr-FR" },
            { label: "Chinese (Simplified)", value: "zh-CN" },
            { label: "Hindi (India)", value: "hi-IN" },
            { label: "Arabic (Egypt)", value: "ar-EG" },
            { label: "Portuguese (Brazil)", value: "pt-BR" },
            { label: "Japanese (Japan)", value: "ja-JP" },
            { label: "German (Germany)", value: "de-DE" },
            { label: "Russian (Russia)", value: "ru-RU" },
          ]}
          // formError={formError}
          value={getInputValue("locale")}
          onChange={(e) => handleValueChange("locale", e.target.value)}
        />
      </div>

      <div className="pt-4">
        <label
          htmlFor="accent"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Accent
        </label>
        <CustomSelect
          id="accent"
          name="accent"
          options={[
            { label: "American English", value: "en-US" },
            { label: "British English", value: "en-GB" },
            { label: "Australian English", value: "en-AU" },
            { label: "Canadian English", value: "en-CA" },
            { label: "Irish English", value: "en-IE" },
            { label: "Scottish English", value: "en-SC" },
            { label: "South African English", value: "en-ZA" },
            { label: "Indian English", value: "en-IN" },
            { label: "French", value: "fr" },
            { label: "Spanish", value: "es" },
            { label: "German", value: "de" },
            { label: "Italian", value: "it" },
            { label: "Chinese (Mandarin)", value: "zh-CN" },
            { label: "Chinese (Cantonese)", value: "zh-HK" },
            { label: "Japanese", value: "ja" },
            { label: "Russian", value: "ru" },
            { label: "Others", value: "others" },
          ]}
          // formError={formError}
          value={getInputValue("accent")}
          onChange={(e) => handleValueChange("accent", e.target.value)}
        />
      </div>

      <div className="pt-4">
        <label
          htmlFor="emotion"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Emotion
        </label>
        <CustomSelect
          id="emotion"
          name="emotion"
          options={[
            { label: "Happy 😄", value: "happy" },
            { label: "Sad 😢", value: "sad" },
            { label: "Angry 😠", value: "angry" },
            { label: "Surprised 😲", value: "surprised" },
            { label: "Fearful 😨", value: "fearful" },
            { label: "Disgusted 🤢", value: "disgusted" },
            { label: "Excited 😃", value: "excited" },
            { label: "Calm 😌", value: "calm" },
            { label: "Confused 🤔", value: "confused" },
            { label: "Neutral 😐", value: "neutral" },
            { label: "Others", value: "others" },
          ]}
          // formError={formError}
          value={getInputValue("emotion")}
          onChange={(e) => handleValueChange("emotion", e.target.value)}
        />
      </div>

      <div className="mb-4 pt-4">
        <label
          htmlFor="age"
          className="block text-sm font-medium leading-6 text-gray-900 mb-2"
        >
          Age
        </label>
        <CustomInput
          type="number"
          name="age"
          id="age"
          // formError={formError}
          placeholder="age"
          value={getInputValue("age")}
          onChange={(e) => {
            handleValueChange("age", e.target.value.toString());
          }}
        />
      </div>
    </>
  );
}

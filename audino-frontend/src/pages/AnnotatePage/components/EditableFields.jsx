import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import CustomSelect from "../../../components/CustomInput/CustomSelect";
import CustomInput from "../../../components/CustomInput/CustomInput";
import { toast } from "react-hot-toast";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";
import langOptions from "../../../constants/langOptions";
import { DATASET_MAPING } from "../../../constants/constants";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function EditableFields({
  inputTextRef,
  totalDuration,

  regions,
  setRegions,
  undoStackRef,
  redoStackRef,
  currentAnnotationIndex,

  getLabelsQuery,
  getJobDetailQuery,
}) {
  const [lang, setLang] = useState("en");

  const getAttributeValues = (labelId, attrIdx) => {
    return getLabelsQuery.data
      .find((label) => label.id === labelId)
      .attributes[attrIdx].values.map((label_value) => {
        return {
          label: label_value,
          value: label_value,
        };
      });
  };

  const handleOnChangeLabel = (event, attrIndex) => {
    const values = [...event.target.selectedOptions]
      .map((opt) => opt.value)
      .filter((value) => value !== "");

    const updatedRegion = [...regions];
    updatedRegion[currentAnnotationIndex].data.label.attributes[
      attrIndex
    ].values = values;

    setRegions(updatedRegion);
  };

  const getInputValue = (key, isDataAttr = true) => {
    const currentRegion = regions[currentAnnotationIndex];
    let currentValue = null;

    if (isDataAttr) currentValue = currentRegion.data[key];
    else currentValue = currentRegion[key];

    if (key === "start" || key === "end")
      currentValue = parseFloat(currentValue);

    return currentValue;
  };

  const handleValueChange = (key, value, isDataAttr = true) => {
    const updatedRegion = [...regions];
    const regionIndex = currentAnnotationIndex;

    if ((key === "start" || key === "end") && parseFloat(value) > totalDuration)
      value = totalDuration;

    if (isDataAttr) updatedRegion[regionIndex].data[key] = value;
    else updatedRegion[regionIndex][key] = value;

    setRegions(updatedRegion);
  };

  const handleValueChangeOnBlur = (key, value) => {
    const updatedRegion = [...regions];
    const regionIndex = currentAnnotationIndex;
    let errorMsg = "";

    if (key === "start" && value > parseFloat(updatedRegion[regionIndex].end)) {
      value = parseFloat(updatedRegion[regionIndex].end);
      errorMsg = "Start time should be less than end time.";
    }

    if (key === "end" && value < parseFloat(updatedRegion[regionIndex].start)) {
      value = parseFloat(updatedRegion[regionIndex].start);
      errorMsg = "End time should be greater than start time.";
    }

    if (errorMsg !== "") toast.error(errorMsg);

    updatedRegion[regionIndex][key] = value;
    setRegions(updatedRegion);
  };

  const handleLabelChange = (value) => {
    // replace the old label with the new label in the annotation coming from server
    const updatedRegion = [...regions];
    const regionIndex = currentAnnotationIndex;

    undoStackRef.current.push(JSON.parse(JSON.stringify(updatedRegion)));
    redoStackRef.current = [];

    const newState = { ...updatedRegion[regionIndex] }; // Shallow copy of the region object
    newState.color = value.color + "80"; // Update the color of the region with 50% opacity
    newState.data.label = {
      ...value,
      attributes: [
        ...value["attributes"].map((attr) => {
          return {
            ...attr,
            values: [],
          };
        }),
      ],
    };

    updatedRegion[regionIndex] = newState;
    setRegions(updatedRegion);
  };

  const showGender = getJobDetailQuery.data?.task_flags?.is_gender ?? false;
  const showLang = getJobDetailQuery.data?.task_flags?.is_locale ?? false;
  const showAccent = getJobDetailQuery.data?.task_flags?.is_accent ?? false;
  const showAge = getJobDetailQuery.data?.task_flags?.is_age ?? false;
  const showEmotion =
    getJobDetailQuery.data?.task_flags?.is_emotion ?? false;
  const showTranscription =
    getJobDetailQuery.data?.task_flags?.is_transcription ?? false;

  return (
    <>
      {/* table info */}
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 dark:text-audino-light-silver text-gray-900">
          Segment Details
        </h3>
        {/* <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Personal details and application.</p> */}
      </div>
      <div className="mt-6 border-t dark:border-audino-neutral-gray border-gray-100">
        <dl className="divide-y dark:divide-audino-neutral-gray divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver">
              Segment name
            </dt>
            <dd className="mt-1 text-sm leading-6 dark:text-audino-gray text-gray-700 sm:col-span-2 sm:mt-0">
              {regions[currentAnnotationIndex].attributes.label}
            </dd>
          </div>
          <div className="mb-4 pt-4 border-t border-gray-100">
            {" "}
            <Listbox
              value={regions[currentAnnotationIndex].data.label}
              onChange={handleLabelChange}
            >
              {({ open }) => (
                <>
                  <Listbox.Label className="block text-sm font-medium leading-6 dark:text-audino-light-silver text-gray-900">
                    Select a label
                  </Listbox.Label>
                  <div className="relative mt-2">
                    <Listbox.Button className="relative w-full cursor-default rounded-md dark:bg-audino-light-navy bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-[#575e77] shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-audino-charcoal focus:outline-none focus:ring-2 focus:ring-audino-primary sm:text-sm sm:leading-6">
                      <span className="block truncate">
                        {regions[currentAnnotationIndex].data.label.name}
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
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-audino-light-navy py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {getLabelsQuery?.data.map((label) => (
                          <Listbox.Option
                            key={label.id}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? "bg-audino-primary dark:bg-audino-green-translucent text-white"
                                  : "text-gray-900 dark:text-[#575e77]",
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

          <div className="mt-6 border-t dark:border-[#181111] border-gray-100">
            <dl className="divide-y dark:divide-audino-neutral-gray divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 dark:text-audino-light-silver text-gray-900">
                  {regions[currentAnnotationIndex].data.label.name}
                </dt>
                <dd className="mt-1 text-sm leading-6 dark:text-audino-light-silver text-gray-700 sm:col-span-2 sm:mt-0">
                  {regions[currentAnnotationIndex].data.label.attributes.map(
                    (attr, attrIndex) => (
                      <div className="mb-4" key={`projectatt-${attr.id}`}>
                        <label
                          htmlFor={attr.name}
                          className="block text-sm font-medium leading-6 dark:text-audino-light-silver text-gray-900"
                        >
                          {attr.name}
                        </label>
                        <CustomSelect
                          id={attr.name}
                          name={attr.name}
                          options={getAttributeValues(
                            regions[currentAnnotationIndex].data.label.id,
                            attrIndex
                          )}
                          // only one value is selected
                          value={
                            regions[currentAnnotationIndex].data.label
                              .attributes[attrIndex].values.length > 0
                              ? regions[currentAnnotationIndex].data.label
                                  .attributes[attrIndex].values[0]
                              : ""
                          }
                          onChange={(e) => handleOnChangeLabel(e, attrIndex)}
                        />
                      </div>
                    )
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver">
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
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver">
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
          </div>
        </dl>
      </div>

      {showTranscription && (
        <div className="pt-4 border-t border-gray-100 dark:border-audino-neutral-gray">
          <div className="flex justify-between mb-2">
            <label
              htmlFor="transcription"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver"
            >
              Segment transcription
            </label>

            <CustomSelect
              id={"language"}
              options={langOptions}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className={"!text-xs w-min !mt-0"}
            />
          </div>
          {lang === "kd010" ? (
            <CustomInput
              type="text"
              inputType="textarea"
              refs={inputTextRef}
              name="transcription"
              id="transcription"
              // formError={formError}
              value={getInputValue("transcription")}
              onChange={(e) => {
                handleValueChange("transcription", e.target.value);
              }}
              style={{ fontFamily: "Kruti Dev", fontSize: "1.2rem" }}
            />
          ) : lang === "en" ? (
            <CustomInput
              type="text"
              inputType="textarea"
              refs={inputTextRef}
              name="transcription"
              id="transcription"
              // formError={formError}
              value={getInputValue("transcription")}
              onChange={(e) => {
                handleValueChange("transcription", e.target.value);
              }}
            />
          ) : (
            <ReactTransliterate
              value={getInputValue("transcription")}
              onChangeText={(text) => {
                handleValueChange("transcription", text);
              }}
              lang={lang}
              className="block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 !outline-none dark:bg-audino-light-navy dark:text-audino-cloud-gray ring-gray-300 dark:ring-audino-charcoal placeholder:text-gray-300 focus:ring-audino-primary text-gray-900 "
              renderComponent={(props) => {
                inputTextRef.current = props.ref.current;
                return <textarea {...props} />;
              }}
            />
          )}
        </div>
      )}

      {showGender && (
        <div className="pt-4">
          <label
            htmlFor="gender"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver"
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
      )}
      {showLang && (
        <div className="pt-4">
          <label
            htmlFor="locale"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver"
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
      )}

      {showAccent && (
        <div className="pt-4">
          <label
            htmlFor="accent"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver"
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
      )}

      {showEmotion && (
        <div className="pt-4">
          <label
            htmlFor="emotion"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver"
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
      )}

      {showAge && (
        <div className="mb-4 pt-4">
          <label
            htmlFor="age"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-audino-light-silver mb-2"
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
      )}
    </>
  );
}

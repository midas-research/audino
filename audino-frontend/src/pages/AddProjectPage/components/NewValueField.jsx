import Picker from "@emoji-mart/react";
import {
  FaceSmileIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function NewValueField({
  onRemoveLabel,
  index,
  showEmojiList,
  setShowEmojiList,
  value,
  setValue,
  placeholder = "Value",
  error = "",
}) {

  const fetchEmojiData = async () => {
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@emoji-mart/data"
    );

    return response.json();
  };

  return (
    <>
      <div className="relative flex rounded-md shadow-sm w-full">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <input
            type="text"
            name="text"
            id="text"
            className="block w-full rounded-none dark:bg-audino-light-navy  rounded-l-md border-0 py-1.5 text-gray-900 dark:text-audino-cloud-gray ring-1 ring-inset dark:ring-audino-charcoal ring-gray-300 placeholder:text-gray-400 dark:placeholder:text-audino-cloud-gray focus:ring-2 focus:ring-inset focus:ring-audino-primary text-sm sm:leading-6"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
          />
        </div>
        <>
          <button
            type="button"
            className={`relative inline-flex dark:bg-audino-light-navy items-center gap-x-1.5 px-3 py-2 text-sm font-semibold text-gray-900 border-y border-gray-300 dark:border-audino-charcoal hover:bg-gray-50 border-r ${
              typeof onRemoveLabel === "function" ? "" : "rounded-r-md"
            }`}
            onClick={() =>
              setShowEmojiList((prev) =>
                prev.map((val, ind) => {
                  if (ind === index) {
                    return !val;
                  } else return 0;
                })
              )
            }
          >
            {showEmojiList[index] ? (
              <XMarkIcon
                className="-ml-0.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            ) : (
              <FaceSmileIcon
                className="-ml-0.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            )}
          </button>

          {/* render emoji box */}
          {showEmojiList[index] ? (
            <div className="absolute top-10 left-0 z-10">
              <div
                className="fixed inset-0"
                onClick={() =>
                  setShowEmojiList((prev) =>
                    prev.map((val, ind) => {
                      if (ind === index) {
                        return !val;
                      } else return 0;
                    })
                  )
                }
              />
              <Picker
                data={fetchEmojiData}
                onEmojiSelect={(val) => setValue(value + " " + val.native)}
              />
            </div>
          ) : null}
        </>
        {typeof onRemoveLabel === "function" ? (
          <button
            type="button"
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset dark:ring-audino-graphite ring-gray-300 hover:bg-gray-50 dark:hover:bg-transparent"
            onClick={() => onRemoveLabel(index)}
          >
            <TrashIcon
              className="-ml-0.5 h-5 w-5 text-red-400"
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600 font-normal">{error?.replace(/\.\d+\./, " ")}</p> : null}
    </>
  );
}

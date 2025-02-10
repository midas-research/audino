import { TrashIcon } from "@heroicons/react/24/outline";

export default function NewInputeField({
  onRemoveLabel,
  index,
  value,
  setValue,
  placeholder = "manifest.jsonl",
  error = "",
}) {
  return (
    <>
      <div className="relative flex rounded-md shadow-sm w-full">
        <input
          type="text"
          className="block w-full rounded-l-md dark:bg-audino-light-navy border-0 py-1.5 text-gray-900 dark:text-audino-cloud-gray ring-1 ring-inset dark:ring-audino-charcoal ring-gray-300 placeholder:text-gray-400 dark:placeholder:text-audino-cloud-gray focus:ring-2 focus:ring-inset focus:ring-audino-primary text-sm"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {onRemoveLabel && (
          <button
            type="button"
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-gray-900 ring-1 ring-inset dark:ring-audino-graphite ring-gray-300 hover:bg-gray-50"
            onClick={() => onRemoveLabel(index)}
          >
            <TrashIcon className="h-5 w-5 text-red-400" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error.replace(/\.\d+\./, " ")}</p>}
    </>
  );
}

import { ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";

function NoContentMessage({ message = "No content found" }) {
    return (
        <div className="mt-4 gap-y-2 flex flex-col items-center justify-center">
            <ArchiveBoxXMarkIcon className="text-gray-400 h-10 w-10" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
        </div>
    );
}

export default NoContentMessage;
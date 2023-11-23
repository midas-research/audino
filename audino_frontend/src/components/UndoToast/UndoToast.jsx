import { useEffect } from "react";

const SimpleUndoToast = ({ onClose, regionName }) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose(); // Dismiss the toast after 5 seconds
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 relative">
      <div className="w-full flex flex-row justify-between items-center p-2">
        <div className="p-1">
          <p className="text-xs font-medium text-gray-500">
            Section Label: {regionName}
          </p>
          <p className="text-sm font-medium text-gray-900">
            Hold on! Deleting the selected region...
          </p>
        </div>
        <button
          onClick={() => {
            onClose(); // Dismiss the toast on "Undo" click
          }}
          className="border border-transparent rounded-md w-20 h-10 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-1 focus:ring-green-500 "
        >
          Undo
        </button>
      </div>
      <div className="absolute bottom-0 w-full h-1 bg-green-500 animate-border" />
    </div>
  );
};

export default SimpleUndoToast;

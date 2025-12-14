import React, { useState } from "react";

export default function DragInput({ handleInputChange, isMultiple }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      let audioFiles = Array.from(event.dataTransfer.files).filter(file =>
        file.type.startsWith('audio/')
      );
      // if (!isMultiple && audioFiles.length > 1) {
      //   audioFiles = [audioFiles[0]]; // Restrict to a single file if isMulti is false
      // }
      if (audioFiles.length > 0) {
        handleInputChange("files", audioFiles);
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full mt-2">
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${
          dragActive ? "bg-gray-50" : "border-gray-300 dark:border-audino-charcoal"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500">Upload Audio file only</p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          multiple={true}
          className="hidden"
          accept=".mp3,audio/*"
          onChange={(e) => handleInputChange("files", e.target.files)}
        />
      </label>
    </div>
  );
}

import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChevronUpDownIcon,
  CodeBracketSquareIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassMinusIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ReactComponent as BackIcon } from "../../../assets/svgs/back.svg";
import { ReactComponent as ForwardIcon } from "../../../assets/svgs/forward.svg";
import { ReactComponent as KeyboardIcon } from "../../../assets/svgs/keyboard.svg";
import Tooltip from "../../../components/Tooltip/Tooltip";
import { useEffect, useRef, useState } from "react";
import formatTime from "../../../utils/formatTime";
import CustomSelect from "../../../components/CustomInput/CustomSelect";
import { Menu, Transition } from "@headlessui/react";
import KeyShortcutModal from "./KeyShortcutModal";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function WaveButtons({
  wavesurferRef,
  progressBarRef,
  undoButtonRef,
  redoButtonRef,
  // generateRegion
  isPlaying,
  initialVerticalZoom,
  initialVerticalHeight,
  totalDuration,

  volume,
  setVolume,
  regions,
  setRegions,
  horizontalZoom,
  setHorizontalZoom,
  undoStackRef,
  redoStackRef,

  handleBackward,
  handleForward,
  handlePlay,
}) {
  const [trackSpeed, setTrackSpeed] = useState(1);
  const [verticalZoom, setVerticalZoom] = useState(1);
  const [keyShortcutModalOpen, setKeyShortcutModalOpen] = useState(false);
  const horizontalZoomRef = useRef(1);
  const verticalZoomRef = useRef(1);

  useEffect(() => {
    const handleMouseScroll = (event) => {
      if (event.altKey) {
        event.preventDefault();
        console.log("checking scroll event");
        let newZoom = horizontalZoomRef.current;
        if (event.deltaY < 0 && newZoom < 200) {
          newZoom = newZoom + 10;
        } else if (event.deltaY > 0 && newZoom > 0) {
          newZoom = newZoom - 10;
        }
        setHorizontalZoom(newZoom);
        wavesurferRef.current.zoom(newZoom);
      } else if (event.shiftKey) {
        event.preventDefault();
        console.log("checking ver event");
        let newZoom = verticalZoomRef.current;
        const verticalZoomFactor = 0.02;
        const verticalHeightFactor = 1;
        if (event.deltaY < 0 && newZoom < 100) {
          newZoom = newZoom + 10;
        } else if (event.deltaY > 0 && newZoom > 0) {
          newZoom = newZoom - 10;
        }
        setVerticalZoom(newZoom);
        wavesurferRef.current.setHeight(
          initialVerticalHeight + newZoom * verticalHeightFactor
        );
        wavesurferRef.current.params.barHeight =
          initialVerticalZoom + newZoom * verticalZoomFactor;

        wavesurferRef.current.drawBuffer();
      }
    };
    document.addEventListener("wheel", handleMouseScroll, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleMouseScroll);
    };
  }, []);

  useEffect(() => {
    horizontalZoomRef.current = horizontalZoom;
  }, [horizontalZoom]);

  useEffect(() => {
    verticalZoomRef.current = verticalZoom;
  }, [verticalZoom]);

  const handleHorizontalZoomChange = (type, value) => {
    let newZoom = value;
    if (type === "incr" && value < 200) {
      newZoom = newZoom + 10;
    }
    if (type === "decr" && value > 0) {
      newZoom = newZoom - 10;
    }
    console.log("newZoom", newZoom);
    setHorizontalZoom(newZoom);
    wavesurferRef.current.zoom(newZoom);
  };

  const handleVerticalZoomChange = (type, value) => {
    let newValue = value;
    const verticalZoomFactor = 0.02;
    const verticalHeightFactor = 1;
    if (type === "incr" && value < 100) {
      newValue = newValue + 10;
    }
    if (type === "decr" && value > 0) {
      newValue = newValue - 10;
    }

    setVerticalZoom(newValue);
    wavesurferRef.current.setHeight(
      initialVerticalHeight + newValue * verticalHeightFactor
    );
    wavesurferRef.current.params.barHeight =
      initialVerticalZoom + newValue * verticalZoomFactor;

    wavesurferRef.current.drawBuffer();
  };

  const handleVolumeChange = (type, value) => {
    let newVolume = value;
    if (type === "incr" && value < 100) {
      newVolume = newVolume + 10;
    }
    if (type === "decr" && value > 0) {
      newVolume = newVolume - 10;
    }
    console.log("newVolume", newVolume);
    setVolume(newVolume);
    wavesurferRef.current.setVolume(newVolume / 100);
  };

  const handleUndo = () => {
    if (undoStackRef.length === 0) return;
    const lastState = undoStackRef.current.pop();
    redoStackRef.current.push(regions);
    setRegions(lastState);
  };

  const handleRedo = () => {
    if(redoStackRef.current.length === 0) return;
    const lastState = redoStackRef.current.pop();
    undoStackRef.current.push(regions);
    setRegions(lastState);
  };

  return (
    <>
      <p className="truncate dark:text-white text-center text-sm font-bold leading-6 my-2">
        <span id="currentTime"></span> - {formatTime(totalDuration) || "00:00"}
      </p>
      <div className="relative w-full">
        <div className="bg-slate-100 dark:bg-audino-midnight h-1.5 w-full rounded-lg"></div>
        <div
          className="bg-audino-primary h-1.5 rounded-lg absolute top-0"
          ref={progressBarRef}
        ></div>
      </div>

      <div className="grid grid-cols-6 items-center justify-between py-4">
        <div className="col-span-2 flex">
          {/* <div className="flex items-center gap-2 justify-center">
            <Tooltip message="Create random region">
              <button
                type="button"
                className="relative inline-flex items-center bg-white p-2 text-gray-400 hover:bg-gray-50 rounded-full focus:z-10"
                onClick={generateRegion}
              >
                <span className="sr-only">Random Annotation</span>
                <CodeBracketSquareIcon className="h-6 w-6 stroke-slate-500 group-hover:stroke-slate-700" />
              </button>
            </Tooltip>
          </div> */}
          <div className="flex items-center gap-2 justify-center">
            <Tooltip message="Undo">
              <button
                type="button"
                ref={undoButtonRef}
                className="relative inline-flex items-center dark:bg-audino-navy bg-white p-2 text-gray-400 dark:text-white hover:bg-gray-50 rounded-full focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUndo}
                disabled={undoStackRef.current.length === 0}
              >
                <span className="sr-only">Undo</span>
                <ArrowUturnLeftIcon className="h-4 w-4 md:h-5 md:w-5 dark:stroke-white stroke-slate-500 group-hover:stroke-slate-700 dark:group-hover:stroke-white" />
              </button>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1 md:gap-2 justify-center">
            <Tooltip message="Redo">
              <button
                type="button"
                ref={redoButtonRef}
                className="relative inline-flex items-center dark:bg-audino-navy bg-white   p-2 text-gray-400 dark:text-white hover:bg-gray-50 rounded-full focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRedo}
                disabled={redoStackRef.current.length === 0}
              >
                <span className="sr-only">Redo</span>
                <ArrowUturnRightIcon className="h-4 w-4 md:h-5 md:w-5 dark:stroke-white stroke-slate-500 group-hover:stroke-slate-700 dark:group-hover:stroke-white" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="col-span-2 flex justify-center items-center md:gap-4 gap-1">
          <button
            type="button"
            className="relative inline-flex items-center dark:bg-audino-navy bg-white p-2 dark:text-white text-gray-400 hover:bg-gray-50 rounded-full focus:z-10"
            onClick={handleBackward}
          >
            <span className="sr-only">Backward</span>
            <BackIcon className="h-4 w-4 md:h-6 md:w-6 stroke-slate-500 dark:stroke-white group-hover:stroke-slate-700 dark:group-hover:stoke-white" />
          </button>
          <button
            type="button"
            className="relative inline-flex items-center text-gray-400 p-2 focus:z-10
                   rounded-full dark:bg-audino-gradient bg-slate-700 hover:bg-slate-900 focus:outline-none
        "
            onClick={handlePlay}
          >
            <span className="sr-only">Play/ Pause</span>
            {isPlaying ? (
              <PauseIcon className="h-4 w-4 md:h-6 md:w-6 text-white" aria-hidden="true" />
            ) : (
              <PlayIcon className="h-4 w-4 md:h-6 md:w-6 text-white" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="relative inline-flex items-center dark:bg-audino-navy bg-white p-2 dark:text-white text-gray-400 hover:bg-gray-50 rounded-full focus:z-10"
            onClick={handleForward}
          >
            <span className="sr-only">Forward</span>
            <ForwardIcon className="h-4 w-4 md:h-6 md:w-6 dark:stroke-white stroke-slate-500 group-hover:stroke-slate-700 dark:group-hover:stroke-white" />
          </button>
        </div>
       

        <div className="col-span-2 flex items-center gap-2  justify-end">
          {/* <Tooltip message="Change vertical zoom"> */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="relative inline-flex items-center dark:bg-audino-navy bg-white pt-2 sm:p-2 text-gray-500 dark:text-white hover:bg-gray-50 dark:hover:bg-audino-navy rounded-full focus:z-10">
                <ChevronUpDownIcon className="h-4 w-4 md:h-6 md:w-6 dark:stroke-white stroke-slate-500 group-hover:stroke-slate-700 dark:group-hover:stroke-white" />
              </Menu.Button>
            </div>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 origin-top-right rounded-md dark:bg-audino-deep-space bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                <div className="flex flex-col items-start justify-center ">
                  <label
                    htmlFor="vertical_range"
                    className="text-sm font-medium leading-6 dark:text-white text-gray-900"
                  >
                    Vertical Zoom
                  </label>
                  <input
                    id="vertical_range"
                    type="range"
                    min="0"
                    max="100"
                    value={verticalZoom}
                    onChange={(e) =>
                      handleVerticalZoomChange(
                        "change",
                        parseInt(e.target.value)
                      )
                    }
                    className="h-6"
                  />
                </div>
              </Menu.Items>
              
            </Transition>
          </Menu>

          {/* <Tooltip message="Change horizontal zoom"> */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="relative inline-flex items-center dark:bg-audino-navy bg-white pt-2 sm:p-2 text-gray-500 dark:text-white hover:bg-gray-50 dark:hover:bg-audino-navy rounded-full focus:z-10">
                <ChevronUpDownIcon className="h-4 w-4 md:h-6 md:w-6 dark:stroke-white stroke-slate-500 group-hover:stroke-slate-700 dark:group-hover:stroke-white rotate-90" />
              </Menu.Button>
            </div>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 origin-top-right rounded-md dark:bg-audino-deep-space  bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                <div className="flex flex-col items-start justify-center ">
                  <label
                    htmlFor="vertical_range"
                    className="text-sm font-medium leading-6 dark:text-white text-gray-900"
                  >
                    Horizontal Zoom
                  </label>{" "}
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={horizontalZoom}
                    onChange={(e) =>
                      handleHorizontalZoomChange(
                        "change",
                        parseInt(e.target.value)
                      )
                    }
                    className="h-6"
                  />
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          {/* </Tooltip> */}

          {/* <Tooltip message="Change volume"> */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="relative inline-flex items-center dark:bg-audino-navy bg-white pt-2 sm:p-2 text-gray-500 dark:text-white hover:bg-gray-50 dark:hover:bg-audino-navy rounded-full focus:z-10">
                <SpeakerWaveIcon className="h-4 w-4 md:h-6 md:w-6 dark:stroke-white stroke-slate-500 group-hover:stroke-slate-700 dark:group-hover:stroke-white" />
              </Menu.Button>
            </div>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10  origin-top-right rounded-md dark:bg-audino-deep-space bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex items-center p-2">
                <div className="flex flex-col items-start justify-center ">
                  <label
                    htmlFor="vertical_range"
                    className="text-sm font-medium leading-6 dark:text-white text-gray-900"
                  >
                    Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) =>
                      handleVolumeChange("change", parseInt(e.target.value))
                    }
                    className="h-6"
                  />
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          {/* </Tooltip> */}

          {/* <Tooltip message="Change speed"> */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="relative inline-flex items-center dark:bg-audino-navy bg-white    sm:p-2 text-gray-500 dark:text-white  sm:text-sm text-xs hover:bg-gray-50 dark:hover:bg-audino-navy rounded-full focus:z-10">
                {trackSpeed}x
              </Menu.Button>
            </div>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 w-24 origin-top-right  rounded-md dark:bg-audino-deep-space bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"].map(
                    (val) => {
                      return (
                        <Menu.Item key={val}>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                setTrackSpeed(val);
                                wavesurferRef.current.setPlaybackRate(val);
                              }}
                              className={classNames(
                                val == trackSpeed
                                  ? "bg-gray-100 dark:bg-audino-green-translucent text-gray-900 dark:text-white "
                                  : "text-gray-700 dark:text-white",
                                "block px-4 py-2 text-xs sm:text-sm w-full text-left dark:hover:bg-audino-green-translucent hover:bg-gray-100 hover:text-gray-900"
                              )}
                            >
                              {val === "1" ? "Normal" : val}
                            </button>
                          )}
                        </Menu.Item>
                      );
                    }
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          {/* </Tooltip> */}
          <Tooltip message="Audino Shortcuts">
            <button
              type="button"
              className="relative  items-center dark:bg-audino-navy bg-white hidden lg:inline-flex p-2 text-gray-400 dark:text-white hover:bg-gray-50 dark:hover:bg-audino-navy rounded-full focus:z-10 outline-none"
              onClick={() => setKeyShortcutModalOpen(true)}
            >
              <KeyboardIcon className="h-6 w-6 dark:stroke-white stroke-slate-500 group-hover:stroke-slate-700 dark:group-hover:stroke-white" />
            </button>
          </Tooltip>
        </div>
      </div>

      <KeyShortcutModal
        open={keyShortcutModalOpen}
        setOpen={setKeyShortcutModalOpen}
      />
    </>
  );
}

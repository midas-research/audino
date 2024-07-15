import { useEffect, useState, Fragment } from "react";
import Tooltip from "../../../components/Tooltip/Tooltip";
import {
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { v4 as uuid } from "uuid";
import { toast } from "react-hot-toast";
import AudinoPopover from "../../../components/Popover/Popover";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function RegionsList({
  isScrolled,
  regions,
  setRegions,
  setCurrentHistoryIndex,
  changeHistory,
  setChangeHistory,
  selectedSegment,
  removeAnnotationMutation,
  removeCurrentRegion,
  handleRegionClick,
}) {
  const unique_id = uuid();
  const [dragData, setDragData] = useState({});
  const [hiddenRegions, setHiddenRegions] = useState([]); // Array to store the hidden regions

  const handleShowColor = (color) => {
    // check if color is rgba or hex
    if (color.includes("#")) {
      return color.substring(0, color.length - 2);
    } else {
      return color;
    }
  };

  const handleLock = (regionIndex) => {
    const updatedRegion = [...regions];
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
    newState.drag = !updatedRegion[regionIndex]?.drag;
    updatedRegion[regionIndex] = newState;
    setRegions(updatedRegion);
  };

  function modifyZIndex(firstId, secondId) {
    const firstRegionElement = document.querySelector(
      `.wavesurfer-region[data-id="${firstId}"]`
    );
    const secondRegionElement = document.querySelector(
      `.wavesurfer-region[data-id="${secondId}"]`
    );

    // Check if the element is found and then interchange the z-index
    if (firstRegionElement && secondRegionElement) {
      const firstRegionZIndex = firstRegionElement.style.zIndex;
      firstRegionElement.style.zIndex = secondRegionElement.style.zIndex;
      secondRegionElement.style.zIndex = firstRegionZIndex;
    }
  }

  const handleMove = (index, direction) => {
    const tempRegions = [...regions];

    if (index < 0 || index >= tempRegions.length) {
      return; // Index out of bounds
    }

    if (direction === "up" && index === 0) {
      return; // Item already at the first position
    }

    if (direction === "down" && index === tempRegions.length - 1) {
      return; // Item already at the last position
    }

    if (direction === "up") {
      [tempRegions[index], tempRegions[index - 1]] = [
        tempRegions[index - 1],
        tempRegions[index],
      ];

      modifyZIndex(tempRegions[index].id, tempRegions[index - 1].id);
    }
    if (direction === "down") {
      [tempRegions[index], tempRegions[index + 1]] = [
        tempRegions[index + 1],
        tempRegions[index],
      ];
      modifyZIndex(tempRegions[index].id, tempRegions[index + 1].id);
    }
    setRegions(tempRegions);
  };

  const onDragStart = (event, regionIndex) => {
    setDragData(JSON.stringify({ regionIndex }));
  };

  const onDrop = (event, toregionIndex) => {
    event.preventDefault();
    const draggedItem = JSON.parse(dragData);
    const { regionIndex } = draggedItem;
    if (regionIndex !== toregionIndex) {
      const updatedRegions = [...regions];

      // Swap the regions
      const temp = updatedRegions[regionIndex];
      updatedRegions[regionIndex] = updatedRegions[toregionIndex];
      updatedRegions[toregionIndex] = temp;

      modifyZIndex(
        updatedRegions[regionIndex].id,
        updatedRegions[toregionIndex].id
      );
      setRegions(updatedRegions);
    }
  };

  useEffect(() => {
    if (regions.length > 0) {
      regions.forEach((region, index) => {
        let updatedIndex = regions.length - index;
        const regionElement = document.querySelector(
          `.wavesurfer-region[data-id="${region.id}"]`
        );
        if (regionElement) {
          regionElement.style.zIndex = updatedIndex + 3; // z-index starts from 3
          updatedIndex--;
        }
      });
    }
  }, [regions.length]);

  const handleHide = (index) => {
    const regionElement = document.querySelector(
      `.wavesurfer-region[data-id="${regions[index].id}"]`
    );
    if (regionElement) {
      if (hiddenRegions.includes(index)) {
        regionElement.style.display = "block";
        setHiddenRegions(hiddenRegions.filter((item) => item !== index));
      } else {
        regionElement.style.display = "none";
        setHiddenRegions([...hiddenRegions, index]);
      }
    }
  };

  const handleDuplicate = (index) => {
    const currentRegion = regions[index];
    const id = unique_id.slice(0, 3);

    const tempRegion = {
      ...currentRegion,
      id: "wavesurfer_" + id,
      attributes: {
        label: "#" + id,
      },
    };

    setCurrentHistoryIndex(changeHistory.length);
    setChangeHistory([
      ...changeHistory,
      {
        type: "annotation",
        subType: "add",
        data: { ...tempRegion },
      },
    ]);
    setRegions([...regions, tempRegion]);
    toast.success(`${currentRegion.attributes.label} duplicated as #${id}`);
  };

  return (
    <div

    >
      {/* <div className="flex items-center justify-between py-2">
        <h1 className="block text-sm font-medium leading-6 text-gray-900">
          Regions
        </h1>
        <AudinoPopover
          content={
            <Fragment>
              Drag the card to change the region's order. The top region will
              appear in the foreground of all other regions, while the last
              region will be in the background. You can also use the{" "}
              <ChevronDoubleUpIcon className="inline h-4 w-4" /> and{" "}
              <ChevronDoubleDownIcon className="inline h-4 w-4" /> arrows to
              adjust the order. To bring a region to the top, click the{" "}
              <ChevronDoubleUpIcon className="inline h-4 w-4" /> icon or drag it
              to the desired position. To move a region down, click the{" "}
              <ChevronDoubleDownIcon className="inline h-4 w-4" /> icon or drag
              it accordingly.
            </Fragment>
          }
        />
      </div> */}

      {/* FIX: negative margin & padding to overflow the tooltip */}
      <div className="flex my-2 flex-col h-[calc(100vh-180px)] rounded-lg overflow-y-scroll no-scrollbar pr-12 -mr-12 bg-clip-content">
        {regions.map((regionProps, index) => {
          return (

            <div
              draggable
              droppable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, index)}
              onClick={(e) => handleRegionClick(regionProps.id, e)}
              key={regionProps?.id}
              className={`flex ${regionProps?.data?.labels ? "cursor-pointer" : "cursor-not-allowed"}  py-3 mb-2 items-center justify-between shadow rounded p-2 border-l-4 ${selectedSegment?.id === regionProps?.id
                ? "border-l-audino-primary"
                : "border-l-white"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-10 h-5 rounded`}
                  style={{
                    backgroundColor: handleShowColor(regionProps.color),
                  }}
                ></div>
                <p className="text-black">{regionProps?.attributes.label}{regionProps?.data?.labels ? "" : "(GT)"}</p>
              </div>
              <div className="flex gap-3 items-center ">
                <Tooltip message="Hide/Show">
                  {hiddenRegions.includes(index) ? (
                    <EyeSlashIcon
                      className="h-5 w-5 cursor-pointer flex-shrink-0 stroke-slate-500 group-hover:stroke-slate-700"
                      aria-hidden="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHide(index);
                      }}
                    />
                  ) : (
                    <EyeIcon
                      className="h-5 w-5 cursor-pointer flex-shrink-0 stroke-slate-500 group-hover:stroke-slate-700"
                      aria-hidden="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHide(index);
                      }}
                    />
                  )}
                </Tooltip>

                <Tooltip message="Move Up">
                  <ChevronDoubleUpIcon
                    className={`h-5 w-5 flex-shrink-0 stroke-slate-500 
                    ${index === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "group-hover:stroke-slate-700 cursor-pointer"
                      }`}
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "up");
                    }}
                  />
                </Tooltip>

                <Tooltip message="Move Down">
                  <ChevronDoubleDownIcon
                    className={`h-5 w-5 flex-shrink-0 stroke-slate-500
                      ${index === regions.length - 1
                        ? "opacity-50 cursor-not-allowed"
                        : "group-hover:stroke-slate-700 cursor-pointer"
                      }
                      `}
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(index, "down");
                    }}
                  />
                </Tooltip>

                <Tooltip message="Lock/Unlock region">
                  {regionProps?.drag ? (
                    <LockOpenIcon
                      className="h-5 w-5 flex-shrink-0 stroke-slate-500 cursor-pointer group-hover:stroke-slate-700"
                      aria-hidden="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLock(index);
                      }}
                    />
                  ) : (
                    <LockClosedIcon
                      className="h-5 w-5 flex-shrink-0 stroke-slate-500 cursor-pointer group-hover:stroke-slate-700"
                      aria-hidden="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLock(index);
                      }}
                    />
                  )}
                </Tooltip>

                <Menu as="div" className=" inline-block text-left ">
                  <Menu.Button
                    className="flex items-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip message="More">
                      <span className="sr-only">Open options</span>
                      <EllipsisVerticalIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </Tooltip>
                  </Menu.Button>

                  <Transition
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                    className={"relative z-40"}
                  >
                    <Menu.Items className="absolute right-0 z-10 top-0 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        <div
                          className={classNames(
                            "hover:bg-gray-100 hover:text-gray-900 text-gray-700 group flex items-center px-4 py-2 text-sm"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(index);
                          }}
                        >
                          <DocumentDuplicateIcon
                            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          Duplicate
                        </div>
                      </Menu.Item>
                      {/* <Menu.Item>
                        <button
                          className={classNames(
                            "hover:bg-gray-100 hover:text-gray-900 text-gray-700 group flex items-center px-4 py-2 text-sm w-full"
                          )}
                          onClick={() => {
                            
                            removeCurrentRegion(regionProps.id);
                          }}
                          disabled={removeAnnotationMutation.isLoading}
                        >
                          <TrashIcon
                            className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          {removeAnnotationMutation.isLoading
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </Menu.Item> */}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          );
        })}
        <p className="my-2 text-xs text-gray-400 text-center">
          Drag the card to adjust the region's background and foreground order
        </p>
      </div>
    </div>
  );
}

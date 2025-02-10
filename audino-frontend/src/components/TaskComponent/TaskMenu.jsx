import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import classNames from "../../functions/classNames";
import { useTasksStore } from "../../zustand-store/tasks";

export default function TaskMenu({ task, isShowText, isShowEdit }) {
  const navigate = useNavigate();
  const current_task = useTasksStore((state) => state.current_task_details);
  const setCurrentTask = useTasksStore((state) => state.setCurrentTask);

  return (
    <div>
      <Menu as="div" className="relative flex-none">
        <Menu.Button
          className={`flex items-center text-gray-700 dark:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-audino-light-navy ${
            isShowText
              ? "rounded-md border border-white  text-white px-2.5 py-1 text-sm font-semibold "
              : "rounded-full p-2.5 dark:text-gray-500"
          } `}
        >
          {isShowText ? <span className="pr-2">Actions </span> : null}
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md dark:bg-audino-light-navy bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
            {isShowEdit && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => navigate(`/tasks/${task.id}?page=1`)}
                    className={classNames(
                      active ? "bg-gray-50 dark:bg-audino-teal-blue" : "",
                      "block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-gray-100 w-full text-left"
                    )}
                  >
                    Edit
                    <span className="sr-only">, {task.name}</span>
                  </button>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentTask({
                      ...current_task,
                      currentTaskId: task?.id,
                      isExportModal: true,
                    });
                  }}
                  className={classNames(
                    active ? "bg-gray-50 dark:bg-audino-teal-blue" : "",
                    "block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-gray-100 w-full text-left"
                  )}
                >
                  Export annotation
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/tasks/${task.id}/analytics`);
                  }}
                  className={classNames(
                    active ? "bg-gray-50 dark:bg-audino-teal-blue" : "",
                    "block px-3 py-1 text-sm leading-6 dark:text-gray-100 text-gray-900 w-full text-left"
                  )}
                >
                  View Analytics
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? "bg-red-50 dark:bg-red-100" : "",
                    "block px-3 py-1 text-sm leading-6 text-red-900 w-full text-left"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentTask({
                      ...current_task,
                      currentTaskId: task?.id,
                      isDeleteModal: true,
                    });
                  }}
                >
                  Delete
                  <span className="sr-only">, {task.name}</span>
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

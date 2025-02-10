import { Menu, Transition } from '@headlessui/react'
import classNames from '../../functions/classNames'
import { Fragment } from 'react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { useCloudStore } from '../../zustand-store/cloudstorages'
import { useNavigate } from 'react-router-dom'
export const CloudStorageMenu = ({cloud}) => {
  const navigate = useNavigate();
  const current_cloud_storag = useCloudStore((state) => state.current_cloud_details);
  const setCurrentCloudStorage = useCloudStore((state) => state.setCurrentCloudStorage);
  return (

    <Menu as="div" className="relative flex justify-end">
      <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 dark:text-white dark:hover:text-gray-500 hover:text-gray-900">
        <span className="sr-only">Open options</span>
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
          <Menu.Item>
            {({ active }) => (
              <button
              onClick={() => navigate(`/cloud-storages/${cloud.id}?page=1`)}
                className={classNames(
                  active ? "bg-gray-50 dark:bg-audino-teal-blue" : "",
                  `block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-white w-full text-left disabled:opacity-50 disabled:cursor-not-allowed`
                )}
              >
                Update
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={classNames(
                  active ? "bg-red-200 dark:bg-red-200" : "",
                  "block px-3 py-1 text-sm leading-6 text-red-600 w-full text-left"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentCloudStorage({
                    ...current_cloud_storag,
                    currentCloudStorageId: cloud?.id,
                    isDeleteModal: true,
                  })
                }}
              >
                Delete
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

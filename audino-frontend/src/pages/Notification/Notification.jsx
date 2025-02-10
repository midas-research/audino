import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { useNotificationsStore } from "../../zustand-store/notifications";
import {
  useCreateFetchMutation,
  useMarkAllAsReadMutation,
} from "../../services/Notification/useMutations";
import { useSelector } from "react-redux";
import NotificationLoader from "./components/NotificationsLoader";
import toast from "react-hot-toast";
import '../../index.css'
// import Pagination from "../../components/Pagination/Pagination";

const Notification = () => {
  const { audinoUserData } = useSelector((state) => state.loginReducer);
  const { id } = audinoUserData;
  const itemsPerPage = 10;

  const notifications_obj = useNotificationsStore(
    (state) => state.notifications_obj
  );
  const setNotifications = useNotificationsStore(
    (state) => state.setNotifications
  );

  const [notificationsState, setNotificationsState] = useState({
    currentPage: 1,
    hasMorePage: true,
    hasError: false,
    errorMessageShown: false,
  });

  const { currentPage, hasMorePage, hasError, errorMessageShown } =
    notificationsState;

  const observerRef = useRef(null);

  const updateNotificationsState = (newState) => {
    setNotificationsState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };

  const allNotificationsRead = notifications_obj.results.every(
    (notification) => notification.status.is_read === true
  );

  dayjs.extend(advancedFormat);
  dayjs.extend(relativeTime);

  const createFetchNotificationsMutation = useCreateFetchMutation({
    mutationConfig: {
      onSuccess: (data) => {
        if (data.data.notifications.length === 0) {
          updateNotificationsState({ hasMorePage: false });
        } else {
          updateNotificationsState({
            hasMorePage: true,
            hasError: false,
            errorMessageShown: false,
          });
          const allNotifications = [
            ...notifications_obj.results,
            ...data.data.notifications,
          ];

          const uniqueNotifications = allNotifications.reduce(
            (unique, notification) => {
              if (!unique.some((n) => n.id === notification.id)) {
                unique.push(notification);
              }
              return unique;
            },
            []
          );

          setNotifications({
            count: uniqueNotifications.length,
            next: null,
            previous: null,
            results: uniqueNotifications,
          });
        }
      },
      onError: () => {
        if (!errorMessageShown) {
          toast.error("No more notifications available");
          updateNotificationsState({ hasError: true, errorMessageShown: true });
        }
      },
    },
  });

  const createMarkAllAsReadMutation = useMarkAllAsReadMutation({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Notifications marked as read");
      },
    },
  });

  useEffect(() => {
    if (!hasMorePage || createFetchNotificationsMutation.isLoading || hasError)
      return;

    createFetchNotificationsMutation.mutate({
      user: id,
      current_page: currentPage,
      items_per_page: itemsPerPage,
    });
  }, [hasError, currentPage, hasMorePage]);

  const handleMarkAllAsRead = () => {
    setNotifications({
      ...notifications_obj,
      results: notifications_obj.results.map((n) => ({
        ...n,
        status: { ...n.status, is_read: true },
      })),
    });
    createMarkAllAsReadMutation.mutate({
      user: id,
      notification_ids: notifications_obj.results.map((notification) => {
        return notification.id;
      }),
    });
  };

  const observeLastElement = useCallback(
    (node) => {
      if (
        !hasMorePage ||
        createFetchNotificationsMutation.isLoading ||
        hasError
      )
        return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          !createFetchNotificationsMutation.isLoading
        ) {
          updateNotificationsState({ currentPage: currentPage + 1 });
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [
      createFetchNotificationsMutation.isLoading,
      hasMorePage,
      hasError,
      currentPage,
    ]
  );

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <div className="bg-white dark:bg-audino-midnight border dark:border-audino-gray rounded-lg p-6 w-[350px]">
      <div className="header flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notifications
        </h2>
        <button
          onClick={handleMarkAllAsRead}
          className={`px-4 py-2 text-sm text-white dark:text-gray-100 bg-audino-primary rounded-md font-semibold ${
            allNotificationsRead ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={allNotificationsRead}
        >
          Mark All As Read
        </button>
      </div>

      <br />
      <div className="notifications-list space-y-4">
        {createFetchNotificationsMutation.isLoading && currentPage === 1 ? (
          <NotificationLoader />
        ) : (
          <>
            {notifications_obj?.results?.length === 0 ? (
              <p className="text-gray-300 dark:text-gray-100">
                No new notifications
              </p>
            ) : (
              notifications_obj?.results?.map((notification, index) => (
                <div key={index} className="notification-item">
                  <Disclosure as="div" className="relative">
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex items-center text-left">
                          <div className="flex items-center space-x-4">
                            {!notification.status.is_read && (
                              <div className="w-3 h-3 rounded-full bg-red-600"></div>
                            )}
                            <div className="flex flex-col">
                              <p className="text-sm text-audino-primary font-medium">
                                {notification.title}
                              </p>
                              <small className="text-gray-400 italic">
                                {dayjs(notification.created_at).fromNow()}
                              </small>
                            </div>
                          </div>
                        </Disclosure.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Disclosure.Panel className="mt-2 text-gray-500  dark:text-gray-300">
                            <p className="text-xs flex flex-wrap">
                              {notification.message}
                            </p>
                          </Disclosure.Panel>
                        </Transition>
                      </>
                    )}
                  </Disclosure>
                </div>
              ))
            )}
            <div ref={observeLastElement} className="h-10"></div>
          </>
        )}
        {createFetchNotificationsMutation.isLoading && <NotificationLoader />}
      </div>
    </div>
  );
};

export default Notification;

import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../../store/Actions/loginAction";

const user = {
  name: "User",
  email: "user@audino.com",
  imageUrl: "https://freesvg.org/img/abstract-user-flat-4.png",
};
const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Projects", href: "/projects?page=1" },
  { name: "Tasks", href: "/tasks?page=1" },
  { name: "Jobs", href: "/jobs?page=1" },
  // { name: "Reports", href: "/reports" },
];
const userNavigation = [
  // { name: "Your Profile", href: "/profile" },
  { name: "Organizations", href: "/organizations?page=1" },
  // { name: "Settings", href: "/setting" },
  { name: "Sign out", href: "/login" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AppBar({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { audinoUserData } = useSelector((state) => state.loginReducer);

  const { username, first_name, last_name, email } = audinoUserData;
  const routeChange = () => {
    let path = `https://github.com/midas-research/audino/tree/main`;
    window.location.href = path;
  };
  return (
    <div className="min-h-full pb-32 bg-audino-primary">
      <Disclosure as="nav" className="bg-white shadow-sm">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                {/* left part */}
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <img
                      className="block h-8 w-auto"
                      src={require("../../assets/logos/logo.png")}
                      alt="Audino"
                    />
                  </div>
                  <div className="hidden md:-my-px md:ml-6 md:flex md:space-x-8">
                    {navigation.map((item, index) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? "border-audino-primary text-audino-primary"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>

                {/* right part */}
                <div className="hidden md:ml-6 md:flex md:items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-audino-primary focus:ring-offset-2"
                    onClick={routeChange}
                  >
                    <span className="sr-only">View notifications</span>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-6 w-6 fill-slate-900"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"
                      ></path>
                    </svg>
                    {/* <BellIcon className="h-6 w-6" aria-hidden="true" /> */}
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-audino-primary focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <div className="flex items-center px-4">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.imageUrl}
                              alt=""
                            />
                          </div>
                          <div className="ml-3 text-left w-28 ">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {username ? username : "User"}
                            </div>
                            <div className="text-xs font-medium text-gray-500 truncate">
                              {email}
                            </div>
                          </div>
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ close }) => (
                              <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                  classNames(
                                    isActive ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  )
                                }
                                onClick={() => {
                                  if (item.name === "Sign out") {
                                    dispatch(userLogout());
                                  }
                                  close();
                                }}
                              >
                                {item.name}
                              </NavLink>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                {/* Mobile view of right part- Hamburger icon */}
                <div className="-mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-audino-primary focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile view of navbar */}
            <Disclosure.Panel className="md:hidden">
              {({ close }) => (
                <>
                  <div className="space-y-1 px-2 pb-3 pt-2">
                    {navigation.map((item, index) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? "border-audino-primary bg-[#EFFAF5] text-audino-primary"
                              : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                            "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                          )
                        }
                        onClick={() => close()}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pb-3 pt-4">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.imageUrl}
                          alt=""
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {username ? username : "User"}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {email}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-audino-primary focus:ring-offset-2"
                        onClick={routeChange}
                      >
                        <span className="sr-only">View notifications</span>
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-6 w-6 fill-slate-900"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"
                          ></path>
                        </svg>
                        {/* <BellIcon className="h-6 w-6" aria-hidden="true" /> */}
                      </button>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {userNavigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={({ isActive }) =>
                            classNames(
                              isActive
                                ? "border-audino-primary bg-[#EFFAF5] text-audino-primary"
                                : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                              "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                            )
                          }
                          onClick={() => {
                            if (item.name === "Sign out") {
                              dispatch(userLogout());
                            }
                            close();
                          }}
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {children}
    </div>
  );
}

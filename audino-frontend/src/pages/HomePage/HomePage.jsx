import { Fragment, useState } from "react";
import AppBar from "../../components/AppBar/AppBar"
import {
  Dialog,
  Disclosure,
  Menu,
  Popover,
  Transition,
} from "@headlessui/react";
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  TagIcon,
  UserPlusIcon,
} from "@heroicons/react/20/solid";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function HomePage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
          <div className="relative h-96 overflow-hidden rounded border border-dashed border-gray-400 opacity-75">
            <svg
              className="absolute inset-0 h-full w-full stroke-gray-900/10"
              fill="none"
            >
              <defs>
                <pattern
                  id="pattern-8f4957f7-d9ea-48d6-953f-688c78f15535"
                  x="0"
                  y="0"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3"></path>
                </pattern>
              </defs>
              <rect
                stroke="none"
                fill="url(#pattern-8f4957f7-d9ea-48d6-953f-688c78f15535)"
                width="100%"
                height="100%"
              ></rect>
            </svg>
          </div>
        </div>
      </main>
    </>
  );
}

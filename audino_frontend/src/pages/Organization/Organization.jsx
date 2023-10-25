import { ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import OrganizationDetail from "./components/OrganizationDetail";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ADMIN_USER_TYPE } from "../../constants/constants";
import AppBar from "../../components/AppBar/AppBar";

const discussions = [
  {
    id: 1,
    title: "Adobe",
    author: { name: "Ajit Singh" },
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    commenters: [
      {
        id: 12,
        name: "Emma Dorsey",
        imageUrl:
          "https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 6,
        name: "Tom Cook",
        imageUrl:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 4,
        name: "Lindsay Walton",
        imageUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 16,
        name: "Benjamin Russel",
        imageUrl:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 23,
        name: "Hector Gibbons",
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
  {
    id: 2,
    title: "Apna",
    author: { name: "Hena" },
    date: "2d ago",
    dateTime: "2023-01-23T19:20Z",
    commenters: [
      {
        id: 13,
        name: "Alicia Bell",
        imageUrl:
          "https://images.unsplash.com/photo-1509783236416-c9ad59bae472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 16,
        name: "Benjamin Russel",
        imageUrl:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
      {
        id: 3,
        name: "Dries Vincent",
        imageUrl:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      },
    ],
  },
];

export default function Organization() {
  const [currentOrg, setCurrentOrg] = useState(null);
  const { userType } = useSelector((state) => state.loginReducer);

  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Organization
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
          {/* New org */}

          {userType === ADMIN_USER_TYPE ? <button
            type="button"
            className="flex items-center gap-x-2 ml-auto rounded-md bg-audino-primary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-audino-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-audino-primary"
          >
            Create new org
            <PlusIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
          </button> : null}

          {/* list of org */}
          <ul className="divide-y divide-gray-100">
            {discussions.map((discussion) => (
              <li
                key={discussion.id}
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap cursor-pointer"
                onClick={() => setCurrentOrg(discussion.id)}
              >
                <div>
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {discussion.title}
                  </p>
                  <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                    <p>{discussion.author.name}</p>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <p>
                      <time dateTime={discussion.dateTime}>
                        {discussion.date}
                      </time>
                    </p>
                  </div>
                </div>
                <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                  <div className="flex -space-x-0.5 items-center">
                    <dt className="sr-only">Commenters</dt>
                    {discussion.commenters.map((commenter) => (
                      <dd key={commenter.id}>
                        <img
                          className="h-6 w-6 rounded-full bg-gray-50 ring-2 ring-white"
                          src={commenter.imageUrl}
                          alt={commenter.name}
                        />
                      </dd>
                    ))}

                    {/* add new */}
                    <dd className="flex items-center text-gray-400">
                      {/* <PlusCircleIcon
                      className="ml-1 h-7 w-7 text-audino-primary"
                      aria-hidden="true"
                      
                    /> */}
                      {/* <PlusIcon className="ml-2 h-4 w-4" aria-hidden="true" /> */}
                      <p className="text-sm font-normal ml-1"> ... 20 more</p>
                    </dd>
                  </div>
                  <div >
                    <ChevronRightIcon
                      className="h-5 w-5 flex-none text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          {/* org detail slide over */}
          <OrganizationDetail
            currentOrg={currentOrg}
            setCurrentOrg={setCurrentOrg}
          />
        </div>
      </main>
    </>
  );
}

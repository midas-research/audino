import React from "react";
import AppBar from "../../components/AppBar/AppBar";
import { useSelector } from "react-redux";
import { useInvitationStore } from "../../zustand-store/invitations";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useGetAllInvitation } from "../../services/Invitations/useQueries";
import { useAcceptTaskMutation, useDeclineTaskMutation } from "../../services/Invitations/useMutations";

export default function InvitationPage() {
  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const { audinoUserData } = useSelector((state) => state.loginReducer);
  const setInvitations = useInvitationStore((state) => state.setInvitations);
  const invitations_obj = useInvitationStore((state) => state.invitations_obj);

  //  fetch inviations

  const getAllInviations = useGetAllInvitation({
    queryConfig: {
      queryKey: [],
      apiParams: {
        params: {
          page: 1,
          page_size: 11,
          // filter: `{"and":[{"==":[{"var":"user_id"},${audinoUserData.id}]},{"==":[{"var":"accepted"},false]}]}`,
        },
      },
      enabled: true,
      staleTime: 1000 * 60 * 5,
      retry: false,
      onSuccess: (data) => setInvitations(data),
    }
  })
  // accept invitation
  const acceptTaskMutation = useAcceptTaskMutation({
    mutationConfig: {
      onSuccess: (data) => {
        getAllInviations.refetch();
      },
    }
  })


  const declineTaskMutation = useDeclineTaskMutation({
    mutationConfig: {
      onSuccess: (data) => {
        getAllInviations.refetch();
      },
    }
  })

  console.log("====================================");
  console.log(invitations_obj);
  console.log("====================================");
  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Invitations
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
          {getAllInviations.isLoading ? (
            [...Array(8).keys()].map((val) => (
              <div
                key={`inivationsLoading-${val}`}
                className="h-16 bg-gray-200 rounded-md w-full my-4 animate-pulse"
              ></div>
            ))
          ) : (
            <ul role="list" className="divide-y divide-gray-100">
              {invitations_obj.results.map((invitation) => (
                <li
                  key={invitation.key}
                  className="flex items-center justify-between gap-x-6 py-5"
                >
                  <div className="min-w-0">
                    <p className="text-sm  leading-6 text-gray-900">
                      <span className="font-semibold">
                        {invitation.owner.username}{" "}
                      </span>
                      has invited you to join the
                      <span className="font-semibold">
                        {" "}
                        {invitation.organization}{" "}
                      </span>
                      organization{" "}
                    </p>
                    <div className="mt-1 text-xs leading-5 text-gray-500">
                      <p className="whitespace-nowrap">
                        Invited{" "}
                        <time dateTime={invitation.created_date}>
                          {dayjs(invitation.created_date).fromNow()}
                        </time>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-x-4">
                    <button
                      type="button"
                      className="rounded bg-audino-primary-dark px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-audino-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-audino-primary-dark"
                      disabled={acceptTaskMutation.isLoading}
                      onClick={() =>
                        acceptTaskMutation.mutate({
                          key: invitation.key,
                          type: "accept",
                        })
                      }
                    >
                      {acceptTaskMutation.isLoading ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      className="rounded bg-red-50 px-2 py-1 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                      disabled={declineTaskMutation.isLoading}
                      onClick={() =>
                        declineTaskMutation.mutate({
                          key: invitation.key,
                          type: "decline",
                        })
                      }
                    >
                      {declineTaskMutation.isLoading
                        ? "Declining..."
                        : "Decline"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

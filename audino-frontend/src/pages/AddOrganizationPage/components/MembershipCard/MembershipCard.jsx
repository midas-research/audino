import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useNavigate, useParams } from "react-router-dom";

import dayjs from "dayjs";
import { useMembershipStore } from "../../../../zustand-store/memberships";
import AlertModal from "../../../../components/Alert/AlertModal";
import CardLoader from "../../../../components/loader/cardLoader";
import { useSelector } from "react-redux";
import { useGetInvitation } from "../../../../services/Invitations/useQueries";
import { useDeleteMembershipMutation, useUpdateMembershipMutation} from "../../../../services/Membership/useMutations";

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

const MembershipCard = ({ membership, onMembershipUpdate }) => {
  const { id: orgId } = useParams();
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(membership?.role || "");
  const setMemberships = useMembershipStore((state) => state.setMemberships);
  const memberships_obj = useMembershipStore((state) => state.memberships_obj);
  const navigate = useNavigate();
  const [invitationDetails, setInvitationDetails] = useState(null);
  // const audinoUserData = JSON.parse(localStorage.getItem("audino-user"));
  const { audinoUserData } = useSelector((state) => state.loginReducer);

  const isOwner = membership.role === "owner";
  const roleOptions = [
    { label: "Worker", value: "worker" },
    { label: "Maintainer", value: "maintainer" },
    { label: "Supervisor", value: "supervisor" },
  ];

  if (isOwner) {
    roleOptions.unshift({ label: "Owner", value: "owner" });
  }

  

  const updateMembershipMutation = useUpdateMembershipMutation({
    mutationConfig: {
      onSuccess: () => {
        onMembershipUpdate();
      },

    }
    
  });

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setSelectedRole(newRole);

    updateMembershipMutation.mutate({
      id: membership.id,
      payload: {
        role: newRole,
      },
    });
  };

  

  
  const deleteMembershipMutation = useDeleteMembershipMutation({
    mutationConfig: {
      onSuccess: (data, id) => {
        setDeleteModal(false);
        if (audinoUserData.username !== invitationDetails.owner.username) {
          navigate("/organizations?page=1");
        }
        setMemberships({
          ...memberships_obj,
          results: memberships_obj.results.filter((res) => res.id !== id),
        });
      },
    }
  })


  const handleDeleteMutation = async () => {
    await deleteMembershipMutation.mutate(membership.id);
  };

 
  const { refetch: refetchInvitationDetails,
    isLoading: invitationDetailsLoading,
  } = useGetInvitation({
    queryConfig: {
      queryKey: [membership.invitation, orgId],
      apiParams: {
        key: membership.invitation
      },
      enabled: false,
      retry: false,
      onSuccess: (invitationDetails) => {
        setInvitationDetails(invitationDetails);
      },
    }
  })

  useEffect(() => {
    const fetchInvitationDetails = () => {
      if (membership.invitation) {
        refetchInvitationDetails();
      }
    };

    fetchInvitationDetails();
  }, [membership, refetchInvitationDetails, membership.invitation]);

  

  return (
    <>
      {/* loader */}
      {membership.invitation && invitationDetailsLoading ? (
        [...Array(1).keys()].map((load) => (
          <li
            className="col-span-1 divide-y divide-gray-200 dark:divide-audino-charcoal rounded-lg dark:bg-audino-navy bg-white cursor-pointer py-8 sm:py-0"
            onClick={() => navigate("create")}
            key={`CardLoader-${load}`}
          >
            <CardLoader />
          </li>
        ))
      ) : (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-11 gap-4 px-4 md:px-5 rounded-md p-2 mb-6 last:mb-0 items-center justify-between ${isOwner ? "bg-gray-100 dark:bg-[#D9D9D940]" : ""
            }`}
        >
          <div className="col-span-1 sm:col-span-1 md:col-span-2 ">
            <p className="text-sm font-medium text-gray-500 overflow-ellipsis overflow-clip">
              {membership.user?.username}
            </p>
          </div>

          <div className="col-span-1 sm:col-span-1 md:col-span-2 ">
            <p className="text-sm font-medium text-gray-500 overflow-ellipsis overflow-clip">
              {membership.user?.first_name + " " + membership.user?.last_name}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-3 ">
            <div className="mt-1 items-center gap-x-2 text-xs leading-5 text-gray-500">
              {!isOwner && invitationDetails?.created_date && (
                <p className="text-xs font-light text-gray-400 overflow-ellipsis overflow-clip">
                  Invited{" "}
                  <time>{dayjs(invitationDetails.created_date).fromNow()}</time>{" "}
                  by {invitationDetails?.owner?.username}
                </p>
              )}
              {membership.joined_date ? (
                <p>
                  joined <time>{dayjs(membership.joined_date).fromNow()}</time>
                </p>
              ) : (
                <p>Invitation pending</p>
              )}
            </div>
          </div>

          {/* Role dropdown */}
          <div className="col-span-1 w-36 sm:col-span-2 md:col-span-2 align-left">
            <select
              id={membership.key}
              className={`border-none focus:ring-0 bg-gray-50 dark:bg-audino-light-navy block w-full text-green-600 rounded-md text-sm ${isOwner ? "cursor-not-allowed bg-white" : ""
                }`}
              value={selectedRole}
              onChange={handleRoleChange}
              disabled={isOwner}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* delete icon */}
          {!isOwner &&
            audinoUserData.username === invitationDetails?.owner.username && (
              <div className="col-span-1 sm:col-span-1 md:col-span-2 flex justify-end ">
                <TrashIcon
                  className="h-4 w-4 text-red-500  cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setDeleteModal(true)}
                />
              </div>
            )}

          {/* leave organization */}
          {!isOwner &&
            audinoUserData.username === invitationDetails?.user.username && (
              <div className="col-span-1 sm:col-span-1 md:col-span-2 flex justify-end">
                <button
                  className="inline-block max-w-md justify-self-end rounded-md px-2 bg-white py-0.5 text-sm font-medium leading-6 text-red-500 border border-red-400 hover:bg-gray-50  cursor-pointer"
                  onClick={() => setDeleteModal(true)}
                >
                  Leave Organization
                </button>
              </div>
            )}

          {/* confirmation modal */}
          <AlertModal
            open={deleteModal}
            setOpen={setDeleteModal}
            onSuccess={handleDeleteMutation}
            onCancel={() => setDeleteModal(false)}
            text={
              audinoUserData.username === invitationDetails?.owner.username
                ? `You are removing ${membership?.user?.username} from this organization`
                : "Are you sure you want to leave the organization? "
            }
            isLoading={deleteMembershipMutation.isLoading}
          />
        </div>
      )}
    </>
  );
};

export default MembershipCard;

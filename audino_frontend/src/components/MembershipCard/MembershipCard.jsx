import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useNavigate } from "react-router-dom";

import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getInvitationApi } from "../../services/invitation.services";
import { useMembershipStore } from "../../zustand-store/memberships";
import {
  deleteMembershipApi,
  updateMembershipApi,
} from "../../services/membership.services";
import AlertModal from "../Alert/AlertModal";
import CardLoader from "../loader/cardLoader";
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

const MembershipCard = ({ membership, onMembershipUpdate }) => {
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(membership?.role || "");
  const setMemberships = useMembershipStore((state) => state.setMemberships);
  const memberships_obj = useMembershipStore((state) => state.memberships_obj);
  const navigate = useNavigate();
  const [invitationDetails, setInvitationDetails] = useState(null);
  const loggedInUser = JSON.parse(localStorage.getItem("audino-user"));

  const isOwner = membership.role === "owner";
  const roleOptions = [
    { label: "Worker", value: "worker" },
    { label: "Maintainer", value: "maintainer" },
    { label: "Supervisor", value: "supervisor" },
  ];

  if (isOwner) {
    roleOptions.unshift({ label: "Owner", value: "owner" });
  }

  const updateMembershipMutation = useMutation({
    mutationFn: updateMembershipApi,
    onSuccess: () => {
      onMembershipUpdate();
    },
  });

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setSelectedRole(newRole);

    const payload = {
      id: membership.id,
      newRole: newRole,
    };

    updateMembershipMutation.mutate(payload);
  };

  const deleteMembershipMutation = useMutation({
    mutationFn: deleteMembershipApi,
    onSuccess: (data, id) => {
      setDeleteModal(false);
      setMemberships({
        ...memberships_obj,
        results: memberships_obj.results.filter((res) => res.id !== id),
      });
    },
  });

  const handleDeleteMutation = async () => {
     await deleteMembershipMutation.mutate(membership.id);

    if (loggedInUser.username !== invitationDetails.owner.username) {
       navigate("/organizations?page=1");
      // window.location.href = '/organizations?page=1';
    }
  };

  const {
    refetch: refetchInvitationDetails,
    isLoading: invitationDetailsLoading,
  } = useQuery({
    queryKey: ["invitation", membership.invitation],
    enabled: false,
    queryFn: () => getInvitationApi(membership.invitation),
    onSuccess: (invitationDetails) => {
      setInvitationDetails(invitationDetails);
    },
  });

  useEffect(() => {
    const fetchInvitationDetails = () => {
      if (membership.invitation) {
        refetchInvitationDetails();
      }
    };

    fetchInvitationDetails();
  }, [membership,refetchInvitationDetails]);

  return (
    <>
      {membership.invitation && invitationDetailsLoading ? (
        [...Array(1).keys()].map((load) => (
          <li
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white cursor-pointer py-8 sm:py-0"
            onClick={() => navigate("create")}
            key={`CardLoader-${load}`}
          >
            <CardLoader />
          </li>
        ))
      ) : (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-11 gap-4 border px-4 md:px-5 rounded-md p-2 mt-6 items-center justify-between ${
            isOwner ? "bg-gray-100" : ""
          }`}
        >
          <div className="col-span-1 sm:col-span-1 md:col-span-2 ">
            <p className="text-sm font-medium text-gray-600 overflow-ellipsis overflow-clip">
              {membership.user?.username}
            </p>
          </div>

          <div className="col-span-1 sm:col-span-1 md:col-span-2 ">
            <p className="text-sm font-medium text-gray-00 overflow-ellipsis overflow-clip">
              {membership.user?.username}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-3 ">
            <div className="mt-1 items-center gap-x-2 text-xs leading-5 text-gray-500">
              {!isOwner && (
                <p className="text-xs font-light text-gray-400 overflow-ellipsis overflow-clip">
                  Invited{" "}
                  <time>{dayjs(membership.created_date).fromNow()}</time> by{" "}
                  {invitationDetails?.owner?.username}
                </p>
              )}
              <p>
                joined <time>{dayjs(membership.joined_date).fromNow()}</time>
              </p>
            </div>
          </div>

          {/* Role dropdown */}
          <div className="col-span-1 w-36 sm:col-span-2 md:col-span-2 align-left">
            <select
              id={membership.key}
              className={`border border-gray-300 focus:border-green-100 block w-full text-green-600 rounded-md focus:ring-green-400 ${
                isOwner ? "cursor-not-allowed" : ""
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
            loggedInUser.username === invitationDetails?.owner.username && (
              <div className="col-span-1 sm:col-span-1 md:col-span-2 flex justify-end cursor-pointer">
                <TrashIcon
                  className="h-4 w-4 text-gray-500"
                  aria-hidden="true"
                  onClick={() => setDeleteModal(true)}
                />
              </div>
            )}

          {/* leave organization */}
          {!isOwner &&
            loggedInUser.username === invitationDetails?.user.username && (
              <div className="col-span-1 sm:col-span-1 md:col-span-2 flex justify-end cursor-pointer">
              <button
                className="inline-block max-w-md justify-self-end rounded-md px-2 bg-white py-0.5 text-sm font-medium leading-6 text-red-500 border border-red-400 hover:bg-gray-50"
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
              loggedInUser.username === invitationDetails?.owner.username
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

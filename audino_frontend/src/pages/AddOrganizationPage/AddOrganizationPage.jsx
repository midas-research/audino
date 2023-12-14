import { useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import CustomInput from "../../components/CustomInput/CustomInput";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import AddOrganizationLoader from "./components/AddOrganizationLoader";
import { organizationAllValidation } from "../../validation/allValidation";
import { organizationSingleFieldValidation } from "../../validation/singleValidation";
import useSingleFieldValidation from "../../utils/inputDebounce";
import InviteMemberModal from "./components/InviteMemberModal/InviteMemberModal";
import {
  createOrganizationApi,
  updateOrganizationApi,
  fetchOrganizationApi,
} from "../../services/organization.services";
import { getAllMembershipsApi } from "../../services/membership.services";
import { createInvitationApi } from "../../services/invitation.services";
import { PlusIcon } from "@heroicons/react/24/outline";
import CardLoader from "../../components/loader/cardLoader";
import { useMembershipStore } from "../../zustand-store/memberships";
import MembershipCard from "./components/MembershipCard/MembershipCard";
import { AUDINO_ORG } from "../../constants/constants";

const initialData = {
  slug: "",
  name: "",
  description: "",
  contact: {
    email: "",
    mobileNumber: "",
    location: "",
  },
};
export default function AddOrganizationPage() {
  const { id: orgId } = useParams();
  const [formValue, setFormValue] = useState(initialData);
  const [formError, setFormError] = useState({
    slug: null,
    name: null,
    description: null,
    contact: {
      email: null,
      mobileNumber: null,
      location: null,
    },
  });
  const { debouncedValidation } = useSingleFieldValidation(
    organizationSingleFieldValidation,
    1000,
    formError,
    setFormError
  );

  const navigate = useNavigate();

  const setMemberships = useMembershipStore((state) => state.setMemberships);
  const memberships_obj = useMembershipStore((state) => state.memberships_obj);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteSuccess = (data) => {
    const organization = parseInt(orgId);
    createInvitationMutation.mutate({
      invitationData: data,
    });
  };

  const createInvitationMutation = useMutation({
    mutationFn: createInvitationApi,
    onSuccess: () => {
      setIsInviteModalOpen(false);
      refetchMemberships();
    },
  });

  const handleInviteCancel = () => {
    setIsInviteModalOpen(false);
  };

  const handleInviteClick = () => {
    setIsInviteModalOpen(true);
  };

  const handleSave = () => {
    const { isValid, error } = organizationAllValidation(formValue);

    if (isValid) {
      if (orgId) {
       
        // updateOrganizationMutation
        updateOrganizationMutation.mutate({
          data: {
            slug: formValue.slug,
            name: formValue.name,
            description: formValue.description,
            contact: {
              email: formValue.contact.email,
              mobileNumber: formValue.contact.mobileNumber,
              location: formValue.contact.location,
            },
          },
          id: orgId,
        });
      } else {
       
        addOrganizationMutation.mutate({
          data: {
            slug: formValue.slug,
            name: formValue.name,
            description: formValue.description,
            contact: {
              email: formValue.contact.email,
              mobileNumber: formValue.contact.mobileNumber,
              location: formValue.contact.location,
            },
          },
        });
      }
    } else {
      setFormError(error);
    }
  };

  const addOrganizationMutation = useMutation({
    mutationFn: createOrganizationApi,
    onSuccess: () => {
      navigate("/organizations?page=1");
    },
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: updateOrganizationApi,
    onSuccess: (data) => {
      localStorage.setItem(AUDINO_ORG, data.slug);
      navigate("/organizations?page=1");
    },
  });

  const handleInputChange = (name, value) => {
    setFormValue((prev) => {
      if (name.includes("contact.")) {
        const contactField = name.split(".")[1];
        return {
          ...prev,
          contact: {
            ...prev.contact,
            [contactField]: value,
          },
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
    debouncedValidation({ name, value });
  };

  const { refetch: refetchOrganization } = useQuery({
    queryKey: ["organization", orgId],
    staleTime: Infinity,
    enabled: false,
    queryFn: () => fetchOrganizationApi({ id: orgId }),
    onSuccess: (fetchedData) => {
      setFormValue({
        slug: fetchedData.slug || "",
        name: fetchedData.name || "",
        description: fetchedData.description || "",
        contact: {
          email: fetchedData.contact?.email || "",
          mobileNumber: fetchedData.contact?.mobileNumber || "",
          location: fetchedData.contact?.location || "",
        },
      });
    },
  });

  const { refetch: refetchMemberships, isLoading: membershipsLoading } =
    useQuery({
      queryKey: ["memberships", orgId],
      enabled: false,

      queryFn: () => getAllMembershipsApi(),
      onSuccess: (data) => setMemberships(data),
    });

  useEffect(() => {
    //fetch if orgId present , fetch the form data,and set in formValue
    if (orgId != null) {
      refetchOrganization();
   
      refetchMemberships();
    } else setFormValue(formValue);
  }, [orgId]);

  useEffect(() => {
    return () =>
      setMemberships({ count: 0, next: null, previous: null, results: [] });
  }, []);

  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {orgId ? "Updating " : "Create "} Organization
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 flex flex-col gap-5 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Invite members */}
        <ul>
          {orgId ? (
            membershipsLoading ? (
              [...Array(2).keys()].map((load) => (
                <li
                  className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white cursor-pointer py-8 sm:py-0"
                  onClick={() => navigate("create")}
                  key={`CardLoader-${load}`}
                >
                  <CardLoader />
                </li>
              ))
            ) : (
              <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
                <div className="mb-4 bg-white">
                  <button
                    type="button"
                    className="flex items-center gap-x-2 ml-auto rounded-md bg-audino-primary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm cursor-pointer"
                    onClick={handleInviteClick}
                  >
                    Invite Members
                    <PlusIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Render Members */}
                  {memberships_obj.results.map((membership) => (
                    <MembershipCard
                      key={membership.id}
                      membership={membership}
                      onMembershipUpdate={refetchMemberships}
                    />
                  ))}
                </div>
              </div>
            )
          ) : null}
        </ul>

        {/* Form fileds */}
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
          <div>
            <div className="mb-4">
              <label
                htmlFor="slug"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Short Name <span className="text-red-600">*</span>
              </label>
              <CustomInput
                type="text"
                name="slug"
                id="slug"
                formError={formError}
                placeholder="Slug"
                value={formValue.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Full Name
              </label>
              <CustomInput
                type="text"
                name="name"
                id="name"
                formError={formError}
                placeholder="Org 1"
                value={formValue.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Description
              </label>
              <CustomInput
                type="text"
                inputType="textarea"
                name="description"
                id="description"
                formError={formError}
                placeholder="Organization description"
                value={formValue.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Email
              </label>
              <CustomInput
                type="email"
                name="contact.email"
                id="email"
                formError={formError}
                placeholder="aditya@gmail.com"
                value={formValue.contact.email}
                onChange={(e) =>
                  handleInputChange("contact.email", e.target.value)
                }
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Mobile Number
              </label>

              <CustomInput
                type="number"
                name="contact.mobileNumber"
                id="mobileNumber"
                formError={formError}
                placeholder="9696969696"
                value={formValue.contact.mobileNumber}
                onChange={(e) =>
                  handleInputChange("contact.mobileNumber", e.target.value)
                }
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="Location"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Location
              </label>
              <CustomInput
                type="text"
                name="contact.location"
                id="location"
                formError={formError}
                placeholder="Location"
                value={formValue.contact.location}
                onChange={(e) =>
                  handleInputChange("contact.location", e.target.value)
                }
              />
            </div>

            {/* Action buttons */}
            {false ? (
              <AddOrganizationLoader />
            ) : (
              <div className="flex-shrink-0 border-t border-gray-200 mt-8 pt-4">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  <PrimaryButton
                    onClick={handleSave}
                    loading={
                      addOrganizationMutation.isLoading ||
                      updateOrganizationMutation.isLoading
                    }
                  >
                    Save
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* invite member form */}

        <InviteMemberModal
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onCancel={handleInviteCancel}
          onSuccess={handleInviteSuccess}
          isLoading={createInvitationMutation.isLoading}
        />
      </main>
    </>
  );
}

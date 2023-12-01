import { useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import CustomInput from "../../components/CustomInput/CustomInput";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import AddOrganizationLoader from "./AddOrganizationLoader";
import useOrganizationStore from "../../zustand-store/organizations";
import { organizationAllValidation } from "../../validation/allValidation";
import { organizationSingleFieldValidation } from "../../validation/singleValidation";
import useSingleFieldValidation from "../../utils/inputDebounce";
import InviteMembersForm from "../../components/inviteMember/inviteMember";
import {
  createOrganizationApi,
  updateOrganizationApi,
  fetchOrganizationApi,
} from "../../services/organization.services";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

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

// Options for the dropdown
const roleOptions = [
  { value: "worker", label: "Worker" },
  { value: "supervisor", label: "Supervisor" },
  { value: "maintainer", label: "Maintainer" },
];

export default function AddOrganizationPage() {
  const { id: selectedOrg } = useParams();
  const { addOrganization, updateOrganization } = useOrganizationStore();
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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [members, setMembers] = useState([]);

  const handleInviteSuccess = ({ email, ownership }) => {
    // Add the new member to the list
    const newMember = {
      id: members.length + 1, // You may need to generate a unique ID
      username: email.split("@")[0], // Assuming username is derived from the email
      role: ownership,
    };
    setMembers((prevMembers) => [...prevMembers, newMember]);
    setIsInviteModalOpen(false);
  };

  const handleInviteCancel = () => {
    setIsInviteModalOpen(false);
  };

  const handleRoleChange = (memberId, newRole) => {
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };
  const handleDeleteMember = (memberId) => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.id !== memberId)
    );
  };

  const handleInviteClick = () => {
    setIsInviteModalOpen(true);
  };

  const handleSave = () => {
    const { isValid, error } = organizationAllValidation(formValue);

    if (isValid) {
      if (selectedOrg) {
        console.log("Updating organization..");
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
        });
      } else {
        console.log("Adding organization..");
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

  const addOrganizationMutation = useMutation({
    mutationFn: createOrganizationApi,
    onSuccess: (data) => {
      //   setOrgs(data);
      addOrganization(data);

      navigate("/organizations?page=1");
    },
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: () => updateOrganizationApi(selectedOrg),
    onSuccess: (formValue) => {
      if (formValue) {
        updateOrganization(formValue);
        console.log("updated data:", formValue);
        navigate("/organizations?page=1");
      } else {
        // Handle the case where data is not received or not valid
        console.error("Invalid or missing data in updateOrganizationApi");
      }
    },
  });

  const getOrganizationQuery = useQuery({
    queryKey: ["organization", selectedOrg],
    staleTime: 1000,
    queryFn: () =>
      fetchOrganizationApi({
        id: selectedOrg,
      }),
    onSuccess: (data) => {
      setFormValue((prev) => {
        return {
          ...prev,
          slug: data.slug ?? "slug",
          name: data.name ?? "",
          description: data.description ?? "",
          contact: {
            email: data.contact?.email ?? "",
            mobileNumber: data.contact?.mobileNumber ?? "",
            location: data.contact?.location ?? "",
          },
        };
      });
    },
  });

  useEffect(() => {
    //fetch if selectedOrg present , fetch the form data,and set in formValue
    if (selectedOrg) {
      console.log("selected org", selectedOrg);
      getOrganizationQuery.refetch();
    } else setFormValue(formValue);
  }, []);

  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {selectedOrg ? "Updating " : "Create "} Organization
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 flex flex-col gap-5 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Invite members */}
        {selectedOrg && (
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6 min-h-full">
            <div className="mb-4 py-4 bg-white">
              <button
                type="button"
                className="flex items-center gap-x-2 ml-auto rounded-md bg-audino-primary px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm cursor-pointer"
                onClick={handleInviteClick}
              >
                Invite Members
                <PlusIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
              </button>

              {/* owner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 border px-4 md:px-5 rounded-md p-2 mt-6 items-center">
                <div className="col-span-1 sm:col-span-1 md:col-span-1 ">
                  <p className="text-sm font-medium text-gray-600 overflow-ellipsis overflow-clip">
                    Aditya sharma
                  </p>
                </div>

                <div className="col-span-1 sm:col-span-1 md:col-span-1 ">
                  <p className="text-sm font-medium text-gray-00 overflow-ellipsis overflow-clip">
                    Aditya sharma
                  </p>
                </div>

                <div className="col-span-1 sm:col-span-1 md:col-span-1 ">
                  <p className="text-xs font-light text-gray-400 overflow-ellipsis overflow-clip">
                    Invited 5 hours ago by aditya466
                  </p>
                  <p className="text-xs font-light text-gray-400 overflow-ellipsis overflow-clip">
                    Joined 5 hours ago
                  </p>
                </div>

                {/* Role dropdown */}
                <div className="col-span-2 sm:col-span-2 md:col-span-1  text-right">
                  <select
                    id={`role-`}
                    className="form-select text-sm w-32 border-slate-300 rounded-md shadow-sm text-green-600 cursor-not-allowed"
                  >
                    <option key="role" value="owner">
                      Owner
                    </option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1 md:col-span-1 flex justify-end">
                  <TrashIcon
                    className="h-4 w-4 text-gray-500  cursor-not-allowed"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Render Members */}
              {members.map((member) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 border px-4 md:px-5 rounded-md p-2 mt-6 items-center">
                  <div className="col-span-1 sm:col-span-1 md:col-span-1 ">
                    <p className="text-sm font-medium text-gray-600 overflow-ellipsis overflow-clip">
                      {member.username}
                    </p>
                  </div>

                  <div className="col-span-1 sm:col-span-1 md:col-span-1 ">
                    <p className="text-sm font-medium text-gray-00 overflow-ellipsis overflow-clip">
                      {member.username}
                    </p>
                  </div>

                  <div className="col-span-1 sm:col-span-1 md:col-span-1 ">
                    <p className="text-xs font-light text-gray-400 overflow-ellipsis overflow-clip">
                      Invited 5 hours ago by
                      aditya46666666666666666666666666666666666666666
                    </p>
                    <p className="text-xs font-light text-gray-400 overflow-ellipsis overflow-clip">
                      Joined 5 hours ago
                    </p>
                  </div>

                  {/* Role dropdown */}
                  <div className="col-span-2 sm:col-span-2 md:col-span-1  text-right">
                    <select
                      id={`role-${member.id}`}
                      className="form-select text-sm w-32 border-slate-300 rounded-md shadow-sm text-green-600"
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value)
                      }
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1 md:col-span-1 flex justify-end">
                    <TrashIcon
                      className="h-4 w-4 text-gray-500  cursor-not-allowed"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                placeholder="Full name"
                value={formValue.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900 mb-2"
              >
                Task description
              </label>
              <CustomInput
                type="text"
                inputType="textarea"
                name="description"
                id="description"
                formError={formError}
                placeholder="Task description"
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
                    loading={addOrganizationMutation.isLoading} // mutation isLoading added
                  >
                    Save
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* invite member form */}

        <InviteMembersForm
          open={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onCancel={handleInviteCancel}
          onSuccess={handleInviteSuccess}
          isLoading={false} // Set to true if you want to show a loading state
        />
      </main>
    </>
  );
}

import { useEffect, useState } from "react";
import AppBar from "../../components/AppBar/AppBar";
import { useNavigate, useParams } from "react-router";
import { useLocation } from "react-router-dom";
import CustomInput from "../../components/CustomInput/CustomInput";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";
import AddOrganizationLoader from "./components/AddOrganizationLoader";
import { organizationAllValidation } from "../../validation/allValidation";
import { organizationSingleFieldValidation } from "../../validation/singleValidation";
import useSingleFieldValidation from "../../utils/inputDebounce";
import InviteMemberModal from "./components/InviteMemberModal/InviteMemberModal";
import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import CardLoader from "../../components/loader/cardLoader";
import { useMembershipStore } from "../../zustand-store/memberships";
import MembershipCard from "./components/MembershipCard/MembershipCard";
import { AUDINO_ORG } from "../../constants/constants";
import { useAddOrganizationMutation, useUpdateOrganizationMutation } from "../../services/Organization/useMutations";
import { useFetchOrganization } from "../../services/Organization/useQueries";
import { useCreateInvitationMutation } from "../../services/Invitations/useMutations";
import { useGetAllInvitation } from "../../services/Invitations/useQueries";
import { useGetAllMembership } from "../../services/Membership/useQueries";
import {ReactComponent as InviteMembers} from '../../assets/svgs/inviteMembers.svg';
 
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



  const createInvitationMutation = useCreateInvitationMutation({
    mutationConfig: {
      onSuccess: () => {
        setIsInviteModalOpen(false);
        refetchMemberships();
      },
    }
  })



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



  const addOrganizationMutation = useAddOrganizationMutation({
    mutationConfig: {
      onSuccess: () => {
        navigate("/organizations?page=1");
      },
    }
  })



  const updateOrganizationMutation = useUpdateOrganizationMutation({
    mutationConfig: {
      onSuccess: (data) => {
        localStorage.setItem(AUDINO_ORG, data.slug);
        navigate("/organizations?page=1");
      },
    }
  })

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



  const { refetch: refetchOrganization } = useFetchOrganization({
    queryConfig: {
      queryKey: [orgId],
      apiParams: {
        id: orgId,
      },
      staleTime: Infinity,
      enabled: false,
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
    }
  })


  const { refetch: refetchMemberships, isLoading: membershipsLoading } =
    useGetAllMembership({
      queryConfig: {
        queryKey: [orgId],
        apiParams: {},
        enabled: false,
        onSuccess: (data) => setMemberships(data),
      }
    })
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

  // console.log('====================================');
  // console.log(memberships_obj.results);
  // console.log('====================================');

  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-4">
              <div
                className="flex items-center mb-2 hover:cursor-pointer"
                onClick={() => navigate(-1)}
              >
                <ChevronLeftIcon
                  className="h-5 w-5 flex-shrink-0 text-gray-100"
                  aria-hidden="true"
                />
                <button className="ml-2 text-sm font-medium text-gray-100 hover:text-gray-50">
                  Back
                </button>
              </div>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {orgId ? "Updating " : "Create "} Organization
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Invite members */}
        <ul>
          {orgId ? (
            membershipsLoading ? (
              [...Array(2).keys()].map((load) => (
                <li
                  className="col-span-1 divide-y divide-gray-200 dark:divide-audino-charcoal rounded-lg dark:bg-audino-navy bg-white cursor-pointer py-8 sm:py-0"
                  onClick={() => navigate("create")}
                  key={`CardLoader-${load}`}
                >
                  <CardLoader />
                </li>
              ))
            ) : (
              <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full">
                <div className="bg-white dark:bg-audino-navy">
                  <button
                    type="button"
                    className="flex items-center gap-x-2 ml-auto rounded-md bg-audino-primary dark:bg-audino-gradient px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm cursor-pointer"
                    onClick={handleInviteClick}
                  >
                    {/* Invite Members
                    <PlusIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" /> */}
                    <InviteMembers className="h-5 w-5"/>
                  </button>

                  {/* header */}
                  <div
                    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-11 gap-4 px-4 md:px-5 items-center justify-between my-2 border-b-2 dark:border-audino-charcoal border-gray-100 pb-2 font-semibold`}
                  >
                    <div className="col-span-1 sm:col-span-1 md:col-span-2 ">
                      <p className="text-sm font-medium dark:text-audino-light-gray text-gray-600 overflow-ellipsis overflow-clip">
                        Username
                      </p>
                    </div>
                    <div className="col-span-1 sm:col-span-1 md:col-span-2 ">
                      <p className="text-sm font-medium dark:text-audino-light-gray text-gray-600 overflow-ellipsis overflow-clip">
                        Full name
                      </p>
                    </div>
                  </div>
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
        <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full mt-4">
          <div>
            <div className="mb-4">
              <label
                htmlFor="slug"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
              >
                Short Name <span className="text-red-600 dark:text-audino-primary">*</span>
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
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
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
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
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
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
              >
                Email
              </label>
              <CustomInput
                type="email"
                name="contact.email"
                id="email"
                formError={formError}
                value={formValue.contact.email}
                placeholder="Your email address"
                onChange={(e) =>
                  handleInputChange("contact.email", e.target.value)
                }
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="mobileNumber"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
              >
                Mobile Number
              </label>

              <CustomInput
                type="number"
                name="contact.mobileNumber"
                id="mobileNumber"
                formError={formError}
                value={formValue.contact.mobileNumber}
                placeholder="Your mobile number"
                onChange={(e) =>
                  handleInputChange("contact.mobileNumber", e.target.value)
                }
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="Location"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
              >
                Location
              </label>
              <CustomInput
                type="text"
                name="contact.location"
                id="location"
                formError={formError}
                value={formValue.contact.location}
                placeholder="Organization address"
                onChange={(e) =>
                  handleInputChange("contact.location", e.target.value)
                }
              />
            </div>

            {/* Action buttons */}
            {false ? (
              <AddOrganizationLoader />
            ) : (
              <div className="flex-shrink-0 border-t border-gray-200 dark:border-audino-slate-gray mt-8 pt-4">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-transparent px-3 py-2 text-sm font-medium text-gray-900 dark:text-audino-medium-gray shadow-sm ring-1 ring-inset dark:ring-audino-steel ring-gray-300 hover:bg-gray-50"
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

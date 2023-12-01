import { create } from "zustand";

const discussions = [
  {
    id: 1,
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization 1",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
  {
    id: 2,
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization 2",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
  {
    id: 3,
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization 3",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
  {
    id: 4,
    author: "Ajit Kumar",
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    slug: "slug_" + Math.ceil(Math.random() * 10000),
    name: "organization 4",
    description: "description",
    contact: {
      email: "a@email.com",
      mobileNumber: "9999999999",
      location: "some location",
    },
  },
];
const organizationStore = (set) => ({
  org_obj: { count: 4, next: null, previous: null, results: discussions },
  addOrganization: (organization) => {
    set((state) => ({
      org_obj: {
        ...state.org_obj,
        count: state.org_obj.count + 1,
        results: [...state.org_obj.results, organization],
      },
    }));
  },
  updateOrganization: (updatedOrganization) => {
    set((state) => ({
      org_obj: {
        ...state.org_obj,
        results: state.org_obj.results.map((org) =>
          org.id === updatedOrganization.id ? { ...updatedOrganization } : org
        ),
      },
    }));
  },
  deleteOrganization: (organizationId) => {
    set((state) => ({
      org_obj: {
        ...state.org_obj,
        results: state.org_obj.results.filter(
          (org) => org.id !== organizationId
        ),
      },
    }));
  },
});

const useOrganizationStore = create(organizationStore);
export default useOrganizationStore;

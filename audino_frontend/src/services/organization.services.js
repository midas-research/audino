import axios from "axios";
import authHeader from "./auth-header";
import { toast } from "react-hot-toast";
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

//  Dummy response
const response = {
  id: Math.ceil(Math.random() * 100),
  author: "Ajit Kumar",
  date: "2d ago",
  dateTime: "2023-01-23T22:34Z",
  slug: "slug_" + Math.ceil(Math.random() * 10000),
  name: "organization" + Math.ceil(Math.random() * 100),
  description: "description",
  contact: {
    email: "a@email.com",
    mobileNumber: "9999999999",
    location: "some location",
  },
};

export const createOrganizationApi = async ({ data }) => {
  try {
    /*  const res = await axios.post(BASE_URL + "/organizations", data, {
          headers: { ...authHeader() },
        });
        return res.data; */

    return response;
  } catch (e) {
    toast.error(`Unable to load data: ${e.message}`);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const updateOrganizationApi = ({ selectedOrg }) => {
  try {

    return response;
  } catch (e) {
    toast.error(`Unable to load data: ${e.message}`);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

export const fetchOrganizationApi = async ({ id = "" }) => {
  try {
    return response;
  } catch (e) {
    toast.error(`Unable to load data: ${e.message}`);
    throw Error(e.response?.data ?? "Something went wrong");
  }
};

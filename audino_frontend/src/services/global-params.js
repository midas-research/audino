import { AUDINO_ORG } from "../constants/constants";

export default function globalParams() {
  const org = localStorage.getItem(AUDINO_ORG) || "";

  return { org: org };
}

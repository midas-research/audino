export default function authHeader() {
  const audinoKey = localStorage.getItem("audino-key");

  if (audinoKey) {
    return {
      Authorization: "Token " + audinoKey,
    };
  } else {
    return {};
  }
}

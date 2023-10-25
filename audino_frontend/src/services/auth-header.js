import { nanoid } from "nanoid";

export default function authHeader() {
  // const token =
  //   "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBDbGFyayIsImVtYWlsIjoidGVhY2hlckB0ZWFjaGVyLmNvbSIsIl9pZCI6IjYyNWVkY2U2ZDUyZjk4MGY4ZjBjNjk4MSIsInR5cGUiOiJUIiwiaWF0IjoxNjY3ODA1MTc4LCJleHAiOjE2Njg0MDk5NzgsImF1ZCI6Imh0dHBzOi8vYXBwLmt5cm9uLmluLyIsImlzcyI6IktZUk9OIiwic3ViIjoidGVhY2hlckB0ZWFjaGVyLmNvbSJ9.dyzLk1ZOApcHkV1mAk2yuyRrg9TOHe0jhWMiZSGHHlDr6XUhezQrwlts3dWQO6ayp5ARLcZJTpDX_oGa1dlHEw";
  const audinoKey = localStorage.getItem("audino-key");

  const { id } = nanoid();

  if (audinoKey) {
    return { "Authorization": "Token " + audinoKey }
  } else {
    return {};
  }
}

import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import ErrorBoundary from "./routes/error-page";
import Root from "./routes/root";
import SignupPage from "./pages/SignupPage/SignupPage";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      {CustomToast()}
      <Routes>
        <Route
          path="/login"
          exact
          element={
            <ErrorBoundary>
              <LoginPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/signup"
          exact
          element={
            <ErrorBoundary>
              <SignupPage />
            </ErrorBoundary>
          }
        />
        {/* <Route path="/google/oauth" element={<GoogleRedirect />} /> */}
        <Route
          path="/*"
          element={
            <ErrorBoundary>
              <Root />
            </ErrorBoundary>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

const CustomToast = () => {
  return createPortal(
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        position: "fixed",
        // zIndex: "999999"
      }}
      toastOptions={{
        // Define default options
        className: "toaster-style text-sm rounded-md",
        duration: 5000,
        style: {
          background: "#333",
          color: "#fff",
        },

        // Default options for specific types
        success: {
          style: {
            background: "#f0fdf4",
            color: "#15803d",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            color: "#b91c1c",
          },
        },
        custom:{
          style:{
            background:'#fff',
            color:'#000',
          }
        }
      }}
    />,
    document.getElementById("alert-modal")
  );
};

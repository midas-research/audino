import React,{useState} from 'react';
import { SunIcon,MoonIcon } from '@heroicons/react/24/outline'
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import ErrorBoundary from "./routes/error-page";
import Root from "./routes/root";
import SignupPage from "./pages/SignupPage/SignupPage";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";
import EmailVerificataionSentPage from "./pages/EmailVerificataionPage/EmailVerificataionSentPage";
import EmailVerificationFailPage from "./pages/EmailVerificataionPage/EmailVerificationFailPage";
import EmailConfirmationPage from "./pages/EmailVerificataionPage/EmailConfirmationPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage/AcceptInvitationPage";
import ScrollToTop from "./functions/scrollToUp";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ForgotPasswordPage/ChangePasswordPage";
import { AUDINO_ORG } from "./constants/constants";

function OrgHandler() {
  const location = useLocation();

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orgSlug = searchParams.get('org');
    if (orgSlug) {
      localStorage.setItem(AUDINO_ORG, orgSlug);
    }
  }, [location.search]);

  return null;
}

function App() {
  const [isDarkMode,setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const toggleDarkMode = () => {
    const rootElement = document.documentElement;
    
    if (rootElement.classList.contains('dark')) {
      rootElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      rootElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };
  return (
    <div className=''>
    <BrowserRouter>
      <OrgHandler />
      <ScrollToTop />
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
        <Route
          exact
          path="/auth/email-verification-sent"
          element={
            <ErrorBoundary>
              <EmailVerificataionSentPage />
            </ErrorBoundary>
          }
        />
        <Route
          exact
          path="/auth/incorrect-email-confirmation"
          element={
            <ErrorBoundary>
              <EmailVerificationFailPage />
            </ErrorBoundary>
          }
        />

        <Route
          exact
          path="/auth/email-confirmation"
          element={
            <ErrorBoundary>
              <EmailConfirmationPage />
            </ErrorBoundary>
          }
        />
        <Route
          exact
          path="/auth/register/invitation"
          element={
            <ErrorBoundary>
              <AcceptInvitationPage />
            </ErrorBoundary>
          }
        />
        <Route
          exact
          path="/auth/forgot-password"
          element={
            <ErrorBoundary>
              <ForgotPasswordPage />
            </ErrorBoundary>
          }
        />
        <Route
          exact
          path="/auth/password/reset/confirm"
          element={
            <ErrorBoundary>
              <ChangePasswordPage />
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
    <button
        onClick={toggleDarkMode}
        id="darkModeToggle"
        className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-full shadow-lg z-[9999]"
      >
        {isDarkMode ? <SunIcon className='h-7 w-7'/> : <MoonIcon className='h-5 w-5'/>}
      </button>

    </div>
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
          background: "#fff",
          color: "#333",
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
        custom: {
          style: {
            background: "#fff",
            color: "#000",
          },
        },
      }}
    />,
    document.getElementById("alert-modal")
  );
};

import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import PageNotFound from "./page-not-found";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import AnnotatePage from "../pages/AnnotatePage/AnnotatePage";
import ProjectPage from "../pages/ProjectPage/ProjectPage";
import AddProjectPage from "../pages/AddProjectPage/AddProjectPage";
import TaskPage from "../pages/TaskPage/TaskPage";
import AddTaskPage from "../pages/AddTaskPage/AddTaskPage";
import JobPage from "../pages/JobPage/JobPage";
import OrganizationsPage from "../pages/OrganizationPage/OrganizationPage";
import AddOrganizationPage from "../pages/AddOrganizationPage/AddOrganizationPage";
import InvitationPage from "../pages/InvitationPage/InvitationPage";
import AddJobPage from "../pages/AddJobPage/AddJobPage";
import AnalyticsPage from "../pages/AnalyticsPage/AnalyticsPage";
import CloudStoragePage from "../pages/CloudStoragePage/CoudStoragePage";
import AddCloudStoragePage from "../pages/AddCloudStoragePage/AddCloudStoragePage";

export default function Root() {
  const loginState = useSelector((state) => state.loginReducer);
  const checkAuthentication = () => {
    if (loginState.audinoKey) return true;
    return false;
  };

  return checkAuthentication() ? (
    <div className="min-h-screen dark:bg-audino-deep-navy">
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to="/projects?page=1" />
            // <Suspense fallback={<>Loading...</>}>
            //   <HomePage />
            // </Suspense>
          }
        />
        <Route
          path="/organizations"
          element={
            <Suspense fallback={<>Loading...</>}>
              <OrganizationsPage />
            </Suspense>
          }
        />

        <Route
          path="/organizations/create"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddOrganizationPage />
            </Suspense>
          }
        />
        <Route
          path="/organizations/:id"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddOrganizationPage />
            </Suspense>
          }
        />
        <Route
          path="/annotate/:taskId/:id"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AnnotatePage />
            </Suspense>
          }
        />
        <Route
          path="/projects"
          element={
            <Suspense fallback={<>Loading...</>}>
              <ProjectPage />
            </Suspense>
          }
        />
        <Route
          path="/projects/create"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddProjectPage />
            </Suspense>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddProjectPage />
            </Suspense>
          }
        />
        <Route
          path="/tasks"
          element={
            <Suspense fallback={<>Loading...</>}>
              <TaskPage />
            </Suspense>
          }
        />
        <Route
          path="/tasks/create"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddTaskPage />
            </Suspense>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddTaskPage />
            </Suspense>
          }
        />
        <Route
          path="/tasks/:id/analytics"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AnalyticsPage />
            </Suspense>
          }
        />
        <Route
          path="/tasks/:id/jobs/create"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddJobPage />
            </Suspense>
          }
        />
        <Route
          path="/jobs"
          element={
            <Suspense fallback={<>Loading...</>}>
              <JobPage />
            </Suspense>
          }
        />
        <Route
          path="/cloud-storages"
          element={
            <Suspense fallback={<>Loading...</>}>
              <CloudStoragePage />
            </Suspense>
          }
        />
        <Route
          path="/cloud-storages/create"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddCloudStoragePage />
            </Suspense>
          }
        />

        <Route
          path="/cloud-storages/:id"
          element={
            <Suspense fallback={<>Loading...</>}>
            <AddCloudStoragePage />
            </Suspense>
          }
        />
        <Route
          path="/invitations"
          element={
            <Suspense fallback={<>Loading...</>}>
              <InvitationPage />
            </Suspense>
          }
        />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  ) : (
    <Navigate to="/login" />
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import PageNotFound from "./page-not-found";
import { Suspense } from "react";
import Organization from "../pages/Organization/Organization";
import { useSelector } from "react-redux";
import AnnotatePage from "../pages/AnnotatePage/AnnotatePage";
import ProjectPage from "../pages/ProjectPage/ProjectPage";
import AddProjectPage from "../pages/AddProjectPage/AddProjectPage";
import TaskPage from "../pages/TaskPage/TaskPage";
import AddTaskPage from "../pages/AddTaskPage/AddTaskPage";
import JobPage from "../pages/JobPage/JobPage";

export default function Root() {
  const loginState = useSelector((state) => state.loginReducer);
  const checkAuthentication = () => {
    if (loginState.audinoKey) return true;
    return false;
  };

  return checkAuthentication() ? (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<>Loading...</>}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/organization"
          element={
            <Suspense fallback={<>Loading...</>}>
              <Organization />
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
          path="/jobs"
          element={
            <Suspense fallback={<>Loading...</>}>
              <JobPage />
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

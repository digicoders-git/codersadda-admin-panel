import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const InstructorProtectedRoute = () => {
  const token = localStorage.getItem("instructor-token");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "instructor") {
    return <Navigate to="/instructor-login" replace />;
  }

  return <Outlet />;
};

export default InstructorProtectedRoute;

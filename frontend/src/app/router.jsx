// src/app/router.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoadingIndicator from "../components/ui/LoadingIndicator";
const LoginPage = lazy(() => import("../pages/LoginPage"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const DoctorDashboard = lazy(() => import("../pages/DoctorDashboard"));
const FrontDeskDashboard = lazy(() => import("../pages/FrontdeskDashboard"));
const PatientManagementPage = lazy(() =>
  import("../pages/PatientManagementPage")
);
const AdminPatientsPage = lazy(() => import("../pages/AdminPatientsPage"));
const AdminServicesPage = lazy(() => import("../pages/AdminServicesPage"));
const PatientDetailPage = lazy(() => import("../pages/PatientDetailPage"));
const NewPatientPage = lazy(() => import("../pages/NewPatientPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));
const UserManagementPage = lazy(() => import("../pages/UserManagementPage"));
const AccountSettingsPage = lazy(() => import("../pages/AccountSettingsPage"));
const FrontdeskAppointmentsPage = lazy(() =>
  import("../pages/FrontdeskAppointmentsPage")
);
const DoctorAppointmentsPage = lazy(() =>
  import("../pages/DoctorAppointmentsPage")
);
const AdminAppointmentsPage = lazy(() =>
  import("../pages/AdminAppointmentsPage")
);
const DoctorMedicalRecordsPage = lazy(() =>
  import("../pages/DoctorMedicalRecordsPage")
);
const DoctorSchedulePage = lazy(() => import("../pages/DoctorSchedulePage"));
const FrontdeskCheckoutPage = lazy(() =>
  import("../pages/FrontdeskCheckoutPage")
);
const AdminReportsPage = lazy(() => import("../pages/AdminReportsPage"));
const StyleGuidePage = lazy(() => import("../pages/StyleGuidePage"));
const DiagnosticsPage = lazy(() => import("../pages/DiagnosticsPage")); // Import the DiagnosticsPage component
const SettingsPage = lazy(() => import("../pages/SettingsPage")); // Import the SettingsPage component
import AppLayout from "../components/Layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRouter() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Style Guide Route - accessible without login for development purposes */}
        <Route path="/style-guide" element={<StyleGuidePage />} />

        {/* Protected Routes within AppLayout */}
        {/* This outer ProtectedRoute ensures user is logged in for any route within AppLayout */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "doctor", "frontdesk"]}>
              <AppLayout /> {/* AppLayout should contain an <Outlet /> */}
            </ProtectedRoute>
          }
        >
          {/* Specific role-based routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Add route for User Management */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          {/* Add route for Admin Appointments */}
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAppointmentsPage />
              </ProtectedRoute>
            }
          />
          {/* Add route for Admin Services */}
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminServicesPage />
              </ProtectedRoute>
            }
          />
          {/* Add route for Admin Patients */}
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPatientsPage />
              </ProtectedRoute>
            }
          />
          {/* Admin New Patient Page */}
          <Route
            path="/admin/patients/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <NewPatientPage />
              </ProtectedRoute>
            }
          />
          {/* Admin Patient Detail Page */}
          <Route
            path="/admin/patients/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          {/* Add route for Admin Diagnostics Page */}
          <Route
            path="/admin/diagnostics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DiagnosticsPage />
              </ProtectedRoute>
            }
          />
          {/* Add route for Settings Page */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "frontdesk"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          {/* Patient Management for Doctor */}
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <PatientManagementPage />
              </ProtectedRoute>
            }
          />
          {/* Doctor Patient Detail Page */}
          <Route
            path="/doctor/patients/:id"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/medical-records"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorMedicalRecordsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/frontdesk"
            element={
              <ProtectedRoute allowedRoles={["frontdesk"]}>
                <FrontDeskDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/frontdesk/appointments"
            element={
              <ProtectedRoute allowedRoles={["frontdesk"]}>
                <FrontdeskAppointmentsPage />
              </ProtectedRoute>
            }
          />
          {/* Patient Management for Front Desk */}
          <Route
            path="/frontdesk/patients"
            element={
              <ProtectedRoute allowedRoles={["frontdesk"]}>
                <PatientManagementPage />
              </ProtectedRoute>
            }
          />
          {/* New Patient Page for Front Desk */}
          <Route
            path="/frontdesk/patients/new"
            element={
              <ProtectedRoute allowedRoles={["frontdesk"]}>
                <NewPatientPage />
              </ProtectedRoute>
            }
          />
          {/* Frontdesk Patient Detail Page */}
          <Route
            path="/frontdesk/patients/:id"
            element={
              <ProtectedRoute allowedRoles={["frontdesk"]}>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/frontdesk/checkout"
            element={
              <ProtectedRoute allowedRoles={["frontdesk"]}>
                <FrontdeskCheckoutPage />
              </ProtectedRoute>
            }
          />
          {/* Add route for Account Settings */}
          <Route
            path="/account-settings"
            element={
              <ProtectedRoute allowedRoles={["admin", "doctor", "frontdesk"]}>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />
          {/* Example: Redirect root path to login or a default dashboard */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Catch-all for Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;

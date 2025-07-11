import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TourLMSProvider } from "./contexts/TourLMSContext";
import AdminDashboard from "./pages/admin/Dashboard";
import { GoogleOAuthProvider } from "@react-oauth/google";
import FacilitatorDashboard from "./pages/facilitator/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Welcome from "./pages/auth/Welcome";
import { Toaster } from "@/components/ui/toaster";
import { NavigationProvider } from "./contexts/NavigationContext";
import Layout from "./components/layout/Layout";
import CreateCourse from "./pages/facilitator/CreateCourse";
import EditCourse from "./pages/facilitator/EditCourse";
import CourseGrid from "./pages/facilitator/CourseGrid";
import CourseDetail from "./pages/facilitator/CourseDetail";
import DraftCourses from "./pages/facilitator/DraftCourses";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCourseDetail from "./pages/student/CourseDetail";
import Forum from "./pages/student/Forum";
import GeneralForum from "./components/forum/GeneralForum";
import FacilitatorAnalytics from "./components/analytics/FacilitatorAnalytics";
import Students from "./pages/facilitator/Students";
import UserAccount from "./pages/common/UserAccount";
import Security from "./pages/common/Security";
import Index from "./pages/Index";
import AdminLayout from "./components/layout/AdminLayout";
import AdminLogin from "./pages/admin/Login";
import AdminStudents from "./pages/admin/Students";
import AdminStudentDetail from "./pages/admin/StudentDetail";
import AdminFacilitators from "./pages/admin/Facilitators";
import AdminFacilitatorDetail from "./pages/admin/FacilitatorDetail";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminEvents from "./pages/admin/Events";
import AdminEventDetail from "./pages/admin/EventDetail";
import AdminNotifications from "./pages/admin/Notifications";
import Events from "./pages/student/Events";
import EventDetail from "./pages/student/EventDetail";
import ApiDocumentation from "./pages/admin/ApiDocumentation";
import ApiDocumentationStudents from "./pages/student/ApiDocumentationStudents";
import ApiDocumentationFac from "./pages/facilitator/ApiDocumentationFac";
import LeaderboardPage from "./pages/student/LeaderboardPage";
import BadgesPage from "./pages/student/BadgesPage";
import { XPProvider } from "@/contexts/XPContext";
import Challenges from "@/pages/student/Challenges";
import AIAssistant from "@/pages/student/Ai-assistant";
import ContentManagementPage from "./pages/student/Content-management";
import Analytics from "./pages/student/Analytics";

const VITE_GOOGLE_CLIENT = import.meta.env.VITE_GOOGLE_CLIENT;

console.log("VITE_GOOGLE_CLIENT", VITE_GOOGLE_CLIENT);
const App = () => {
  return (
    <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT}>
      <TourLMSProvider>
        <AuthProvider>
          <NavigationProvider>
            <XPProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/welcome" element={<Welcome />} />

                  {/* Oracle/Admin Routes */}
                  <Route path="/oracle/login" element={<AdminLogin />} />
                  <Route path="/oracle" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="students" element={<AdminStudents />} />
                    <Route
                      path="students/:id"
                      element={<AdminStudentDetail />}
                    />
                    <Route
                      path="facilitators"
                      element={<AdminFacilitators />}
                    />
                    <Route
                      path="facilitators/:id"
                      element={<AdminFacilitatorDetail />}
                    />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route
                      path="notifications"
                      element={<AdminNotifications />}
                    />
                    <Route path="apiDocs" element={<ApiDocumentation />} />
                    <Route path="events/:id" element={<AdminEventDetail />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route path="/admin" element={<Layout userType="admin" />}>
                    <Route index element={<AdminDashboard />} />
                  </Route>

                  <Route
                    path="/facilitator"
                    element={<Layout userType="facilitator" />}
                  >
                    <Route index element={<FacilitatorDashboard />} />
                    <Route path="create-course" element={<CreateCourse />} />
                    <Route path="edit-course/:id" element={<EditCourse />} />
                    <Route path="courses" element={<CourseGrid />} />
                    <Route path="courses/:id" element={<CourseDetail />} />
                    <Route path="drafts" element={<DraftCourses />} />
                    <Route path="forum" element={<GeneralForum />} />
                    <Route
                      path="analytics"
                      element={<FacilitatorAnalytics />}
                    />
                    <Route path="students" element={<Students />} />
                    <Route path="apiDocs" element={<ApiDocumentationFac />} />
                    <Route
                      path="account"
                      element={<UserAccount userType="facilitator" />}
                    />
                    <Route path="security" element={<Security />} />
                  </Route>

                  <Route
                    path="/student"
                    element={<Layout userType="student" />}
                  >
                    <Route index element={<StudentDashboard />} />
                    <Route path="courses" element={<StudentCourses />} />
                    <Route
                      path="courses/:id"
                      element={<StudentCourseDetail />}
                    />
                    <Route path="events" element={<Events />} />
                    <Route path="events/:id" element={<EventDetail />} />
                    <Route path="forum" element={<Forum />} />
                    <Route
                      path="apiDocs"
                      element={<ApiDocumentationStudents />}
                    />
                    <Route
                      path="account"
                      element={<UserAccount userType="student" />}
                    />
                    <Route path="security" element={<Security />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="badges" element={<BadgesPage />} />
                    <Route path="challenges" element={<Challenges />} />
                    <Route path="ai-assistant" element={<AIAssistant />} />
                    <Route
                      path="content-management"
                      element={<ContentManagementPage />}
                    />
                    <Route path="analytics" element={<Analytics />} />
                  </Route>
                </Routes>
                <Toaster />
              </BrowserRouter>
            </XPProvider>
          </NavigationProvider>
        </AuthProvider>
      </TourLMSProvider>
    </GoogleOAuthProvider>
  );
};

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ManagerDashboard from "./pages/ManagerDashboard"; // Import the new dashboard component
import ForgotPassword from "./pages/ForgotPasswordPage";
import ResetPassword from "./pages/ResetPasswordPage";
import ManageHostel from "./pages/ManageHostel"; // Import the new ManageHostel component
import HostelsPage from "./pages/HostelsPage";
import HostelDetailsPage from "./pages/HostelDetailsPage";
import StudentDashboard from "./pages/StudentDashboard";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import EmailVerificationSuccess from "./pages/EmailVerificationSuccess";
import EmailVerificationError from "./pages/EmailVerificationError";
import PaymentSuccess from "./pages/PaymentSuccess";
import LandlordUploadForm from "./pages/Landlordpage";
import AdminDashboard from "./pages/AdminDashboard";
import UsersPage from "./pages/AdminUsersPage";
import StudentsPage from "./pages/AllStudents";
import FrequentlyAskedQuestions from "./pages/FAQ";
import AboutUs from "./pages/AboutUs";
import PrivacyAndPolicies from "./pages/PrivacyAndPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/Contact";
import StudentProfilePage from "./pages/StudentProfilePage";
import LandLordProfilePage from "./pages/LandLordProfilePage";
import StudentBookingsPage from "./pages/StudentBookingsPage";
import LandlordBookingsPage from "./pages/LandlordBookingsPage";
import LandlordNotificationsPage from "./pages/LandlordNotificationsPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import AdminAllHostels from "./pages/AdminAllHostels";
import LandlordHostels from "./pages/LandlordHostels";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/manage-hostel" element={<ManageHostel />} /> 
        <Route path="/hostels" element={<HostelsPage />} />
        <Route path="/hostels/:id" element={<HostelDetailsPage />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
        <Route path="/email-verification-error" element={<EmailVerificationError />} />
        <Route path="/verify-email/:token" element={<EmailVerificationSuccess />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/document-upload" element ={<LandlordUploadForm />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/bookings" element={<StudentBookingsPage />} />
        <Route path="/landlord-bookings" element={<LandlordBookingsPage />} />
        <Route path="/landlord-notifications" element={<LandlordNotificationsPage />} />
        <Route path="/landlord-hostels" element={<LandlordHostels />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<UsersPage />} />
        <Route path="admin-hostels" element={<AdminAllHostels />} />

        <Route path="/faq" element={<FrequentlyAskedQuestions />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/privacy" element={<PrivacyAndPolicies />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<ContactUs />} />

        <Route path="/profile" element={<StudentProfilePage />} />
        <Route path="/manager-profile" element={<LandLordProfilePage />} />
        <Route path="/hostels/:id/reviews" element={<ReviewsPage />} />

      </Routes>
    </Router>
  );
};

export default App;

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// ── Page-level loading fallback ──
const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030106' }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #bf0603', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Critical Routes (eager loaded — above the fold) ──
import Home from '../pages/Home';

// ── Public Pages (lazy loaded) ──
const AboutPage           = lazy(() => import('../pages/AboutPage'));
const CoursesPage         = lazy(() => import('../pages/CoursesPage'));
const ArticlesPage        = lazy(() => import('../pages/ArticlesPage'));
const ArticleDetailsPage  = lazy(() => import('../pages/ArticleDetailsPage'));
const ContactPage         = lazy(() => import('../pages/ContactPage'));
const AppointmentPage     = lazy(() => import('../pages/AppointmentPage'));
const TestimonialsPage    = lazy(() => import('../pages/TestimonialsPage'));
const FAQPage             = lazy(() => import('../pages/FAQPage'));
const PrivacyPolicyPage   = lazy(() => import('../pages/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('../pages/TermsConditionsPage'));
const NotFoundPage        = lazy(() => import('../pages/NotFoundPage'));
const ConsultingPage      = lazy(() => import('../pages/ConsultingPage'));
const ProductsPage        = lazy(() => import('../pages/ProductsPage'));
const ProductDetailsPage  = lazy(() => import('../pages/ProductDetailsPage'));
const Unauthorized        = lazy(() => import('../pages/Unauthorized'));

// ── Auth (lazy loaded) ──
const Login          = lazy(() => import('../components/auth/Login'));
const SignUp         = lazy(() => import('../components/auth/SignUp'));
const ForgetPassword = lazy(() => import('../components/auth/ForgetPassword'));

// ── Legacy Pages (Admin) — lazy loaded ──
const AdminArticle            = lazy(() => import('../legacy/pages/AdminArticle'));
const AdminCourseOrder        = lazy(() => import('../legacy/pages/AdminCourseOrder'));
const AdminContact            = lazy(() => import('../legacy/pages/AdminContact'));
const AdminAppointments       = lazy(() => import('../legacy/pages/AdminAppointments'));
const AdminQuestion           = lazy(() => import('../legacy/pages/AdminQuestion'));
const AdminCalendar           = lazy(() => import('../legacy/pages/AdminCalendar'));
const AdminSubscribeCourseList= lazy(() => import('../legacy/pages/AdminSubscribeCourseList'));
const AdminTrashCourses       = lazy(() => import('../legacy/pages/AdminTrashCourses'));
const AdminInquiries          = lazy(() => import('../legacy/pages/AdminInquiry'));
const AdminPaymentList        = lazy(() => import('../legacy/pages/AdminPaymentList'));
const AdminVedioOrder         = lazy(() => import('../legacy/pages/AdminVedioOrder'));
const AdminTitleArrange       = lazy(() => import('../legacy/pages/AdminTitleArrange'));
const AddCourse               = lazy(() => import('../legacy/pages/AddCourse'));
const AddProduct              = lazy(() => import('../legacy/pages/AddProduct'));
const AddModule               = lazy(() => import('../legacy/pages/AddModule'));
const Upload                  = lazy(() => import('../legacy/pages/Upload'));
const AddMeeting              = lazy(() => import('../legacy/pages/AddMeeting'));
const AdminLiveSession        = lazy(() => import('../legacy/pages/LiveSession/Adminlivesession'));
const AddEmi                  = lazy(() => import('../legacy/Emi/AddEmi'));
const EmiUserList             = lazy(() => import('../legacy/Emi/EmiUserList'));
const EmiDetails              = lazy(() => import('../legacy/Emi/EmiDetails'));
const QuestionAndAns          = lazy(() => import('../legacy/pages/QuestionAndAns'));

// ── Legacy Pages (User) — lazy loaded ──
const Dashboard         = lazy(() => import('../legacy/pages/Dashboard'));
const Profile           = lazy(() => import('../legacy/pages/Profile'));
const EnrolledCourses   = lazy(() => import('../legacy/pages/EnrolledCourses'));
const Startlearning     = lazy(() => import('../legacy/pages/Startleraning'));
const VedioDetail       = lazy(() => import('../legacy/pages/VedioDetail'));
const Enroll            = lazy(() => import('../legacy/pages/Enroll'));
const EnrollFree        = lazy(() => import('../legacy/pages/EnrollFree'));
const SuccessPage       = lazy(() => import('../legacy/pages/SuccessPage'));
const Meetings          = lazy(() => import('../legacy/pages/Meetings'));
const StudentLiveSession= lazy(() => import('../legacy/pages/LiveSession/StudentLiveSession'));
const JitsiIframe       = lazy(() => import('../legacy/pages/LiveSession/JitsiIframe'));
const PayEmi            = lazy(() => import('../legacy/Emi/PayEmi'));
const Finalize          = lazy(() => import('../legacy/Emi/Finalize'));
const Notifications     = lazy(() => import('../legacy/Emi/Notification'));
const Payment           = lazy(() => import('../legacy/Emi/Payment'));
const PaymentGuide      = lazy(() => import('../legacy/pages/PaymentGuide'));
const CourseDetail      = lazy(() => import('../legacy/pages/CourseDetail'));
const Services          = lazy(() => import('../legacy/pages/Services'));
const AudioVisualizer   = lazy(() => import('../components/AudioVisualizer/AudioVisualizer'));
const HoroscopePage     = lazy(() => import('../pages/horoscope/HoroscopePage'));

// ── Additional Legacy Sub-pages — lazy loaded ──
const BhagavadGita  = lazy(() => import('../legacy/pages/courses/BhagavadGita'));
const Narad         = lazy(() => import('../legacy/pages/courses/Narad'));
const Paidcourse1   = lazy(() => import('../legacy/pages/courses/paidcourse1'));
const Calendar      = lazy(() => import('../legacy/pages/Calender'));
const Calendar2     = lazy(() => import('../legacy/pages/Calender2'));
const Copartners    = lazy(() => import('../legacy/pages/Copartners'));
const NewUser       = lazy(() => import('../legacy/pages/NewUser'));
const OldUser       = lazy(() => import('../legacy/pages/OldUser'));
const ArticlePage   = lazy(() => import('../legacy/pages/Articles/Article1'));

const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Home — eager loaded for instant first paint */}
                <Route path="/" element={<Home />} />

                {/* Public Pages */}
                <Route path="/about"          element={<AboutPage />} />
                <Route path="/courses"        element={<CoursesPage />} />
                <Route path="/courses/:courseType/:slug" element={<CourseDetail />} />
                <Route path="/consulting"     element={<ConsultingPage />} />
                <Route path="/products"       element={<ProductsPage />} />
                <Route path="/products/:id"   element={<ProductDetailsPage />} />
                <Route path="/services"       element={<Services />} />
                <Route path="/articles"       element={<ArticlesPage />} />
                <Route path="/articles/:id"   element={<ArticleDetailsPage />} />
                <Route path="/article/:slug"  element={<ArticlePage />} />
                <Route path="/contact"        element={<ContactPage />} />
                <Route path="/testimonials"   element={<TestimonialsPage />} />
                <Route path="/faq"            element={<FAQPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms"          element={<TermsConditionsPage />} />
                <Route path="/paymentguide"   element={<PaymentGuide />} />
                <Route path="/finalize"       element={<Finalize />} />
                <Route path="/notifications"  element={<Notifications />} />
                <Route path="/pay/:courseId/:emiNumber/:planId/:encodedEmail" element={<Payment />} />
                <Route path="/horoscope/:sign" element={<HoroscopePage />} />

                {/* Additional Legacy Routes */}
                <Route path="/bhagavad-gita"    element={<BhagavadGita />} />
                <Route path="/narad"            element={<Narad />} />
                <Route path="/paidcourse1"      element={<Paidcourse1 />} />
                <Route path="/calendar"         element={<Calendar />} />
                <Route path="/calendar2"        element={<Calendar2 />} />
                <Route path="/copartners"       element={<Copartners />} />
                <Route path="/newuser"          element={<NewUser />} />
                <Route path="/olduser"          element={<OldUser />} />
                <Route path="/audio-experience" element={<AudioVisualizer />} />

                {/* Auth Routes */}
                <Route path="/login"          element={<Login />} />
                <Route path="/signup"         element={<SignUp />} />
                <Route path="/forgetpassword" element={<ForgetPassword />} />
                <Route path="/unauthorized"   element={<Unauthorized />} />

                {/* Protected — Appointment */}
                <Route path="/appointment" element={<ProtectedRoute><AppointmentPage /></ProtectedRoute>} />

                {/* User Protected Routes */}
                <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/enrolledcourse" element={<ProtectedRoute><EnrolledCourses /></ProtectedRoute>} />
                <Route path="/course/:courseName" element={<ProtectedRoute><Startlearning /></ProtectedRoute>} />
                <Route path="/course/:courseName/video/:videoId" element={<ProtectedRoute><VedioDetail /></ProtectedRoute>} />
                <Route path="/enroll/:courseId/:courseType" element={<ProtectedRoute><Enroll /></ProtectedRoute>} />
                <Route path="/enrollfree/:courseId/:courseType" element={<ProtectedRoute><EnrollFree /></ProtectedRoute>} />
                <Route path="/submission-success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>} />
                <Route path="/studentlivesession" element={<ProtectedRoute><StudentLiveSession /></ProtectedRoute>} />
                <Route path="/JitsiIframe"  element={<ProtectedRoute><JitsiIframe /></ProtectedRoute>} />
                <Route path="/payemi"       element={<ProtectedRoute><PayEmi /></ProtectedRoute>} />
                <Route path="/:courseName/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />

                {/* Admin Protected Routes */}
                <Route path="/admin"                  element={<ProtectedRoute adminOnly={true}><AdminArticle /></ProtectedRoute>} />
                <Route path="/admin/adminarticle"     element={<ProtectedRoute adminOnly={true}><AdminArticle /></ProtectedRoute>} />
                <Route path="/admin/admincourseorder" element={<ProtectedRoute adminOnly={true}><AdminCourseOrder /></ProtectedRoute>} />
                <Route path="/admin/admincontact"     element={<ProtectedRoute adminOnly={true}><AdminContact /></ProtectedRoute>} />
                <Route path="/admin/appointments"     element={<ProtectedRoute adminOnly={true}><AdminAppointments /></ProtectedRoute>} />
                <Route path="/admin/question-ans"     element={<ProtectedRoute adminOnly={true}><AdminQuestion /></ProtectedRoute>} />
                <Route path="/admin/question-answer"  element={<ProtectedRoute adminOnly={true}><QuestionAndAns /></ProtectedRoute>} />

                <Route path="/admin/adminsubscribecourselist" element={<ProtectedRoute adminOnly={true}><AdminSubscribeCourseList /></ProtectedRoute>} />
                <Route path="/admin/admininquiry"     element={<ProtectedRoute adminOnly={true}><AdminInquiries /></ProtectedRoute>} />
                <Route path="/admin/payment"          element={<ProtectedRoute adminOnly={true}><AdminPaymentList /></ProtectedRoute>} />
                <Route path="/admin/vedio-order"      element={<ProtectedRoute adminOnly={true}><AdminVedioOrder /></ProtectedRoute>} />
                <Route path="/admin/title-order"      element={<ProtectedRoute adminOnly={true}><AdminTitleArrange /></ProtectedRoute>} />
                <Route path="/admin/addcourse"        element={<ProtectedRoute adminOnly={true}><AddCourse /></ProtectedRoute>} />
                <Route path="/admin/trash-courses"    element={<ProtectedRoute adminOnly={true}><AdminTrashCourses /></ProtectedRoute>} />
                <Route path="/admin/addproduct"       element={<ProtectedRoute adminOnly={true}><AddProduct /></ProtectedRoute>} />
                <Route path="/admin/addmodule"        element={<ProtectedRoute adminOnly={true}><AddModule /></ProtectedRoute>} />
                <Route path="/admin/upload"           element={<ProtectedRoute adminOnly={true}><Upload /></ProtectedRoute>} />
                <Route path="/admin/addmeeting"       element={<ProtectedRoute adminOnly={true}><AddMeeting /></ProtectedRoute>} />
                <Route path="/admin/adminlivesession" element={<ProtectedRoute adminOnly={true}><AdminLiveSession /></ProtectedRoute>} />
                <Route path="/admin/addemi"           element={<ProtectedRoute adminOnly={true}><AddEmi /></ProtectedRoute>} />
                <Route path="/admin/emailuserlist"    element={<ProtectedRoute adminOnly={true}><EmiUserList /></ProtectedRoute>} />
                <Route path="/admin/emailuserlist/:email" element={<ProtectedRoute adminOnly={true}><EmiDetails /></ProtectedRoute>} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;

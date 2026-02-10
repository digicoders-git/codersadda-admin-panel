import Category from "../pages/Category";
import Courses from "../pages/courses/Courses";
import AddCourse from "../pages/courses/AddCourse";
import EditCourse from "../pages/courses/EditCourse";
import ViewCourse from "../pages/courses/ViewCourse";
import Users from "../pages/users/Users";
import EditUser from "../pages/users/EditUser";
import ViewUser from "../pages/users/ViewUser";
import EBooks from "../pages/ebooks/EBooks";
import AddEBook from "../pages/ebooks/AddEBook";
import EditEBook from "../pages/ebooks/EditEBook";
import ViewEBook from "../pages/ebooks/ViewEBook";
import EbookCategory from "../pages/ebooks/EbookCategory";
import Jobs from "../pages/jobs/Jobs";
import AddJob from "../pages/jobs/AddJob";
import EditJob from "../pages/jobs/EditJob";
import ViewJob from "../pages/jobs/ViewJob";
import AddLecture from "../pages/courses/AddLecture";
import ViewLecture from "../pages/courses/ViewLecture";
import EditLecture from "../pages/courses/EditLecture";
import AllLectures from "../pages/courses/AllLectures";
import CreateLecture from "../pages/courses/CreateLecture";
import Subscriptions from "../pages/subscriptions/Subscriptions";
import AddSubscription from "../pages/subscriptions/AddSubscription";
import ViewSubscription from "../pages/subscriptions/ViewSubscription";
import Slider from "../pages/sliders/Slider";
import EditSlider from "../pages/sliders/EditSlider";
import Shorts from "../pages/shorts/Shorts";
import AddShort from "../pages/shorts/AddShort";
import EditShort from "../pages/shorts/EditShort";
import ViewShort from "../pages/shorts/ViewShort";
import Quizzes from "../pages/quizzes/Quizzes";
import AddQuiz from "../pages/quizzes/AddQuiz";
import EditQuiz from "../pages/quizzes/EditQuiz";
import ViewQuiz from "../pages/quizzes/ViewQuiz";
import Referrals from "../pages/referrals/Referrals";
import ViewReferral from "../pages/referrals/ViewReferral";
import EditReferral from "../pages/referrals/EditReferral";
import QuizReport from "../pages/quizzes/QuizReport";
import UserQuizResult from "../pages/quizzes/UserQuizResult";
import Topics from "../pages/quizzes/Topics";
import ManageQuestions from "../pages/quizzes/ManageQuestions";
import Sales from "../pages/sales/Sales";
import CourseSales from "../pages/sales/CourseSales";
import EbookSales from "../pages/sales/EbookSales";
import JobSales from "../pages/sales/JobSales";
import SubscriptionSales from "../pages/sales/SubscriptionSales";
import Instructors from "../pages/instructors/Instructors";
import AddInstructor from "../pages/instructors/AddInstructor";
import ViewInstructor from "../pages/instructors/ViewInstructor";
import WebsiteCourses from "../pages/website/WebsiteCourses";
import AddWebsiteCourse from "../pages/website/AddWebsiteCourse";
import EditWebsiteCourse from "../pages/website/EditWebsiteCourse";
import ViewWebsiteCourse from "../pages/website/ViewWebsiteCourse";
import WebsiteCategories from "../pages/website/WebsiteCategories";
import AddWebsiteCategory from "../pages/website/AddWebsiteCategory";
import EditWebsiteCategory from "../pages/website/EditWebsiteCategory";
import ViewWebsiteCategory from "../pages/website/ViewWebsiteCategory";
import WebsiteReviews from "../pages/website/WebsiteReviews";
import AddWebsiteReview from "../pages/website/AddWebsiteReview";
import EditWebsiteReview from "../pages/website/EditWebsiteReview";
import ViewWebsiteReview from "../pages/website/ViewWebsiteReview";
import WebsiteBlogs from "../pages/website/WebsiteBlogs";
import AddWebsiteBlog from "../pages/website/AddWebsiteBlog";
import EditWebsiteBlog from "../pages/website/EditWebsiteBlog";
import ViewWebsiteBlog from "../pages/website/ViewWebsiteBlog";
import WebsiteSubscriptions from "../pages/website/WebsiteSubscriptions";
import AddWebsiteSubscription from "../pages/website/AddWebsiteSubscription";
import EditWebsiteSubscription from "../pages/website/EditWebsiteSubscription";
import ViewWebsiteSubscription from "../pages/website/ViewWebsiteSubscription";

import EnrolledStudents from "../pages/enrollments/EnrolledStudents";
import CourseEnrollments from "../pages/enrollments/CourseEnrollments";
import EbookEnrollments from "../pages/enrollments/EbookEnrollments";
import JobEnrollments from "../pages/enrollments/JobEnrollments";
import ViewEnrolledStudent from "../pages/enrollments/ViewEnrolledStudent";
import GenerateCertificate from "../pages/courses/GenerateCertificate";
import ManageCertificates from "../pages/courses/ManageCertificates";
import ManageQuizCertificates from "../pages/quizzes/ManageQuizCertificates";
import GenerateQuizCertificate from "../pages/quizzes/GenerateQuizCertificate";

export const AppRoute = [
  { path: "courses/manage-certificates", component: ManageCertificates },
  { path: "courses/generate-certificate", component: GenerateCertificate },
  { path: "quizzes/manage-certificates", component: ManageQuizCertificates },
  { path: "quizzes/generate-certificate", component: GenerateQuizCertificate },
  { path: "sales", component: Sales },
  { path: "sales/courses", component: CourseSales },
  { path: "sales/ebooks", component: EbookSales },
  { path: "sales/jobs", component: JobSales },
  { path: "sales/subscriptions", component: SubscriptionSales },
  { path: "category", component: Category },
  { path: "courses", component: Courses },
  { path: "courses/add", component: AddCourse },
  { path: "courses/enrolled", component: CourseEnrollments },
  { path: "courses/edit/:id", component: EditCourse },
  { path: "courses/view/:id", component: ViewCourse },
  { path: "courses/view/:id/add-lecture", component: AddLecture },
  { path: "courses/view/:id/add-lecture/:sectionId", component: AddLecture },
  { path: "courses/view/:id/lecture/:lectureId", component: ViewLecture },
  { path: "courses/view/:id/lecture/edit/:lectureId", component: EditLecture },
  { path: "lectures", component: AllLectures },
  { path: "lectures/create", component: CreateLecture },
  { path: "users", component: Users },
  { path: "users/edit/:id", component: EditUser },
  { path: "users/view/:id", component: ViewUser },
  { path: "ebooks", component: EBooks },
  { path: "ebookCategory", component: EbookCategory },
  { path: "ebooks/add", component: AddEBook },
  { path: "ebooks/enrolled", component: EbookEnrollments },
  { path: "ebooks/edit/:id", component: EditEBook },
  { path: "ebooks/view/:id", component: ViewEBook },
  { path: "jobs", component: Jobs },
  { path: "jobs/add", component: AddJob },
  { path: "jobs/enrolled", component: JobEnrollments },
  { path: "jobs/edit/:id", component: EditJob },
  { path: "jobs/view/:id", component: ViewJob },
  { path: "subscriptions", component: Subscriptions },
  { path: "subscriptions/add", component: AddSubscription },
  { path: "subscriptions/enrolled", component: EnrolledStudents },
  { path: "subscriptions/edit/:id", component: AddSubscription },
  { path: "subscriptions/view/:id", component: ViewSubscription },
  { path: "website/courses", component: WebsiteCourses },
  { path: "website/courses/add", component: AddWebsiteCourse },
  { path: "website/courses/edit/:id", component: EditWebsiteCourse },
  { path: "website/courses/view/:id", component: ViewWebsiteCourse },
  { path: "website/categories", component: WebsiteCategories },
  { path: "website/categories/add", component: AddWebsiteCategory },
  { path: "website/categories/edit/:id", component: EditWebsiteCategory },
  { path: "website/categories/view/:id", component: ViewWebsiteCategory },
  { path: "website/reviews", component: WebsiteReviews },
  { path: "website/reviews/add", component: AddWebsiteReview },
  { path: "website/reviews/edit/:id", component: EditWebsiteReview },
  { path: "website/reviews/view/:id", component: ViewWebsiteReview },
  { path: "website/blogs", component: WebsiteBlogs },
  { path: "website/blogs/add", component: AddWebsiteBlog },
  { path: "website/blogs/edit/:id", component: EditWebsiteBlog },
  { path: "website/blogs/view/:id", component: ViewWebsiteBlog },
  { path: "website/subscriptions", component: WebsiteSubscriptions },
  { path: "website/subscriptions/add", component: AddWebsiteSubscription },
  {
    path: "website/subscriptions/edit/:id",
    component: EditWebsiteSubscription,
  },
  {
    path: "website/subscriptions/view/:id",
    component: ViewWebsiteSubscription,
  },
  { path: "slider", component: Slider },
  { path: "slider/edit/:id", component: EditSlider },
  { path: "shorts", component: Shorts },
  { path: "shorts/add", component: AddShort },
  { path: "shorts/edit/:id", component: EditShort },
  { path: "shorts/view/:id", component: ViewShort },
  { path: "quizzes", component: Quizzes },
  { path: "quizzes/add", component: AddQuiz },
  { path: "quizzes/edit/:id", component: EditQuiz },
  { path: "quizzes/view/:id", component: ViewQuiz },
  { path: "quizzes/topics", component: Topics },
  { path: "quizzes/topic/:id/questions", component: ManageQuestions },
  { path: "referrals", component: Referrals },
  { path: "referrals/view/:id", component: ViewReferral },
  { path: "referrals/edit/:id", component: EditReferral },
  { path: "quizzes/report/:id", component: QuizReport },
  {
    path: "quizzes/report/:quizId/result/:studentId",
    component: UserQuizResult,
  },
  { path: "courses/enrolled/view/:id", component: ViewEnrolledStudent },
  { path: "ebooks/enrolled/view/:id", component: ViewEnrolledStudent },
  { path: "jobs/enrolled/view/:id", component: ViewEnrolledStudent },
  { path: "subscriptions/enrolled/view/:id", component: ViewEnrolledStudent },
  { path: "instructors", component: Instructors },
  { path: "instructors/add", component: AddInstructor },
  { path: "instructors/edit/:id", component: AddInstructor },
  { path: "instructors/view/:id", component: ViewInstructor },
];

import InstructorHome from "../pages/InstructorHome";
import MyCourses from "../pages/MyCourses";
import Salary from "../pages/Salary";
import MyEarning from "../pages/MyEarning";
import ViewCourseInstructor from "../pages/ViewCourseInstructor";
import ViewLectureInstructor from "../pages/ViewLectureInstructor";
import InstructorProfile from "../pages/InstructorProfile";

export const InstructorRoute = [
  { path: "", component: InstructorHome },
  { path: "my-courses", component: MyCourses },
  { path: "my-courses/view/:id", component: ViewCourseInstructor },
  {
    path: "my-courses/view/:id/lecture/:lectureId",
    component: ViewLectureInstructor,
  },
  { path: "salary", component: Salary },
  { path: "earnings", component: MyEarning },
  { path: "profile", component: InstructorProfile },
];

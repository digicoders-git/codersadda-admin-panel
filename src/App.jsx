import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./dashboard/Dashboard";
import Home from "./pages/Home";
import Login from "./Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppRoute } from "./routes/AppRoute";
import ScrollToTop from "./ScrollToTop";
import InstructorLogin from "./instructors/InstructorLogin";
import InstructorDashboard from "./instructors/layouts/InstructorDashboard";
import { InstructorRoute } from "./instructors/routes/InstructorRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import InstructorProtectedRoute from "./components/InstructorProtectedRoute";
import Loader from "./components/Loader";
import VerifyCertificate from "./pages/VerifyCertificate";

const App = () => {
  return (
    <ThemeProvider>
      <ScrollToTop />
      <>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/loader" element={<Loader />} />
          <Route
            path="/verify/:certificateId"
            element={<VerifyCertificate />}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              {AppRoute.map((l, i) => {
                const Com = l.component;
                return <Route key={i} path={l.path} element={<Com />} />;
              })}
            </Route>
          </Route>

          <Route path="/instructor-login" element={<InstructorLogin />} />
          <Route element={<InstructorProtectedRoute />}>
            <Route
              path="/instructor-dashboard"
              element={<InstructorDashboard />}
            >
              {InstructorRoute.map((l, i) => {
                const Com = l.component;
                return <Route key={i} path={l.path} element={<Com />} />;
              })}
            </Route>
          </Route>
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </>
    </ThemeProvider>
  );
};

export default App;

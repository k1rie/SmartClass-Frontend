import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Grupos from "./pages/Grupos";
import Grupo from "./pages/Grupo";
import Scanner from "./pages/Scanner";
import Login from "./pages/Login";
import StudentInfo from "./pages/StudentInfo";
import FaceRecognition from "./pages/FaceRecognition";
const PrivateRoute = ({ children }) => {
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");

  if (!email || !password) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/grupos"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Grupos />
                </PrivateRoute>
              }
            />
            <Route
              path="/grupo/:id"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Grupo />
                </PrivateRoute>
              }
            />
            <Route
              path="/scanner"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Scanner />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/group/:groupId/:studentId"
              element={
                <PrivateRoute>
                  <Navbar />
                  <StudentInfo />
                </PrivateRoute>
              }
            />
            <Route
              path="/face-recognition"
              element={
                <PrivateRoute>
                  <Navbar />
                  <FaceRecognition />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

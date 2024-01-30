import "./App.css";
import Register from "./Components/Screens/Register";
import Login from "./Components/Screens/Login";
import Home from "./Components/Screens/Home";
import DigitalClassroom from "./Components/Screens/DigitalClassroom";
import StudentDashboard from "./Components/Screens/StudentDashboard";
import TeacherDashboard from "./Components/Screens/TeacherDashboard";
import NavBar from "./Components/Screens/NavBar";
import { AuthContext } from "./context/AuthContext";
import { useContext } from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ element }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return element;
  };

  const LoginRoute = ({ element }) => {
    if (currentUser) {
      return <Navigate to="/home" />;
    }
    return element;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRoute element={<Login />} />} />
        <Route path="/login" element={<LoginRoute element={<Login />} />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/digital" element={<DigitalClassroom />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/navbar" element={<NavBar />} />
      </Routes>
    </Router>
  );
}

export default App;

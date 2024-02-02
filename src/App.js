import "./App.css";
import Register from "./Components/Screens/Register";
import Login from "./Components/Screens/Login";
import Home from "./Components/Screens/Home";
import { AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import DigitalClassroom from "./Components/Screens/DigitalClassroom";
import NewsBot from './Components/Screens/Bots/NewsBot';
import MentalHealthBot from "./Components/Screens/Bots/MentalHealthBot";
import MathsBot from "./Components/Screens/Bots/MathsBot";
import LandingPage from "./Components/Screens/LandingPage.js";
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRoute element={<Login />} />} />
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/digital" element={<DigitalClassroom />} />
        <Route path="/mental" element={<MentalHealthBot />} />
        <Route path="/news" element={<NewsBot />} />
        <Route path="/maths" element={<MathsBot />} />

      </Routes>
    </Router>
  );
}

export default App;

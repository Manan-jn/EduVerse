import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="content">
      <h2 className="wordCarousel h2Head">
        <i>
          <span>Want to be a :</span>
          <div>
            <ul className="flip5">
              <li>partner in your child's learning ?</li>
              <li>better student with accelerated learning ?</li>
              <li>part of this educational AI universe ?</li>
              <li>superhero teacher and connect better ?</li>
              <li>more informed community member ?</li>
            </ul>
          </div>
        </i>
      </h2>
      <h1 className="h1Head">E D U V E R S E</h1>
      <div>
        <button className="button-lp" onClick={handleLogin}>
          Login
        </button>
        <span>&nbsp;&nbsp;</span>
        <button className="button-lp" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

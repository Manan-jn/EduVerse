import React from "react";
import { useEffect } from "react";
import { useState, useContext } from "react";
import { getDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import { doc } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { AuthContext } from "../../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
import CommunityDashboard from "./CommunityDashboard";
import "./Home.css"
import { Button, Flex } from 'antd';
import GoogleTranslate from "./GoogleTranslate";
const Home = ({ route }) => {
  const [user, setUser] = useState({});
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);

  useEffect(() => {
    const getUser = () => {
      const unsub = onSnapshot(
        doc(firestore, "users", currentUser.uid),
        (doc) => {
          setUser(doc.data());
          console.log(doc.data());
        }
      );

      return () => {
        unsub();
      };
    };

    currentUser.uid && getUser();
  }, [currentUser.uid]);

  const logout = async () => { };

  const containerStyle = {
    backgroundColor: "#323237",
    color: "white",
    padding: "20px",
  };

  return (
    <div style={containerStyle}>

      <div className="header">
        <div className="header-hi">{user && <h2>🙏 Hello <span style={{ color: "#D3FBD8" }}>{user.name}</span>!</h2>}</div>
        <div className="header-button">
          {/* <GoogleTranslate /> */}

          {/* <button onClick={() => signOut(auth)}> SignOut</button> */}
          <Flex wrap="wrap" gap="small">
            <Button type="primary" danger onClick={() => signOut(auth)}>
              Sign Out
            </Button>
          </Flex>
        </div>
      </div>
      <div className="dashboard">
        {user.role === "student" && <StudentDashboard />}
        {user.role === "parent" && <ParentDashboard />}
        {user.role === "teacher" && <TeacherDashboard />}
        {user.role === "communityMember" && <CommunityDashboard />}
      </div>
    </div>
  );
};

export default Home;

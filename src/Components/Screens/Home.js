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
  return (
    <div>
      <h3>Home</h3>
      <p>Home page</p>

      <button onClick={() => signOut(auth)}> SignOut</button>
      {user.role === "student" && <StudentDashboard />}
      {user.role === "parent" && <ParentDashboard />}
      {user.role === "teacher" && <TeacherDashboard />}
      {user.role === "communityMember" && <CommunityDashboard />}

    </div>
  );
};

export default Home;

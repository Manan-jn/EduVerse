import React from "react";
import { useEffect, useRef } from "react";
import { useState, useContext } from "react";
import { getDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import { firestore } from "../../firebase-config";
import { addDoc, collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { Col, Row, Statistic } from "antd";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
import { AuthContext } from "../../context/AuthContext";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import axios from "axios";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const Home = ({ route }) => {
  const [user, setUser] = useState({});
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const uid = currentUser.uid;
  console.log(currentUser.uid);

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
  return (
    <div>
      {user.role === "student" && <StudentDashboard />}
      {user.role === "parent" && <ParentDashboard />}
      {user.role === "teacher" && <TeacherDashboard />}
      {/* <button onClick={() => signOut(auth)}> SignOut</button> */}
    </div>
  );
};

export default Home;

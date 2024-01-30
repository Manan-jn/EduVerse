import React from "react";
import { useEffect, useState, useContext, useRef } from "react";
import { firestore } from "../../firebase-config";
import { addDoc, collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { getDoc, onSnapshot } from "firebase/firestore";
import { Col, Row, Statistic } from "antd";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Spinner } from "flowbite-react";
import CardTemp from "./CardTemp";
import { Label, TextInput } from "flowbite-react";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const uid = currentUser.uid;
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const userDoc = doc(firestore, "users", currentUser.uid);
        const unsubscribe = onSnapshot(userDoc, (doc) => {
          setUser(doc.data());
          setLoading(false);
          console.log(doc.data());
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    currentUser.uid && getUser();
  }, [currentUser.uid]);
  const handleDigital = () => {
    navigate(`/digital`);
  };
  return (
    <div>
      <NavBar />
      {successMsg && { successMsg }}
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Center-aligned spinner example" />
        </div>
      ) : (
        <div>
          {user && user.uid && (
            <div style={{ width: "25%" }}>
              <Label htmlFor="disabledInput1">Unique UID</Label>
              <TextInput
                type="text"
                value={user.uid}
                id="disabledInput1"
                placeholder={user.uid}
                disabled
              />
            </div>
          )}
          <div style={{ width: "50%" }}>
            <Row gutter={16}>
              {user && user.timeLearned && (
                <Col span={12}>
                  <Statistic title="Hours Learned" value={user.timeLearned} />
                </Col>
              )}
              <Col span={12}>
                {user && user.lecturesCompleted && (
                  <Statistic
                    title="Lectures Completed"
                    value={user.lecturesCompleted}
                  />
                )}
              </Col>
            </Row>
          </div>
          <CardTemp />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

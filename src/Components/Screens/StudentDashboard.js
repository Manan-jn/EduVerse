import React from "react";
import { useEffect, useState, useContext } from "react";
import { firestore } from "../../firebase-config";
import { addDoc, collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { getDoc, onSnapshot } from "firebase/firestore";
import { Col, Row, Statistic } from "antd";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const uid = currentUser.uid;
  const navigate = useNavigate();

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
  const handleDigital = () => {
    navigate(`/digital`);
  };
  return (
    <div>
      Student Dashboard
      <p>
        {user && <p>{user.email}</p>}
        <p>{user && user.uid}</p>
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
      </p>
      <div>
        <button onClick={handleDigital}>Digital classroom</button>
      </div>
    </div>
  );
};

export default StudentDashboard;

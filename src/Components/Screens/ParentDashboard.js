import React from "react";
import { useState, useEffect, useContext } from "react";
import { firestore } from "../../firebase-config";
import {
  addDoc,
  collection,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { Col, Row, Statistic } from "antd";

const ParentDashboard = () => {
  const [childId, setChildId] = useState("");
  const [childName, setChildName] = useState("");

  const [children, setChildren] = useState([]);
  const [childNames, setChildNames] = useState([]);
  const [timeLearnedTotal, setTimeLearnedTotal] = useState([]);
  const [lecturesCompletedTotal, setLecturesCompletedTotal] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const [successMsg, setSuccessMsg] = useState("");
  const [user, setUser] = useState(null);
  const uid = currentUser.uid;

  useEffect(() => {
    const getUser = () => {
      const unsub = onSnapshot(
        doc(firestore, "users", currentUser.uid),
        (doc) => {
          setUser(doc.data());
          setChildren(doc.data().childrenIds);
          setChildNames(doc.data().childrenNames);
          console.log(doc.data());
        }
      );
      return () => {
        unsub();
      };
    };

    getUser();
  }, []);
  useEffect(() => {
    const fetchChildren = async () => {
      let newTimeLearnedTotal = [];
      let newLecturesCompletedTotal = [];

      for (let i = 0; i < children.length; i++) {
        const docRef = doc(firestore, "users", children[i]);
        const docSnap = await getDoc(docRef);

        newTimeLearnedTotal.push(docSnap.data().timeLearned || 0);
        newLecturesCompletedTotal.push(docSnap.data().lecturesCompleted || 0);
      }
      setTimeLearnedTotal(newTimeLearnedTotal);
      setLecturesCompletedTotal(newLecturesCompletedTotal);
    };

    fetchChildren();
  }, [children]);
  const handleAddChild = async () => {
    const docRef = doc(firestore, "users", uid);
    console.log("childId" + childId);
    try {
      // Fetch the current data from the document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // If the document exists, update the array or create a new one
        const userData = docSnap.data();
        const existingArray = userData.childrenIds || []; // Assume 'slideIds' is the array field
        const childNameArray = userData.childrenNames || [];

        // Check if dataIn.slideId already exists in the array
        if (!existingArray.includes(childId)) {
          existingArray.push(childId); // Add dataIn.slideId to the array
        }
        if (!childNameArray.includes(childName)) {
          childNameArray.push(childName);
        }
        // Update the document with the modified data
        await updateDoc(docRef, {
          childrenIds: existingArray, // Update or create the 'slideIds' array field
          childrenNames: childNameArray,
        });
        setSuccessMsg("Added child");
      }
    } catch (error) {
      // Handle any errors here
      console.error("Error updating  children document:", error);
    }
  };
  return (
    <div>
      ParentDashboard
      <div>
        {successMsg && <p>{successMsg}</p>}
        <input
          type="text"
          placeholder="Add child Name"
          onChange={(e) => {
            setChildName(e.target.value);
          }}
          required={true}
        />
        <input
          type="text"
          placeholder="Add child id"
          onChange={(e) => {
            setChildId(e.target.value);
          }}
          required={true}
        />
        <button onClick={handleAddChild}>Add child</button>
        {timeLearnedTotal &&
          lecturesCompletedTotal &&
          childNames.map((childName, index) => (
            <Row key={index} gutter={16}>
              <Col span={12}>
                <Statistic
                  title={`Hours Learned (${childName})`}
                  value={timeLearnedTotal[index]}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={`Lectures Completed (${childName})`}
                  value={lecturesCompletedTotal[index]}
                />
              </Col>
            </Row>
          ))}
      </div>
    </div>
  );
};

export default ParentDashboard;

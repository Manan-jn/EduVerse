import React from "react";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Alert, Space, Card, Button } from "antd";

import { CheckCircleTwoTone } from "@ant-design/icons";

const PdfView = ({ pdfUrl, dataIn }) => {
  const [comp, setComp] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const uid = currentUser.uid;

  const handleComplete = async () => {
    const docRef = doc(firestore, "students", uid);

    try {
      // Fetch the current data from the document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // If the document exists, update the array or create a new one
        const userData = docSnap.data();
        const existingArray = userData.completedSlideIds || []; // Assume 'slideIds' is the array field
        let timeL = userData.timeLearned || 0;
        let lecturesComp = userData.lecturesCompleted || 0;

        // Check if dataIn.slideId already exists in the array
        if (!existingArray.includes(dataIn.slideID)) {
          existingArray.push(dataIn.slideID); // Add dataIn.slideId to the array
        }
        timeL = parseInt(timeL, 10) + parseInt(dataIn.time, 10);
        lecturesComp = parseInt(lecturesComp, 10) + 1;

        // Update the document with the modified data
        await updateDoc(docRef, {
          completedSlideIds: existingArray, // Update or create the 'slideIds' array field
          timeLearned: timeL,
          lecturesCompleted: lecturesComp,
        });
      }
      setComp(true);
    } catch (error) {
      // Handle any errors here
      console.error("Error updating document:", error);
    }

    const slideRef = doc(firestore, "slides", dataIn.slideID);

    try {
      const docSnap = await getDoc(slideRef);
      if (docSnap.exists()) {
        const foundData = docSnap.data();
        const existingStudents = foundData.students || [];
        let totalHours = foundData.totalHours || 0;
        if (!existingStudents.includes(uid)) {
          existingStudents.push(uid);
        }
        totalHours = parseInt(totalHours, 10) + parseInt(dataIn.time, 10);

        await updateDoc(slideRef, {
          students: existingStudents,
          totalHours: totalHours,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const getInfo = async () => {
      const docRef = doc(firestore, "students", uid);
      const docSnap = await getDoc(docRef);
      const userData = docSnap.data();
      if (userData !== undefined && userData.completedSlideIds !== undefined) {
        const existingArray = userData.completedSlideIds || [];
        if (existingArray.find((id) => id === dataIn.slideID) !== undefined) {
          setComp(true);
        }
      }
    };
    getInfo();
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {comp && (
        <Space direction="vertical" style={{ width: "50%" }}>
          <Alert message="Completed Successfully" type="warning" closable />
        </Space>
      )}
      <Card
        title={dataIn.subject}
        bordered={true}
        style={{
          width: 400,
        }}
      >
        <p>Comment added by teacher: {dataIn.comment}</p>
        {comp && <CheckCircleTwoTone twoToneColor="#52c41a" />}
        {!comp && (
          <>
            <p>Time Required to complete this: {dataIn.time} hrs</p>
            <Button onClick={handleComplete}>Mark As Completed</Button>
          </>
        )}
      </Card>

      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} />
      </Worker>
    </div>
  );
};

export default PdfView;
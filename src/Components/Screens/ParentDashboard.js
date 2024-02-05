import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import { firestore } from "../../firebase-config";
import {
  addDoc,
  collection,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import {
  Col,
  Row,
  Statistic,
  Alert,
  Card,
  Button,
  Modal,
  Form,
  ConfigProvider,
  Input,
  Tour,
} from "antd";
import axios from "axios";
import "./Home.css";

const ParentDashboard = () => {
  const [childId, setChildId] = useState("");
  const [childName, setChildName] = useState("");

  const [children, setChildren] = useState([]);
  const [childNames, setChildNames] = useState([]);
  const [timeLearnedTotal, setTimeLearnedTotal] = useState([]);
  const [lecturesCompletedTotal, setLecturesCompletedTotal] = useState([]);
  const [learningStreakTotal, setLearningStreakTotal] = useState([]);
  const [tips, setTips] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const [successMsg, setSuccessMsg] = useState("");
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [message, setMessage] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [alertNot, setAlertNot] = useState(false);
  // Code for fetching mental health report
  const [mentalHealthReport, setMentalHealthReport] = useState(null);
  const [openTour, setOpenTour] = useState(true);
  const [steps, setSteps] = useState([
    {
      title: "Add your children with their UID",
      description:
        "Add your children's UID and their name to get their learning stats",
      target: () => addChildRef.current,
    },
    {
      title: "Connect with teachers",
      description:
        "Connect with teachers to get more insights about your children's performance",
      target: () => connectRef.current,
    },
  ]);

  const uid = currentUser.uid;

  const addChildRef = useRef(null);
  const tipRef = useRef(null);
  const statsRef = useRef(null);
  const connectRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://mental-health-bot-buwy.onrender.com/mentalHealthReport"
        );
        const data = await response.json();
        console.log("Data from the server:", data);
        setMentalHealthReport(data.mentalHealthReport);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const getUser = () => {
      const unsub = onSnapshot(
        doc(firestore, "parents", currentUser.uid),
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
    const fetchTeachers = async () => {
      const q = query(collection(firestore, "teachers"));

      const unsub = onSnapshot(q, (querySnapshot) => {
        const teachers = [];
        querySnapshot.forEach((doc) => {
          teachers.push(doc.data());
        });
        console.log(teachers);
        setTeachers(teachers);
      });
    };
    fetchTeachers();
  }, []);
  useEffect(() => {
    const fetchTip = async (timeLearned, lecturesCompleted, learningStreak) => {
      const getData = {
        hours_learned: timeLearned,
        lectures_completed: lecturesCompleted,
        learning_streak: learningStreak,
      };
      try {
        const getTip = await axios.post(
          "https://ai-tip.onrender.com/tipParent",
          getData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return getTip.data.tip;
      } catch (error) {
        console.log(error);
        return "Your child is doing great! Its just GPT Limit Exceeded";
      }
    };
    const fetchChildren = async () => {
      let newTimeLearnedTotal = [];
      let newLecturesCompletedTotal = [];
      let newLearningStreakTotal = [];
      const foundTipsTotal = [];

      if (children !== undefined) {
        for (let i = 0; i < children.length; i++) {
          const docRef = doc(firestore, "students", children[i]);
          const docSnap = await getDoc(docRef);

          newTimeLearnedTotal.push(docSnap.data().timeLearned || 0);
          newLecturesCompletedTotal.push(docSnap.data().lecturesCompleted || 0);
          newLearningStreakTotal.push(docSnap.data().learningStreak || 0);
          const foundTip = await fetchTip(
            docSnap.data().timeLearned || 0,
            docSnap.data().lecturesCompleted || 0,
            docSnap.data().learningStreak || 0
          );
          foundTipsTotal.push(foundTip);
        }
      }
      setTips(foundTipsTotal);
      setTimeLearnedTotal(newTimeLearnedTotal);
      setLecturesCompletedTotal(newLecturesCompletedTotal);
      setLearningStreakTotal(newLearningStreakTotal);
      if (children && children.length > 0) {
        // Add additional steps for personalized tips and statistics
        setSteps((prevSteps) => [
          ...prevSteps,
          {
            title: "Personalized Tips",
            description:
              "Based on your children's stats, see personalized tips to analyze their performance",
            target: () => tipRef.current,
          },
          {
            title: "Statistics of your children",
            description:
              "See the statistics of your children's learning progress and their mental health report",
            target: () => statsRef.current,
          },
        ]);
      }
    };

    fetchChildren();
  }, [children]);
  const handleAddChild = async () => {
    const docRef = doc(firestore, "parents", uid);
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
        setAlertNot(true);
      }
    } catch (error) {
      // Handle any errors here
      console.error("Error updating  children document:", error);
    }
  };
  const handleSendMessage = async () => {
    console.log(currentTeacher.uid);
    const docRef = doc(firestore, "teachers", currentTeacher.uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const teacherData = docSnap.data();
        const existingArray = teacherData.messagesRec || [];
        existingArray.push({
          sender: user.name,
          message: message,
          phone: phoneNum,
        });
        console.log(existingArray);
        await updateDoc(docRef, {
          messagesRec: existingArray,
        });
        console.log("Message sent");
        setSuccessMsg("Message sent");
        setMessage("");
        setPhoneNum("");
        setCurrentTeacher(null);
        setAlertNot(true);
        setOpenModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        marginTop: "30px",
      }}
    >
      <Tour open={openTour} steps={steps} onClose={() => setOpenTour(false)} />
      <div className="parent-dashboard-main">
        <div className="parent-addstudent" ref={addChildRef}>
          <h2 style={{ color: "rgb(108, 251, 206)" }}>
            <center>Add Child Info</center>
          </h2>
          <ConfigProvider
            theme={{
              token: {
                //   colorText: "white",
                colorTextBase: "white",
              },
            }}
          >
            <Form>
              <Form.Item
                name="Add Child Name"
                label="Add Child Name"
                rules={[{ required: true, message: "Please input!" }]}
              >
                <Input
                  type="text"
                  value={childName}
                  style={{ color: "black" }}
                  onChange={(e) => {
                    setChildName(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item
                name="Add Child UID"
                label="Add Child UID"
                rules={[{ required: true, message: "Please input!" }]}
              >
                <Input
                  type="text"
                  value={childId}
                  style={{ color: "black" }}
                  onChange={(e) => {
                    setChildId(e.target.value);
                  }}
                />
              </Form.Item>
              <Button
                type="primary"
                style={{ color: "white" }}
                onClick={handleAddChild}
              >
                <b>Add child</b>
              </Button>
            </Form>
          </ConfigProvider>
        </div>
        <div className="tip-stats">
          {alertNot && (
            <Alert
              message="Success!"
              type="warning"
              closable
              onClose={() => {
                setAlertNot(false);
                setSuccessMsg("");
              }}
            />
          )}
          <div>
            {timeLearnedTotal &&
              lecturesCompletedTotal &&
              learningStreakTotal &&
              childNames &&
              childNames.map((childName, index) => (
                <div>
                  <div
                    style={{
                      width: "70%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    ref={tipRef}
                  >
                    <Alert
                      message="Tip"
                      description={tips[index]}
                      type="success"
                      showIcon
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      borderRadius: "10px",
                      marginLeft: "0.5%",
                      marginTop: "2%",
                      width: "70%",
                    }}
                    ref={statsRef}
                  >
                    <ConfigProvider
                      theme={{
                        token: {
                          colorText: "white",
                          colorTextDescription: "white",
                        },
                      }}
                    >
                      {/* <h2 style={{ color: "rgb(108, 251, 206)" }}><center>Child's Learning Dashboard</center></h2> */}

                      <Row
                        key={index}
                        gutter={16}
                        style={{
                          padding: "2%",
                          backgroundColor: "black",
                          borderRadius: "10px",
                          marginLeft: "0.5%",
                        }}
                      >
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
                        <Col span={12}>
                          <Statistic
                            title={`Learning Streak (${childName})`}
                            value={learningStreakTotal[index]}
                          />
                        </Col>
                      </Row>
                    </ConfigProvider>

                    <div
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "2%",
                        backgroundColor: "#3f3f46",
                        borderRadius: "10px",
                        marginLeft: "3.5%",
                        display: "flex",
                        width: "56%",
                      }}
                    >
                      <div>
                        <h2 style={{ color: "rgb(108, 251, 206)" }}>
                          Mental Health Report
                        </h2>

                        {mentalHealthReport && <p>{mentalHealthReport}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {teachers && teachers.length > 0 && (
        <Card
          title="Connect With Teachers"
          className="parent-teacherCard"
          ref={connectRef}
        >
          <div className="parent-teacherCard">
            <ul>
              {teachers.map((teacher, index) => (
                <li key={index}>
                  <div>
                    <p>
                      {teacher.name}&nbsp; &nbsp;<i>{teacher.email}</i>
                    </p>
                    <p>Subject: {teacher.subject}</p>
                  </div>
                  <div>
                    <Button
                      onClick={() => {
                        setOpenModal(true);
                        setCurrentTeacher(teacher);
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <Modal
        title="Send Message"
        open={openModal}
        footer=""
        onCancel={() => {
          setOpenModal(false);
          setMessage("");
          setPhoneNum("");
          setCurrentTeacher(null);
        }}
      >
        <div>
          <Form>
            <Form.Item
              name="Message"
              label="Message"
              rules={[{ required: true, message: "Please input!" }]}
            >
              <input
                type="text"
                placeholder=""
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="Phone Number"
              label="Phone Number"
              rules={[{ required: true, message: "Please input!" }]}
            >
              <input
                type="text"
                placeholder=""
                value={phoneNum}
                onChange={(event) => setPhoneNum(event.target.value)}
              />
            </Form.Item>
            <Button style={{ color: "black" }} onClick={handleSendMessage}>
              Send
            </Button>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ParentDashboard;

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
    query,
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { Col, Row, Statistic, Alert } from "antd";
import axios from "axios";
import {
    ListGroup,
    Card,
    Button,
    Modal,
    TextInput,
    Label,
} from "flowbite-react";

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
    const [alertNot, setAlertNot] = useState(false);
    // Code for fetching mental health report
    const [mentalHealthReport, setMentalHealthReport] = useState(null);
    function onCloseModal() {
        setOpenModal(false);
        setMessage("");
        setCurrentTeacher(null);
    }

    const uid = currentUser.uid;

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
                });
                console.log(existingArray);
                await updateDoc(docRef, {
                    messagesRec: existingArray,
                });
                console.log("Message sent");
                setSuccessMsg("Message sent");
                setAlertNot(true);
                onCloseModal();
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div>
            {mentalHealthReport && (
                <div>
                    <h4>Mental Health Report:</h4>
                    <p>{mentalHealthReport}</p>
                </div>
            )}
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
            ParentDashboard
            <div>
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
                    learningStreakTotal &&
                    childNames &&
                    childNames.map((childName, index) => (
                        <div>
                            <div
                                style={{
                                    width: "50%",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Alert
                                    message="Tip"
                                    description={tips[index]}
                                    type="success"
                                    showIcon
                                />
                            </div>
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
                                <Col span={12}>
                                    <Statistic
                                        title={`Learning Streak (${childName})`}
                                        value={learningStreakTotal[index]}
                                    />
                                </Col>
                            </Row>
                        </div>
                    ))}
                <Card className="max-w-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                            Connect with Teachers
                        </h5>
                    </div>
                    <div className="flow-root">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {teachers.map((teacher, index) => (
                                <li key={index} className="py-3 sm:py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="shrink-0"></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                {teacher.name}
                                            </p>
                                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                {teacher.email}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            <Button
                                                style={{ color: "black" }}
                                                onClick={() => {
                                                    setOpenModal(true);
                                                    setCurrentTeacher(teacher);
                                                }}
                                            >
                                                Connect
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </div>
            <Modal show={openModal} size="md" onClose={onCloseModal} popup>
                <Modal.Header />
                <Modal.Body>
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            Send a message
                        </h3>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="message" value="Your Message" />
                            </div>
                            <TextInput
                                id="message"
                                type="text"
                                placeholder="Message"
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                required
                            />
                        </div>
                        <Button style={{ color: "black" }} onClick={handleSendMessage}>
                            Send
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ParentDashboard;
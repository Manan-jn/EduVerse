import React, { useEffect, useState, useContext } from "react";
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

    // Code for fetching mental health report
    const [mentalHealthReport, setMentalHealthReport] = useState(null);

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
                doc(firestore, "users", currentUser.uid),
                (doc) => {
                    setUser(doc.data());
                    setChildren(doc.data().childrenIds || []); // Ensure it's an array
                    setChildNames(doc.data().childrenNames || []); // Ensure it's an array
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

                newTimeLearnedTotal.push(docSnap.data()?.timeLearned || 0);
                newLecturesCompletedTotal.push(docSnap.data()?.lecturesCompleted || 0);
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
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                const existingArray = userData.childrenIds || [];
                const childNameArray = userData.childrenNames || [];

                if (!existingArray.includes(childId)) {
                    existingArray.push(childId);
                }
                if (!childNameArray.includes(childName)) {
                    childNameArray.push(childName);
                }

                await updateDoc(docRef, {
                    childrenIds: existingArray,
                    childrenNames: childNameArray,
                });
                setSuccessMsg("Added child");
            }
        } catch (error) {
            console.error("Error updating  children document:", error);
        }
    };

    return (
        <div>
            <h3>ParentDashboard</h3>
            <p>Welcome to the ParentDashboard!</p>

            {mentalHealthReport && (
                <div>
                    <h4>Mental Health Report:</h4>
                    <p>{mentalHealthReport}</p>
                </div>
            )}

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
    );
};

export default ParentDashboard;

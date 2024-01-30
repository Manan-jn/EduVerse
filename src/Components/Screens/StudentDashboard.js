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
import { useNavigate } from "react-router-dom";
import GoogleClassroomIntegration from "./ClassroomConnect";
import AudioPlayer from "./AudioPlayer";
import "./Home.css";
import { Button, Flex } from 'antd';
import { Alert, Space } from 'antd';
import NewsBot from './Bots/NewsBot';
import MentalHealthBot from "./Bots/MentalHealthBot";
import MathsBot from "./Bots/MathsBot";
import { Link } from 'react-router-dom';
import { Route } from 'react-router-dom';


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
            {/* <h3 style={{ color: "#4E7691" }}>Welcome to the student dashboard 🧑‍🎓</h3> */}
            {user && (
                <div className="student-dashboard-stats">
                    {/* <p>{user.email}</p>
                    <p>{user.uid}</p> */}
                    <Row gutter={16}>
                        {user.timeLearned && (
                            <Col span={12}>
                                <Statistic title="Hours Learned" value={user.timeLearned} />
                            </Col>
                        )}
                        {user.lecturesCompleted && (
                            <Col span={12}>
                                <Statistic
                                    title="Lectures Completed"
                                    value={user.lecturesCompleted}
                                />
                            </Col>
                        )}
                    </Row>
                </div>
            )}
            <div className="dashboard-classroom-morpheous-signimate">
                <div className="dashboard-classroom-morpheous">
                    <div className="dashboard-personalised"></div>
                    <div className="classroom-morpheous">
                        <div className="classrooms">
                            <div><h2 style={{ color: "#6CFBCE" }}>📝 Smart Learning Hub 📝 </h2></div>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <div className="digital-classroom">
                                    <h4 style={{ color: "#F9F871" }}>Explore Digital Classroom</h4>
                                    <Flex wrap="wrap" gap="small">
                                        <Button type="primary" onClick={handleDigital}>Visit Digital classroom ↗ </Button>
                                    </Flex>
                                    <p><i>To access the educational content prepared by GenAI and fact checked by the teachers, read the material and attempt the assignments to <b>improve your dashboard stats</b>!</i></p>

                                    <br></br>
                                    <img
                                        src="https://bold.expert/wp-content/uploads/2021/10/video7_digitalclassroom.png"  // Replace with your actual image URL
                                        alt="Description of your image"
                                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }}
                                    />
                                </div>
                                <div className="google-classroom">
                                    <GoogleClassroomIntegration />
                                </div>
                            </div>
                        </div>
                        <AudioPlayer />
                    </div>
                </div>
                <div className="ai-animator">
                    <center>
                        <h2 style={{ color: "#EDEEFF" }} >🪄 SignimateAI 🪄</h2>
                        <p><i>AI animation generator tool with sign language support. If you enjoy Khan Academy videos, try this out!</i></p>
                    </center>
                    <Alert
                        message="Usage Note"
                        description=" Currently OpenAI accepts 25 requests every 3 hours for GPT-3.5 Turbo. This means OpenAI will start rejecting some requests. There are two solutions: Use GPT-4, or use your own OpenAI API key."
                        type="info"
                        showIcon
                    />
                    <br></br>
                    <iframe
                        src="https://ai-content.streamlit.app/?embed=true"
                        height="700px"
                    ></iframe>
                </div>
            </div>
            <div className="bots-competitions-skills">
                <div className="bots-section">
                    <div>
                        <center>
                            <h2 style={{ color: "#6CFBCE" }}>🤖 Explore our chatbots! 🤖 </h2>
                            <p style={{ color: "#6CFBCE" }}><i>Type a "Hi", to get started with any of our bots!</i></p>
                        </center>
                    </div>
                    <div className="mental-health-bot">
                        <center>
                            <h3 style={{ color: "#F9F871" }}>Feeling stressed out?</h3>
                            <p><i>Hey, it's okay to feel that way! Talking it out to our bot might make you feel better!</i></p>
                            <Link to="/mental">
                                <Button type="primary">Chat here!</Button>
                            </Link>
                        </center>
                    </div>
                    <div className="other-bots">
                        <div className="bot">
                            <center>
                                <h4 style={{ color: "#FFBD68" }}>Quick News Bot</h4>
                                <Link to="/news">
                                    <Button type="primary">Explore Bot</Button>
                                </Link>
                            </center>
                        </div>
                        <div className="bot">
                            <center>
                                <h4 style={{ color: "#FFBD68" }}>MathsBot- Wolfram Alpha</h4>
                                <Link to="/maths">
                                    <Button type="primary">Explore Bot</Button>
                                </Link>
                            </center>
                        </div>
                    </div>
                </div>
                <df-messenger
                    intent="WELCOME"
                    chat-title="ReadAlongBot"
                    agent-id="f87ce02e-9c46-4949-b3f7-6790c5c85906"
                    language-code="en"
                ></df-messenger>
                <div className="skills-corner"></div>

                <div className="competitions"></div>
            </div>

        </div>
    );
};

export default StudentDashboard;

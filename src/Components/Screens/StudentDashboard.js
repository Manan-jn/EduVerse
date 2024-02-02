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
import { Col, Row, Statistic, ConfigProvider } from "antd";
import { useNavigate } from "react-router-dom";
import GoogleClassroomIntegration from "./ClassroomConnect";
import AudioPlayer from "./AudioPlayer";
import "./Home.css";
import { Button, Flex } from "antd";
import { Spin, Form, Input } from "antd";

import { Alert, Space } from "antd";
import NewsBot from "./Bots/NewsBot";
import MentalHealthBot from "./Bots/MentalHealthBot";
import MathsBot from "./Bots/MathsBot";
import { Link } from "react-router-dom";
import { Route } from "react-router-dom";
import axios from "axios";

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const uid = currentUser.uid;
  const navigate = useNavigate();
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const userDoc = doc(firestore, "students", currentUser.uid);
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

  useEffect(() => {
    const fetchTip = async () => {
      if (user) {
        const getData = {
          hours_learned: user.timeLearned,
          lectures_completed: user.lecturesCompleted,
          learning_streak: user.learningStreak,
        };
        console.log(getData);
        try {
          const getTip = await axios.post(
            "https://ai-tip.onrender.com/tipStudent",
            getData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setTip(getTip.data.tip);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchTip();
  }, []);

  const handleDigital = async () => {
    try {
      setLoading(true);
      // Get the current date and time
      const currentDate = new Date();
      const currentTime = currentDate.getTime();

      // Check if lastTimeAccessed is present and within the specified time range
      if (
        user &&
        user.lastTimeAccessed &&
        currentTime - user.lastTimeAccessed >= 24 * 60 * 60 * 1000 &&
        currentTime - user.lastTimeAccessed <= 48 * 60 * 60 * 1000
      ) {
        // If lastTimeAccessed is present and the time difference is within 24-48 hours
        // Update learning streak or add a new streak if it doesn't exist
        const updatedLearningStreak = user.learningStreak
          ? user.learningStreak + 1
          : 1;

        // Update user document in the database
        const userDoc = doc(firestore, "students", currentUser.uid);
        await updateDoc(userDoc, {
          lastTimeAccessed: currentTime,
          learningStreak: updatedLearningStreak,
        });
        console.log("Learning streak updated");
      } else {
        // If lastTimeAccessed is not present or the time difference is outside the specified range
        // You can handle this case as per your requirements
        const updatedLearningStreak = 1;
        const userDoc = doc(firestore, "students", currentUser.uid);
        await updateDoc(userDoc, {
          lastTimeAccessed: currentTime,
          learningStreak: updatedLearningStreak,
        });
        console.log("Learning streak updated");
        setLoading(false);
        navigate(`/digital`);
      }
    } catch (error) {
      console.error("Error updating learning streak:", error);
    }
  };

  return (
    <div>
      <div className="dashboard-classroom-morpheous-signimate">
        <div className="dashboard-classroom-morpheous">
          <div className="dashboard-personalised">
            <div>
              {tip && (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Alert
                    message="Tip"
                    description={tip}
                    type="success"
                    showIcon
                  />
                </div>
              )}
              {user && user.uid && (
                <ConfigProvider
                  theme={{
                    token: {
                      colorText: "white",
                    },
                  }}
                >
                  <Form>
                    <Form.Item label="Unique UID">
                      <Input
                        type="text"
                        value={user.uid}
                        style={{ color: "black" }}
                      />
                    </Form.Item>
                  </Form>
                </ConfigProvider>
              )}
              {loading ? (
                <div
                  className="text-center"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Spin />
                </div>
              ) : (
                <div>
                  <div style={{ width: "100%" }}>
                    <ConfigProvider
                      theme={{
                        token: {
                          colorText: "white",
                          colorTextDescription: "white",
                        },
                      }}
                    >
                      <Row gutter={20} style={{ color: "white" }}>
                        {user && user.timeLearned && (
                          <Col span={8}>
                            <Statistic
                              title="Hours Learned"
                              value={user.timeLearned}
                              className="white-text"
                            />
                          </Col>
                        )}
                        {user && user.lecturesCompleted && (
                          <Col span={8}>
                            <Statistic
                              title="Lectures Completed"
                              value={user.lecturesCompleted}
                            />
                          </Col>
                        )}
                        {user && user.learningStreak && (
                          <Col span={8}>
                            <Statistic
                              title="Learning Streak"
                              value={user.learningStreak}
                            />
                          </Col>
                        )}
                      </Row>
                    </ConfigProvider>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="classroom-morpheous">
            <div className="classrooms">
              <div>
                <h2 style={{ color: "#6CFBCE" }}>📝 Smart Learning Hub 📝 </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div className="digital-classroom">
                  <h4 style={{ color: "#F9F871" }}>
                    Explore Digital Classroom
                  </h4>
                  <Flex wrap="wrap" gap="small">
                    <Button type="primary" onClick={handleDigital}>
                      Visit Digital classroom ↗{" "}
                    </Button>
                  </Flex>
                  <p>
                    <i>
                      To access the educational content prepared by GenAI and
                      fact checked by the teachers, read the material and
                      attempt the assignments to{" "}
                      <b>improve your dashboard stats</b>!
                    </i>
                  </p>

                  <br></br>
                  <img
                    src="https://bold.expert/wp-content/uploads/2021/10/video7_digitalclassroom.png" // Replace with your actual image URL
                    alt="Description of your image"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "10px",
                    }}
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
            <h2 style={{ color: "#EDEEFF" }}>🪄 SignimateAI 🪄</h2>
            <p>
              <i>
                AI animation generator tool with sign language support. If you
                enjoy Khan Academy videos, try this out!
              </i>
            </p>
          </center>
          <Alert
            message="Usage Note"
            description=" Currently OpenAI accepts 25 requests every 3 hours for GPT-3.5 Turbo. This means OpenAI will start rejecting some requests. There are two solutions: Use GPT-4, or use your own OpenAI API key."
            type="info"
            showIcon
          />
          <br></br>
          <iframe
            src="https://ai-animator.streamlit.app/?embed=true"
            height="700px"
          ></iframe>
        </div>
      </div>
      <div className="bots-competitions-skills">
        <div className="bots-section">
          <div>
            <center>
              <h2 style={{ color: "#6CFBCE" }}>🤖 Explore our chatbots! 🤖 </h2>
              <p style={{ color: "#6CFBCE" }}>
                <i>Type a "Hi", to get started with any of our bots!</i>
              </p>
            </center>
          </div>
          <div className="mental-health-bot">
            <center>
              <h3 style={{ color: "#F9F871" }}>Feeling stressed out?</h3>
              <p>
                <i>
                  Hey, it's okay to feel that way! Talking it out to our bot
                  might make you feel better!
                </i>
              </p>
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

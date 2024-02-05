import React, { useEffect, useState, useContext, useRef } from "react";
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
import { Col, Row, Statistic, ConfigProvider, Card } from "antd";
import { useNavigate } from "react-router-dom";
import GoogleClassroomIntegration from "./ClassroomConnect";
import AudioPlayer from "./AudioPlayer";
import "./Home.css";
import { Button, Flex } from "antd";
import { Spin, Form, Input, Tour } from "antd";
import Quiz from "./../../assets/images/quiz.jpeg";
import rewards from "./../../assets/images/rewards.png";
import python from "./../../assets/images/python.png";
import algebra from "./../../assets/images/algebra.jpeg";
import organic from "./../../assets/images/organic.jpeg";
import chess from "./../../assets/images/chess_img.jpeg";

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
  const [openTour, setOpenTour] = useState(true);

  const tipRef = useRef(null);
  const statsRef = useRef(null);
  const digitalClassRef = useRef(null);
  const googleClassRef = useRef(null);
  const morpAiRef = useRef(null);
  const signAiRef = useRef(null);
  const chatBotsRef = useRef(null);
  const readAlongBotRef = useRef(null);
  const uidRef = useRef(null);

  const steps = [
    {
      title: "UID",
      description: "Send it your parent to keep the track of your progress",
      target: () => uidRef.current,
    },
    {
      title: "Personalised Tip",
      description:
        "See your personalised tip based on the Hours Learned, Lectures Completed and Learning Streak",
      target: () => tipRef.current,
    },
    {
      title: "Statistics of your Learnings",
      description:
        "See your statistics of the hours learned, lectures completed and learning streak based on the lectures completed and time learned",
      target: () => statsRef.current,
    },
    {
      title: "Explore Digital Classroom",
      description:
        "Study and learn from the interactive content uploaded by your teachers",
      target: () => digitalClassRef.current,
    },
    {
      title: "Connect Google Classroom",
      description:
        "Connect and access your Google Classroom to view the assignments and study materials",
      target: () => googleClassRef.current,
    },
    {
      title: "Morpheus AI",
      description:
        "Harnessing the potential of REM waves, EduVerse generates audio stimuli for nighttime learning, providing a unique and immersive educational experience.        ",
      target: () => morpAiRef.current,
    },
    {
      title: "Signimate AI",
      description:
        "generate animated videos with sign language support from any text prompt, making learning accessible to all. ",
      target: () => signAiRef.current,
    },
    {
      title: "ChatBots",
      description:
        "Chat with our bots to get the latest news, help through mental support bot and help with your maths problems",
      target: () => chatBotsRef.current,
    },
    {
      title: "Read Along Bot",
      description:
        "Read along with the bot to improve your reading and comprehension skills",
      target: () => readAlongBotRef.current,
    },
  ];

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
  }, [user]);

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
      <Tour open={openTour} steps={steps} onClose={() => setOpenTour(false)} />
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
                  ref={tipRef}
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
                <div ref={uidRef}>
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
                </div>
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
                  <div style={{ width: "100%" }} ref={statsRef}>
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
                <div className="digital-classroom" ref={digitalClassRef}>
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
                <div className="google-classroom" ref={googleClassRef}>
                  <GoogleClassroomIntegration />
                </div>
              </div>
            </div>
            <AudioPlayer ref={morpAiRef} />
          </div>
        </div>
        <div className="ai-animator" ref={signAiRef}>
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
        <div className="bots-section" ref={chatBotsRef}>
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
        <div>
          <df-messenger
            intent="WELCOME"
            chat-title="ReadAlongBot"
            agent-id="f87ce02e-9c46-4949-b3f7-6790c5c85906"
            language-code="en"
          ></df-messenger>
        </div>
        <div className="skills-corner">
          <h2>Skills Corner</h2>
          <Card
            style={{
              backgroundColor: "#424464",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "120px",
            }}
          >
            <img
              src={python}
              alt="python"
              style={{ height: "25px", width: "25px" }}
            />
            <a href="https://www.youtube.com/playlist?list=PLTjRvDozrdlxj5wgH4qkvwSOdHLOCx10f">
              <h3>Python Tutorials</h3>
            </a>
          </Card>
          <Card
            style={{
              marginTop: "10px",
              backgroundColor: "#424464",
              height: "120px",
            }}
          >
            <img
              src={chess}
              alt="python"
              style={{ height: "25px", width: "25px" }}
            />
            <a href="https://www.youtube.com/playlist?list=PLQKBpQZcRycrvUUxLdVmlfMChJS0S5Zw0">
              <h3>Chess Tutorials</h3>
            </a>
          </Card>
          <Card
            style={{
              marginTop: "10px",
              backgroundColor: "#424464",
              height: "120px",
            }}
          >
            <img
              src={algebra}
              alt="python"
              style={{ height: "25px", width: "25px" }}
            />
            <a href="https://www.youtube.com/playlist?list=PL7AF1C14AF1B05894">
              <h3>Algebra Tutorials</h3>
            </a>
          </Card>
          <Card
            style={{
              marginTop: "10px",
              backgroundColor: "#424464",
              height: "120px",
            }}
          >
            <img
              src={organic}
              alt="python"
              style={{ height: "25px", width: "25px" }}
            />
            <a href="https://www.youtube.com/playlist?list=PL7AF1C14AF1B05894">
              <h3>Organic Chemistry Tutorials</h3>
            </a>
          </Card>
        </div>

        <div className="competitions">
          <img src={rewards} alt="rewards" />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

import React from "react";
import { useEffect, useState, useContext } from "react";
import { auth } from "../../firebase-config";
import { firestore } from "../../firebase-config";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { AuthContext } from "../../context/AuthContext";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { FallingLines } from "react-loader-spinner";
import GradingAssistant from "./GradingAssistant";

import {
  Col,
  Row,
  Statistic,
  Alert,
  Card,
  Modal,
  Form,
  Input,
  Upload,
  Button,
  ConfigProvider,
  Steps,
  Badge,
  Avatar,
} from "antd";
import axios from "axios";
import {
  addDoc,
  collection,
  setDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  query,
  getDocs,
} from "firebase/firestore";
import { MessageTwoTone } from "@ant-design/icons";
import { Bar } from "react-chartjs-2";
import { UploadOutlined } from "@ant-design/icons";
import { Chart } from "chart.js/auto";
import { FileInput, Label, Spinner } from "flowbite-react";

const TeacherDashboard = () => {
  const [user, setUser] = useState({});
  const [file, setFile] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const [trained, setTrained] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = React.useState(null);
  const [pdfData, setPdfData] = React.useState();
  const uid = currentUser.uid;
  const [slideId, setSlideId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [timeToRead, setTimeToRead] = useState(0);
  const [subject, setSubject] = useState("biology");
  const [successMsg, setSuccessMsg] = useState("");

  const [uploadedSlides, setUploadedSlides] = useState([]);
  const [totalHoursObt, setTotalHoursObt] = useState(0);
  const [learningStreakData, setLearningStreakData] = useState({});
  const [messagesReceived, setMessagesReceived] = useState([]);
  const [alertNot, setAlertNot] = useState(false);
  const [trainingMsg, setTrainingMsg] = useState("Training in progress...");
  const [currentStep, setCurrentStep] = useState(1);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  const [tip, setTip] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    setFile(file);
  };

  useEffect(() => {
    const getUser = () => {
      const unsub = onSnapshot(
        doc(firestore, "teachers", currentUser.uid),
        (doc) => {
          setUser(doc.data());
          if (doc.data().uploadedSlides) {
            setUploadedSlides(doc.data().uploadedSlides);
          }
          if (doc.data().messagesRec) {
            setMessagesReceived(doc.data().messagesRec);
          }
          console.log(doc.data());
        }
      );
      return () => {
        unsub();
      };
    };
    currentUser.uid && getUser();
  }, [currentUser.uid]);

  useEffect(() => {
    const fetchTip = async () => {
      if (user) {
        const getData = {
          slides_uploaded: user.slidesTotal,
          total_hours_learned: totalHoursObt,
        };
        try {
          const getTip = await axios.post(
            "https://ai-tip.onrender.com/tipTeacher",
            getData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setTip(getTip.data.tip);
        } catch (e) {
          console.log(e);
          setTip("You are doing great! Its just GPT Limit Exceeded");
        }
      }
    };
    fetchTip();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(firestore, "students"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => doc.data());
        const learningStreakCounts = {};

        data.forEach((student) => {
          const learningStreak = student.learningStreak;

          // Update the count based on the learning streak range
          if (learningStreak) {
            const range = Math.floor(learningStreak);
            learningStreakCounts[range] =
              (learningStreakCounts[range] || 0) + 1;
          }
        });

        setLearningStreakData(learningStreakCounts);
        updateChart(learningStreakCounts);
      });
      return () => {
        // Cleanup (unsubscribe) when the component is unmounted
        unsubscribe();
      };
    };
    fetchData();
  }, []);

  const updateChart = (data) => {
    const ctx = document.getElementById("learningStreakChart").getContext("2d");
    const existingChart = Chart.getChart(ctx);

    // Destroy existing chart if it exists
    if (existingChart) {
      existingChart.destroy();
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Number of Students",
            data: Object.values(data),
            backgroundColor: "white",
            borderColor: "black",
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false, // Disable aspect ratio to allow custom sizing
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Learning Streak Range",
              color: "white",
            },
          },
          y: {
            title: {
              display: true,
              text: "Number of Students",
              color: "white",
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      // Loop through each slideId in uploadedSlides
      if (uploadedSlides !== undefined) {
        for (const slideId of uploadedSlides) {
          const docRef = doc(firestore, "slides", slideId);
          let totalHoursFromDoc = 0;
          try {
            // Fetch document data
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              // Assuming totalHours is a field in your document
              totalHoursFromDoc = docSnap.data().totalHours;
              // Update global variable with total hours
              // console.log("totalHoursFromDoc", totalHoursFromDoc);
              if (totalHoursFromDoc !== undefined) {
                const updatedTotalHours =
                  parseInt(totalHoursObt, 10) + parseInt(totalHoursFromDoc);
                setTotalHoursObt(updatedTotalHours);
              }
            } else {
              console.log("Document not found for slideId:", slideId);
            }
          } catch (error) {
            console.error("Error fetching data for slideId:", slideId, error);
          }
        }
      }
    };
    fetchData();
  }, [uploadedSlides]);

  const getSlides = async () => {
    const res = await fetch(`https://ai-classroom.onrender.com/slides`, {
      method: "GET",
    });
    console.log(res);
    setCurrentStep(2);
    if (res.ok) {
      const data = await res.json();
      setSlideId(data);
      const storage = getStorage();
      const pathReference = ref(storage, `slides/${data}.md`);
      const url = await getDownloadURL(pathReference);
      console.log(url);
      const fetchedData = await fetch(url);
      const text = await fetchedData.text();
      console.log(text);
      const apiEndpoint = "https://markdown-pdf.onrender.com/getpdf";

      const postData = {
        markdownContent: text,
        slideNum: data, // Include the data in the request
      };

      const response = await axios.post(apiEndpoint, postData, {
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
      });
      // Handle the response from the backend
      console.log("Response from backend:", response.data);

      console.log(fetchedData);
      console.log(data); // Assuming the API returns a JSON string
      const getData = {
        slideNum: data, // Include the data in the request
      };
      const getResp = await axios.post(
        "https://markdown-pdf.onrender.com/getOnePdf",
        getData,
        {
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
        }
      );
      setPdfData(getResp.data.pdf.data.data);
      console.log(getResp);
      console.log("Responseeee" + getResp.data.pdf.data.data);
      if (getResp.data.pdf.data.data) {
        const bytes = getResp.data.pdf.data.data;
        // console.log("bytes" + bytes);
        let len = bytes.length;
        let out = new Uint8Array(len);

        while (len--) {
          // out[len] = bytes.charCodeAt(len);
          out[len] = bytes[len];
        }
        // const base64EncodedStr = btoa(getResp.data.pdf.data.data);
        const blob = new Blob([out], { type: "application/pdf" });
        const temp = URL.createObjectURL(blob);
        setPdfUrl(temp);
        setModalOpen(true);
      }
    } else {
      console.error(`Error: ${res.status} - ${res.statusText}`);
    }
    console.log("Fetching slides" + res);
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);
    console.log("TRYING TO UPLOAD");
    const res = await fetch(`https://ai-classroom.onrender.com/uploadfile`, {
      method: "POST",
      body: formData,
    });
    console.log(res);
    console.log("Here");
    if (res.status !== 200) {
      console.error(res);
      // setUploaded(false);
      return false;
    } else {
      // setUploaded(true);
      return true;
    }
  };
  const train = async () => {
    console.log("start training!");
    if (file) {
      try {
        setLoading(true);
        const uploaded = await uploadFile(file);
        setTrainingMsg("File uploaded...");
        setCurrentStep(1);
        setProgress(20);
        console.log("uploaded" + uploaded);
        if (uploaded) {
          console.log("uploaded");
          const slides = await getSlides();
          setTrainingMsg("Generating Slides...");
          setCurrentStep(3);
          console.log(slides);
          setProgress(60);
          if (slides) {
            setTrained(true);
          }
        } else {
          console.log("shit");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };
  const uploadInfo = async () => {
    const docRef = doc(firestore, "teachers", uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const existingArray = userData.uploadedSlides || [];
        let slidesCount = userData.slidesTotal || 0;

        if (!existingArray.includes(slideId)) {
          existingArray.push(slideId);
        }
        slidesCount = slidesCount + 1;
        await updateDoc(docRef, {
          uploadedSlides: existingArray,
          slidesTotal: slidesCount,
        });
        console.log("Updated");
      }
    } catch (error) {
      console.log("error", error);
    }
    await setDoc(doc(firestore, "slides", slideId), {
      slideID: slideId,
      title: title,
      comment: comment,
      subject: subject,
      time: timeToRead,
    })
      .then(() => {
        setSuccessMsg("Uploaded the slide");
        setAlertNot(true);
        setModalOpen(false);
        setComment("");
        setTitle("");
        setTimeToRead(0);
        setSubject("biology");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
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

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          // justifyContent: "space-between",
        }}
      >
        {/* DIV FOR SHOWING THE STATS */}
        <div
          style={{ marginTop: "40px", width: "45%" }}
          className="dashboard-personalised"
        >
          {tip && (
            <div style={{ marginBottom: "15px" }}>
              <Alert message="Tip" description={tip} type="success" showIcon />
            </div>
          )}
          <ConfigProvider
            theme={{
              token: {
                colorText: "white",
                colorTextDescription: "white",
              },
            }}
          >
            <Row gutter={20}>
              {user && user.slidesTotal && (
                <Col span={12}>
                  <Statistic title="Slides Uploaded" value={user.slidesTotal} />
                </Col>
              )}
              {user && totalHoursObt !== undefined && (
                <Col span={12}>
                  <Statistic
                    title="Total Hours Learned"
                    value={totalHoursObt}
                  />
                </Col>
              )}
            </Row>
          </ConfigProvider>
          <h3>Learning Streak Chart</h3>
          <div style={{ width: "90%", height: "300px", marginTop: "20px" }}>
            <canvas
              id="learningStreakChart"
              width="100px"
              height="50px"
            ></canvas>
          </div>
        </div>

        {/* DIV FOR GRADING ASSISTANT AND MESSAGES */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "60%",
            alignItems: "flex-end",
          }}
        >
          <Badge count={messagesReceived && messagesReceived.length}>
            <Avatar
              size="large"
              onClick={() => {
                setShowMessagesModal(true);
              }}
            >
              <MessageTwoTone />
            </Avatar>
          </Badge>
          <div className="dashboard-personalised">
            <GradingAssistant></GradingAssistant>
          </div>

          <div
            // style={{
            //   height: "90%",
            //   backgroundColor: "#3f3f46",
            //   borderRadius: "10px",
            //   padding: "2%",
            //   width: "90%",
            //   margin: "1.5%",
            //   marginTop: "2.5%",
            //   display: "flex",
            //   flexDirection: "column",
            //   alignItems: "center",
            // }}
            className="dashboard-personalised"
          >
            <p>
              Digital Classroom
              <p>
                Upload a text file and convert it into simplified content
                through GenAI
              </p>
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {!loading && (
                <div>
                  <div style={{ marginRight: "10px" }}>
                    <Label
                      htmlFor="file-upload-helper-text"
                      value="Upload file"
                    />
                  </div>
                  <FileInput
                    id="file-upload-helper-text"
                    helperText="TXT File"
                    style={{ alignItems: "center" }}
                    onChange={handleChange}
                  />
                </div>
              )}
              {!loading && (
                <Button
                  type="primary"
                  style={{ marginLeft: "10px" }}
                  onClick={train}
                >
                  Train
                </Button>
              )}
              {loading && (
                <ConfigProvider
                  theme={{
                    token: {
                      colorText: "white",
                      colorTextDescription: "white",
                      colorIcon: "white",
                    },
                  }}
                >
                  <Steps
                    size="small"
                    current={currentStep}
                    items={[
                      {
                        title: "Uploaded",
                      },
                      {
                        title: "Training",
                      },
                      {
                        title: "Getting Slides",
                      },
                    ]}
                  />
                </ConfigProvider>
              )}
              {/* {loading && (
              <Button>
                <Spinner aria-label="loading" size="sm" />
                <span className="pl-3" style={{ color: "black" }}>
                  {trainingMsg}
                </span>
              </Button>
            )} */}
            </div>
          </div>
        </div>
      </div>
      <div>
        <Modal
          title="Messages from Parents"
          open={showMessagesModal}
          onCancel={() => setShowMessagesModal(false)}
          footer=""
        >
          {messagesReceived && messagesReceived.length > 0 && (
            <Card
              // title="Messages from Parents"
              bordered={true}
              style={{ width: 300 }}
            >
              <div>
                <ul>
                  {messagesReceived.map((msg, index) => (
                    <li key={index}>
                      <div>
                        <div></div>
                        <div>
                          <p>Sender Name: {msg.sender}</p>
                          <p>{msg.message}</p>
                          {msg.phone && <p>Contact Number: {msg.phone}</p>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </Modal>
      </div>
      <div>
        <Modal title="Upload the Slides" open={modalOpen} footer="">
          <div>
            <Form>
              <Form.Item
                name="Title"
                label="Title"
                rules={[{ required: true, message: "Please input!" }]}
              >
                <input
                  type="text"
                  placeholder=""
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item
                name="Subject"
                label="Subject"
                rules={[{ required: true, message: "Please input!" }]}
              >
                <select
                  name="subject"
                  value={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                  }}
                >
                  <option value="biology">biology</option>
                  <option value="chemistry">chemistry</option>
                  <option value="physics">physics</option>
                  <option value="maths">maths</option>
                </select>
              </Form.Item>
              <Form.Item
                name="Time to read"
                label="Time to complete (Hrs)"
                rules={[{ required: true, message: "Please input!" }]}
              >
                <input
                  type="number"
                  placeholder="Time to read in hrs"
                  onChange={(e) => {
                    setTimeToRead(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item
                name="Comment/ Additional Info"
                label="Comment/ Additional Info"
                rules={[{ required: true, message: "Please input!" }]}
              >
                <input
                  type="text"
                  placeholder="Add comment"
                  onChange={(e) => setComment(e.target.value)}
                />
              </Form.Item>
            </Form>
            <Button onClick={uploadInfo}>Upload</Button>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherDashboard;

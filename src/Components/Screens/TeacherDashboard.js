import React from "react";
import { useEffect, useState, useContext } from "react";
import { auth } from "../../firebase-config";
import { firestore } from "../../firebase-config";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { AuthContext } from "../../context/AuthContext";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { FallingLines } from "react-loader-spinner";
import { Col, Row, Statistic } from "antd";
import NavBar from "./NavBar";
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
import { Bar } from "react-chartjs-2";
import { Chart } from "chart.js/auto";
import { FileInput, Label, Card, Alert, Button, Spinner } from "flowbite-react";

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
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
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
            },
          },
          y: {
            title: {
              display: true,
              text: "Number of Students",
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
              if (totalHoursFromDoc !== NaN) {
                setTotalHoursObt(totalHoursObt + totalHoursFromDoc);
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
        setProgress(20);
        console.log("uploaded" + uploaded);
        if (uploaded) {
          console.log("uploaded");
          const slides = await getSlides();
          setTrainingMsg("Generating Slides...");
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
        let slidesCount = userData.slidesTotal || 1;

        if (!existingArray.includes(slideId)) {
          existingArray.push(slideId);
        }

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
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div>
      <NavBar />
      {alertNot && (
        <Alert
          color="warning"
          withBorderAccent
          onDismiss={() => {
            setAlertNot(false);
            setSuccessMsg("");
          }}
        >
          <span>
            <span className="font-medium">Success Message</span> {successMsg}
          </span>
        </Alert>
      )}
      <div>
        <div style={{ width: "50%" }}>
          <div>
            <Label htmlFor="file-upload-helper-text" value="Upload file" />
          </div>
          <FileInput
            id="file-upload-helper-text"
            helperText="TXT File."
            onChange={handleChange}
          />
        </div>
        <button onClick={train}>Train</button>
        {/* <input type="file" onChange={handleChange} /> */}
        {/* <button onClick={train}>Train</button> */}
        <div>
          {loading && (
            <Button>
              <Spinner aria-label="loading" size="sm" />
              <span className="pl-3" style={{ color: "black" }}>
                {trainingMsg}
              </span>
            </Button>
          )}
        </div>
        {successMsg && <p>{successMsg}</p>}
        <div>
          {messagesReceived && messagesReceived.length > 0 && (
            <Card className="max-w-sm">
              <div className="mb-4 flex aitems-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  Messages From Parents
                </h5>
              </div>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {messagesReceived.map((msg, index) => (
                    <li key={index} className="py-3 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="shrink-0"></div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            Sender Name: {msg.sender}
                          </p>
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>
        <div style={{ width: "100%" }}>
          <Row gutter={20}>
            {user && user.slidesTotal && (
              <Col span={12}>
                <Statistic title="Slides Uploaded" value={user.slidesTotal} />
              </Col>
            )}
            {totalHoursObt !== NaN && totalHoursObt !== 0 && (
              <Col span={12}>
                <Statistic title="Total Hours Learned" value={totalHoursObt} />
              </Col>
            )}
          </Row>
        </div>
        <div style={{ width: "50%", height: "350px" }}>
          <h2>Learning Streak Chart</h2>
          <canvas id="learningStreakChart" width="100px" height="50px"></canvas>
        </div>

        {pdfUrl && (
          <div>
            <input
              type="text"
              placeholder="Title"
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
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
            <input
              type="number"
              placeholder="Time to read in hrs"
              onChange={(e) => {
                setTimeToRead(e.target.value);
              }}
            />
            <input
              type="text"
              placeholder="Add comment"
              onChange={(e) => setComment(e.target.value)}
            />
            <button onClick={uploadInfo}>Upload</button>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} />
            </Worker>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

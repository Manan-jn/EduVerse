import React from "react";
import { useEffect, useState, useContext } from "react";
import { auth } from "../../firebase-config";
import { firestore } from "../../firebase-config";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { AuthContext } from "../../context/AuthContext";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { FallingLines } from "react-loader-spinner";
import axios from "axios";
import {
  addDoc,
  collection,
  setDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

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
  const [timeToRead, setTimeToRead] = useState("");
  const [subject, setSubject] = useState("biology");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
    setFile(file);
  };

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
      const apiEndpoint = "http://localhost:3001/getpdf";

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
        "http://localhost:3001/getOnePdf",
        getData,
        {
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
        }
      );
      setPdfData(getResp.data.pdf.data.data);

      // console.log("Responseeee" + getResp.data.pdf.data.data);
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
        setProgress(20);
        console.log("uploaded" + uploaded);
        if (uploaded) {
          console.log("uploaded");
          const slides = await getSlides();
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
    // const docRef = await addDoc(collection(firestore, "slides"), {
    //   slideID: slideId,
    //   title: title,
    //   comment: comment,
    //   subject: subject,
    //   time: timeToRead,
    // })
    //   .then(() => {
    //     setSuccessMsg("Uploaded");
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });
    await setDoc(doc(firestore, "slides", slideId), {
      slideID: slideId,
      title: title,
      comment: comment,
      subject: subject,
      time: timeToRead,
      completed: false,
    })
      .then(() => {
        setSuccessMsg("Uploaded");
      })
      .catch((e) => {
        console.log(e);
      });
  };
  return (
    <div>
      Teacher Dashboard
      <div>
        <input type="file" onChange={handleChange} />
        <button onClick={train}>Train</button>
        <div>
          {loading && (
            <FallingLines
              color="#4fa94d"
              width="100"
              visible={true}
              ariaLabel="falling-circles-loading"
            />
          )}
        </div>
        {successMsg && <p>{successMsg}</p>}
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

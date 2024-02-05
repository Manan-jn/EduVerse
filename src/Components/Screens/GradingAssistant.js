// GradingAssistant.js
import React, { useState } from "react";
import axios from "axios";
import { Spin, Button, Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UploadOutlined } from "@ant-design/icons";

function GradingAssistant() {
  const [quizFile, setQuizFile] = useState(null);
  const [answerKeyFile, setAnswerKeyFile] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event, setFile) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("quiz_file", quizFile);
      formData.append("answer_key_file", answerKeyFile);
      formData.append("student_answers", studentAnswers);

      const response = await axios.post(
        "https://grading-ocr.onrender.com/get_student_score/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting files:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <h1>Quiz Grader</h1>
      <Card style={{ backgroundColor: "#424464" }}>
        <p style={{ color: "white" }}>Quiz File/ Assignment File</p>
        <Button icon={<UploadOutlined />} type="primary">
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setQuizFile)}
          />
        </Button>
      </Card>
      <Card style={{ backgroundColor: "#424464", marginTop: "10px" }}>
        <p style={{ color: "white" }}>Answer Key File</p>
        <Button icon={<UploadOutlined />} type="primary">
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setAnswerKeyFile)}
          />
        </Button>
      </Card>
      <Card
        style={{
          backgroundColor: "#424464",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <p style={{ color: "white" }}>Student File</p>
        <Button icon={<UploadOutlined />} type="primary">
          <input
            type="file"
            onChange={(e) => handleFileUpload(e, setStudentAnswers)}
          />
        </Button>
      </Card>
      {loading && <Spin />}
      {!loading && (
        <Button type="primary" onClick={handleSubmit}>
          Submit
        </Button>
      )}
      {result && (
        <div>
          <h2>Result:</h2>
          <div style={{ whiteSpace: "pre-wrap" }}>{result.student_score}</div>
        </div>
      )}
    </div>
  );
}

export default GradingAssistant;

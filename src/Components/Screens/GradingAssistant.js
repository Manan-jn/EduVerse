// GradingAssistant.js
import React, { useState } from "react";
import axios from "axios";

function GradingAssistant() {
  const [quizFile, setQuizFile] = useState(null);
  const [answerKeyFile, setAnswerKeyFile] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileUpload = (event, setFile) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const handleSubmit = async () => {
    try {
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
      <p>Quiz File/ Assignment File</p>
      <input type="file" onChange={(e) => handleFileUpload(e, setQuizFile)} />
      <p>Answer File</p>

      <input
        type="file"
        onChange={(e) => handleFileUpload(e, setAnswerKeyFile)}
      />
      <p>Student File</p>

      <input
        type="file"
        onChange={(e) => handleFileUpload(e, setStudentAnswers)}
      />

      <button onClick={handleSubmit}>Submit</button>

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

import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Radio, Space, Tabs } from "antd";
import { AuthContext } from "../../context/AuthContext";
import { doc, getDoc, onSnapshot, query, collection } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import PdfView from "./PdfView";
import { Spin, Typography } from "antd";
const { Title } = Typography;

const DigitalClassroom = () => {
  const [pdfUrl, setPdfUrl] = useState();
  const [pdfName, setPdfName] = useState();
  const [dataInfo, setDataInfo] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resul = async () => {
      await axios
        .get("https://markdown-pdf.onrender.com/getpdf")
        .then((res) => {
          const pdfData = res.data;
          // console.log("pdf data", pdfData);
          const pdfUrls = [];
          const pdfNames = [];
          pdfData.forEach((item) => {
            const bytes = item.pdf.data.data;
            const name = item.name;
            console.log("name", name);
            pdfNames.push(name);

            let len = bytes.length;
            let out = new Uint8Array(len);

            while (len--) {
              out[len] = bytes[len];
            }

            const blob = new Blob([out], { type: "application/pdf" });
            const temp = URL.createObjectURL(blob);
            pdfUrls.push(temp);
          });
          setPdfUrl(pdfUrls);
          setPdfName(pdfNames);
        });
    };
    resul();
    console.log("DigitalClassroom");
  }, []);

  useEffect(() => {
    const getFetch = async (name) => {
      const docRef = doc(firestore, "slides", name);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    };

    const resul = async () => {
      // Check if pdfName is defined
      if (pdfName) {
        const fetchData = await Promise.all(
          pdfName.map(async (name) => {
            const data = await getFetch(name);
            return data;
          })
        );
        console.log("data", fetchData);
        setDataInfo(fetchData);
      }
    };
    resul();
    setLoading(false);
  }, [pdfName]);

  const tabs =
    Array.isArray(pdfUrl) && Array.isArray(dataInfo)
      ? pdfUrl.map((url, i) => {
          const id = String(i + 1);
          return {
            label: dataInfo[i].title,
            key: id,
            children: <PdfView pdfUrl={url} dataIn={dataInfo[i]} />,
          };
        })
      : [];

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <Title level={2}>Digital Classroom</Title>
        {loading && (
          <Spin tip="Loading" size="large">
            <div className="content" />
          </Spin>
        )}
        <Tabs tabPosition="left" items={tabs} />
      </div>
    </div>
  );
};

export default DigitalClassroom;

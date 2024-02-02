import React, { useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import { Alert, Space } from "antd";
import "./Home.css";
import { Flex, Input } from "antd";
import { Button } from "antd";
import Marquee from "react-fast-marquee";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const AudioPlayer = () => {
  const [topic, setTopic] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateAudio = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://nightrem-mx647o6feq-uc.a.run.app/post_audio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic }),
        }
      );

      if (response.ok) {
        console.log("Audio generated successfully");
        setLoading(false);
        setAudioSrc(
          "https://nightrem-mx647o6feq-uc.a.run.app/get-audio/output_with_music.wav"
        );
      } else {
        console.error("Error generating audio");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="morpheusai">
      <center>
        <h2 style={{ color: "#EDEEFF" }}>🪄 MorpheusAI 🪄</h2>
        <p>
          <i>
            Uses AI to turn idle nighttime hours into a unique learning
            opportunity using auditory stimuli.
          </i>
        </p>
      </center>

      <Alert
        message="Usage Note"
        description="The free instance of API supports limited generation of audio. Please use this feature only 3 times, afterwards the API Keys have to be replaced."
        type="info"
        showIcon
      />
      <form>
        <div className="mb-3">
          <br></br>
          <label htmlFor="topic" className="form-label">
            Enter a Topic:
          </label>
          <br></br>
          <Input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            placeholder="eg: history of taj mahal"
          />
        </div>
        <div>
          <br></br>
          {!loading && (
            <Button type="primary" onClick={handleGenerateAudio}>
              {" "}
              Generate{" "}
            </Button>
          )}
          {loading && (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          )}
        </div>
      </form>
      <br></br>

      <Alert
        banner
        message={
          <Marquee pauseOnHover gradient={false}>
            Please DONT press the button more than once. This will take 3-4
            minutes...
          </Marquee>
        }
      />
      {audioSrc && <ReactAudioPlayer src={audioSrc} autoPlay controls />}
    </div>
  );
};

export default AudioPlayer;

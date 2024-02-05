import React from "react";
import { useEffect, useRef, useState } from "react";
import "./Home.css";
import { Tour, Alert } from "antd";

const CommunityDashboard = () => {
  const [openTour, setOpenTour] = useState(true);
  const botRef = useRef();
  const steps = [
    {
      title: "ChatBot",
      description:
        "See the importance of your role whether you are a community member or a govt member",
      target: () => botRef.current,
    },
  ];
  return (
    <div>
      <Alert
        message="Usage Note"
        description="The dialogflow web integration has a timeout limit of 5s so try refreshing the site once/twice incase the bot responds with an [empty response]."
        type="info"
        showIcon
      />
      <div className="bot-iframe" ref={botRef}>
        <Tour
          open={openTour}
          steps={steps}
          onClose={() => setOpenTour(false)}
        />
        <iframe
          width="350"
          height="630"
          allow="microphone;"
          src="https://console.dialogflow.com/api-client/demo/embedded/952b9238-629c-49e8-91da-49fcaeb7ad4c"
        ></iframe>
      </div>
    </div>
  );
};

export default CommunityDashboard;

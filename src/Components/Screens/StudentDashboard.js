import React, { useEffect, useState } from "react";
import { auth } from "../../firebase-config";
import GoogleClassroomIntegration from "./ClassroomConnect";

const StudentDashboard = () => {
    return (
        <div>
            <h3>Student Dashboard</h3>
            <p>Welcome to the student dashboard!</p>
            <GoogleClassroomIntegration />
            <iframe
                src="https://ai-content.streamlit.app/?embed=true"
                height="450"
            ></iframe>
            <iframe
                width="350"
                height="430"
                allow="microphone;"
                src="https://console.dialogflow.com/api-client/demo/embedded/fc651b08-962f-4cb8-a039-6ad8bce26409"
            ></iframe>
            <iframe
                allow="microphone;"
                width="350"
                height="430"
                src="https://console.dialogflow.com/api-client/demo/embedded/f87ce02e-9c46-4949-b3f7-6790c5c85906">
            </iframe>
            <iframe width="350" height="430" allow="microphone;" src="https://console.dialogflow.com/api-client/demo/embedded/f4bc4ac3-d4a1-4ab6-be5a-ff81ef28dc3c"></iframe>
            <iframe
                width="350"
                height="430"
                allow="microphone;"
                src="https://console.dialogflow.com/api-client/demo/embedded/7b4f817d-4309-4e6b-b3bb-14b89558a22d"
            ></iframe>
            {/* <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script> */}
            {/* <df-messenger
                intent="WELCOME"
                chat-title="ReadAlongBot"
                agent-id="f87ce02e-9c46-4949-b3f7-6790c5c85906"
                language-code="en"
            ></df-messenger> */}

        </div>
    );
};

export default StudentDashboard;

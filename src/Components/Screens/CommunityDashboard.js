import React from 'react';
import './Home.css';

const CommunityDashboard = () => {
    return (
        <div className="bot-iframe">
            <iframe
                width="350"
                height="630"
                allow="microphone;"
                src="https://console.dialogflow.com/api-client/demo/embedded/952b9238-629c-49e8-91da-49fcaeb7ad4c"
            ></iframe>
        </div>
    );
};

export default CommunityDashboard;

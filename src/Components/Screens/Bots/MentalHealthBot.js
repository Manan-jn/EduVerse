import React from 'react';
import '../Home.css';

const MentalHealthBot = () => {
    return (
        <div className="bot-iframe">
            <iframe
                width="350"
                height="630"
                allow="microphone;"
                src="https://console.dialogflow.com/api-client/demo/embedded/7b4f817d-4309-4e6b-b3bb-14b89558a22d"
            ></iframe>
        </div>
    );
};

export default MentalHealthBot;
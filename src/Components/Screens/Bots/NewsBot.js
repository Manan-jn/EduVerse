import React from 'react';
import '../Home.css';

const NewsBot = () => {
    return (
        <div className="bot-iframe">
            <iframe
                width="350"
                height="630"
                allow="microphone;"
                src="https://console.dialogflow.com/api-client/demo/embedded/fc651b08-962f-4cb8-a039-6ad8bce26409"
            ></iframe>
        </div>
    );
};

export default NewsBot;
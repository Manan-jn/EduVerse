import React from 'react';

const MathsBot = () => {
    return (
        <div className="bot-iframe">
            <iframe
                width="350"
                height="630"
                allow="microphone;"
                src="https://console.dialogflow.com/api-client/demo/embedded/f4bc4ac3-d4a1-4ab6-be5a-ff81ef28dc3c"
            ></iframe>
        </div>
    );
};

export default MathsBot;

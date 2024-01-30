import React, { useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';

const AudioPlayer = () => {
    const [topic, setTopic] = useState('');
    const [audioSrc, setAudioSrc] = useState('');

    const handleGenerateAudio = async () => {
        try {
            const response = await fetch('https://nightrem-mx647o6feq-uc.a.run.app/post_audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic }),
            });

            if (response.ok) {
                console.log('Audio generated successfully');
                // Update the audioSrc state with the generated audio URL
                setAudioSrc('https://nightrem-mx647o6feq-uc.a.run.app/get-audio/output_with_music.wav');
            } else {
                console.error('Error generating audio');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="container">
            <h2 className="text-center mb-4">Unlock Nighttime Learning Powers!</h2>
            <form>
                <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Enter a Topic:</label>
                    <input
                        type="text"
                        className="form-control rounded"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                    />
                </div>
                <div className="d-grid gap-2">
                    <button
                        type="button"
                        className="btn btn-primary rounded"
                        onClick={handleGenerateAudio}
                    >
                        Generate
                    </button>
                </div>
            </form>
            {audioSrc && (
                <ReactAudioPlayer
                    src={audioSrc}
                    autoPlay
                    controls
                />
            )}
        </div>
    );
};

export default AudioPlayer;

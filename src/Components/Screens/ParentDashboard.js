import React, { useEffect, useState } from "react";

const ParentDashboard = () => {
    const [mentalHealthReport, setMentalHealthReport] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://mental-health-bot-buwy.onrender.com/mentalHealthReport");
                const data = await response.json();
                console.log("Data from the server:", data);

                // Set the fetched data to the state variable
                setMentalHealthReport(data.mentalHealthReport);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h3>ParentDashboard</h3>
            <p>Welcome to the ParentDashboard!</p>

            {/* Display the fetched data in a div */}
            {mentalHealthReport && (
                <div>
                    <h4>Mental Health Report:</h4>
                    <p>{mentalHealthReport}</p>
                </div>
            )}

            {/* Add more content and features specific to the parent dashboard */}
        </div>
    );
};

export default ParentDashboard;

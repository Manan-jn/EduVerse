import React from "react";
import { Button, Card } from "flowbite-react";
import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { addDoc, collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";

const CardTemp = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const uid = currentUser.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const userDoc = doc(firestore, "students", currentUser.uid);
        const unsubscribe = onSnapshot(userDoc, (doc) => {
          setUser(doc.data());
          console.log(doc.data());
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    currentUser.uid && getUser();
  }, [currentUser.uid]);

  const handleDigital = async () => {
    try {
      setLoading(true);
      // Get the current date and time
      const currentDate = new Date();
      const currentTime = currentDate.getTime();

      // Check if lastTimeAccessed is present and within the specified time range
      if (
        user &&
        user.lastTimeAccessed &&
        currentTime - user.lastTimeAccessed >= 24 * 60 * 60 * 1000 &&
        currentTime - user.lastTimeAccessed <= 48 * 60 * 60 * 1000
      ) {
        // If lastTimeAccessed is present and the time difference is within 24-48 hours
        // Update learning streak or add a new streak if it doesn't exist
        const updatedLearningStreak = user.learningStreak
          ? user.learningStreak + 1
          : 1;

        // Update user document in the database
        const userDoc = doc(firestore, "students", currentUser.uid);
        await updateDoc(userDoc, {
          lastTimeAccessed: currentTime,
          learningStreak: updatedLearningStreak,
        });
        console.log("Learning streak updated");
      } else {
        // If lastTimeAccessed is not present or the time difference is outside the specified range
        // You can handle this case as per your requirements
        const updatedLearningStreak = 1;
        const userDoc = doc(firestore, "students", currentUser.uid);
        await updateDoc(userDoc, {
          lastTimeAccessed: currentTime,
          learningStreak: updatedLearningStreak,
        });
        console.log("Learning streak updated");
        setLoading(false);
        navigate(`/digital`);
      }
    } catch (error) {
      console.error("Error updating learning streak:", error);
    }
  };

  return (
    <Card className="max-w-sm">
      <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Digital Classroom
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">
        Here are the biggest enterprise technology acquisitions of 2021 so far,
        in reverse chronological order.
      </p>
      {loading && <Spin />}
      <Button color="blue" onClick={handleDigital}>
        Learn More
        <svg
          className="-mr-1 ml-2 h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </Card>
  );
};

export default CardTemp;

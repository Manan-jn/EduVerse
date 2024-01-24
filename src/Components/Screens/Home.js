import React from "react";
import { useEffect } from "react";
import { useState, useContext } from "react";
import { getDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { AuthContext } from "../../context/AuthContext";

const Home = ({ route }) => {
  console.log(route);
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  //   const { id } = route.params;
  //   const [userEmail, setUserEmail] = useState("");

  //   useEffect(() => {
  //     const docRef = doc(firestore, "users", id);
  //     const docSnap = getDoc(docRef);
  //     console.log(docSnap);
  //   }, []);

  const logout = async () => {};
  return (
    <div>
      <h3>Home</h3>
      <p>Home page</p>
    </div>
  );
};

export default Home;

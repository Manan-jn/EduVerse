import React from "react";
import { useEffect } from "react";
import { useState, useContext } from "react";
import { getDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import { doc } from "firebase/firestore";
import { firestore } from "../../firebase-config";
import { AuthContext } from "../../context/AuthContext";

const Home = ({ route }) => {
  const [user, setUser] = useState({});
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);

  useEffect(() => {
    const getUser = () => {
      const unsub = onSnapshot(
        doc(firestore, "users", currentUser.uid),
        (doc) => {
          setUser(doc.data());
          console.log(doc.data());
        }
      );

      return () => {
        unsub();
      };
    };

    currentUser.uid && getUser();
  }, [currentUser.uid]);

  const logout = async () => {};
  return (
    <div>
      <h3>Home</h3>
      <p>Home page</p>
      {user && <p>{user.email}</p>}
      {user && <p>{user.role}</p>}
      <button onClick={() => signOut(auth)}> SignOut</button>
    </div>
  );
};

export default Home;

import React from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { firestore } from "../../firebase-config";
import { addDoc, collection, setDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  const userDb = collection(firestore, "users");
  //   onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //   });
  const register = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(firestore, "users", res.user.uid), {
        uid: res.user.uid,
        email: email,
      });

      navigate(`/home`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h3>Register</h3>
      <input
        placeholder="Email"
        onChange={(event) => {
          setEmail(event.target.value);
        }}
      />
      <input
        placeholder="Password"
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      <button onClick={register}>Register</button>
    </div>
  );
};

export default Register;

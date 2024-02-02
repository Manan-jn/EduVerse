import React from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { firestore } from "../../firebase-config";
import { addDoc, collection, setDoc, doc } from "firebase/firestore";
import { useState } from "react";
import { auth } from "../../firebase-config";
import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Mentions,
  Select,
  TreeSelect,
} from "antd";
import { useNavigate } from "react-router-dom";
import GoogleTranslate from "./GoogleTranslate";
const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dob, setDOB] = useState("");
  const [user, setUser] = useState({});
  const [role, setRole] = useState("student");

  const [tclass, settClass] = useState("");
  const [subject, setSubject] = useState("");

  const userDb = collection(firestore, "users");
  //   onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //   });
  const register = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (role === "student") {
        await setDoc(doc(firestore, "students", res.user.uid), {
          uid: res.user.uid,
          email: email,
          role: role,
          name: name,
          school: school,
          city: city,
          country: country,
          dob: dob,
        });
      }
      if (role === "teacher") {
        await setDoc(doc(firestore, "teachers", res.user.uid), {
          uid: res.user.uid,
          email: email,
          role: role,
          name: name,
          school: school,
          city: city,
          country: country,
          class: tclass,
          subject: subject,
        });
      }
      if (role === "parent") {
        await setDoc(doc(firestore, "parents", res.user.uid), {
          uid: res.user.uid,
          email: email,
          role: role,
          name: name,
        });
      }
      if (role === "community") {
        await setDoc(doc(firestore, "community", res.user.uid), {
          uid: res.user.uid,
          email: email,
          role: role,
          name: name,
          city: city,
          country: country,
        });
      }
      await setDoc(doc(firestore, "users", res.user.uid), {
        uid: res.user.uid,
        email: email,
        role: role,
        name: name,
      });
      navigate(`/home`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        background: "url('https://source.unsplash.com/eNoeWZkO7Zc') no-repeat",
        backgroundSize: "cover",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      <GoogleTranslate />
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          marginTop: "6%",
          padding: "50px",
          backgroundColor: "white",
          borderRadius: "20px",
        }}
      >
        <h3>Register</h3>
        <Form>
          <Form.Item
            label="Name"
            name="Name"
            rules={[{ required: true, message: "Please input!" }]}
          >
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="Email"
            rules={[{ required: true, message: "Please input!" }]}
          >
            <Input
              id="email"
              type="email"
              placeholder="abc@xyz.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="Password"
            rules={[{ required: true, message: "Please input!" }]}
          >
            <Input
              id="password2"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item label="Role">
            <Select
              id="role"
              onChange={(event) => {
                console.log(event);
                setRole(event);
              }}
            >
              <Select.Option value="student">Student</Select.Option>
              <Select.Option value="teacher">Teacher</Select.Option>
              <Select.Option value="parent">Parent</Select.Option>
              <Select.Option value="community">Community Member</Select.Option>
            </Select>
          </Form.Item>
          {role === "student" && (
            <div>
              {/* <Form.Item label="DOB">
                <DatePicker
                  onChange={(event) => {
                    console.log(event);
                    setDOB(event);
                  }}
                />
              </Form.Item> */}
              <Form.Item label="School">
                <Input
                  id="school"
                  type="text"
                  value={school}
                  onChange={(event) => {
                    setSchool(event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="City">
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Country">
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                  }}
                />
              </Form.Item>
            </div>
          )}
          {role === "teacher" && (
            <div>
              <Form.Item label="Class">
                <Input
                  id="class"
                  type="text"
                  value={tclass}
                  onChange={(event) => {
                    settClass(event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Subject">
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="School">
                <Input
                  id="school"
                  type="text"
                  value={school}
                  onChange={(event) => {
                    setSchool(event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="City">
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Country">
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                  }}
                />
              </Form.Item>
            </div>
          )}
          {role === "community" && (
            <div>
              <Form.Item label="City">
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label="Country">
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                  }}
                />
              </Form.Item>
            </div>
          )}
          <Button type="primary" htmlType="submit" onClick={register}>
            Register
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Register;

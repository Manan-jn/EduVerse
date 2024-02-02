import React from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase-config";
import GoogleTranslate from "./GoogleTranslate";
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      navigate("/home");
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
        <h3>Login</h3>
        <Form>
          <Form.Item
            label="Email"
            rules={[{ required: true, message: "Please input!" }]}
          >
            <Input
              placeholder="Email"
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            rules={[{ required: true, message: "Please input!" }]}
          >
            <Input
              placeholder="Password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={login}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;

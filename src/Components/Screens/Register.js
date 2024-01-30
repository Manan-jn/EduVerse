import React from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { firestore } from "../../firebase-config";
import { addDoc, collection, setDoc, doc } from "firebase/firestore";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Label,
  TextInput,
  Select,
  Datepicker,
} from "flowbite-react";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";

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
    <div>
      <form className="flex max-w-md flex-col gap-4" onSubmit={register}>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name" value="Your Name" />
          </div>
          <TextInput
            id="name"
            type="text"
            required
            shadow
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email2" value="Your Email" />
          </div>
          <TextInput
            id="email2"
            type="email"
            placeholder="abc@xyz.com"
            required
            shadow
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password2" value="Your Password" />
          </div>
          <TextInput
            id="password2"
            type="password"
            required
            shadow
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </div>
        <div className="mb-2 block">
          <Label htmlFor="role" value="Your Role" />
        </div>
        <Select
          id="role"
          required
          onChange={(event) => {
            setRole(event.target.value);
          }}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="community">Community Member</option>
        </Select>
        {role === "student" && (
          <div>
            <div className="mb-2 block">
              <Label htmlFor="dob" value="Your DOB" />
            </div>
            <Datepicker
              id="dob"
              required
              onChange={(event) => {
                setDOB(event.target.value);
              }}
              weekStart={1} // Monday
            />
            <div>
              <div className="mb-2 block">
                <Label htmlFor="school" value="Your School" />
              </div>
              <TextInput
                id="school"
                type="text"
                required
                shadow
                value={school}
                onChange={(event) => {
                  setSchool(event.target.value);
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="city" value="Your City" />
              </div>
              <TextInput
                id="city"
                type="text"
                required
                shadow
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="country" value="Your Country" />
              </div>
              <TextInput
                id="country"
                type="text"
                required
                shadow
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                }}
              />
            </div>
          </div>
        )}
        {role === "teacher" && (
          <div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="class" value="Your Class" />
              </div>
              <TextInput
                id="class"
                type="text"
                required
                shadow
                value={tclass}
                onChange={(event) => {
                  settClass(event.target.value);
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="subject" value="Your Subject" />
              </div>
              <TextInput
                id="subject"
                type="text"
                required
                shadow
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="school" value="Your School" />
              </div>
              <TextInput
                id="school"
                type="text"
                required
                shadow
                value={school}
                onChange={(event) => {
                  setSchool(event.target.value);
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="city" value="Your City" />
              </div>
              <TextInput
                id="city"
                type="text"
                required
                shadow
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="country" value="Your Country" />
              </div>
              <TextInput
                id="country"
                type="text"
                required
                shadow
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                }}
              />
            </div>
          </div>
        )}
        {role === "community" && (
          <div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="city" value="Your City" />
              </div>
              <TextInput
                id="city"
                type="text"
                required
                shadow
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                }}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="country" value="Your Country" />
              </div>
              <TextInput
                id="country"
                type="text"
                required
                shadow
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                }}
              />
            </div>
          </div>
        )}
        <Button type="submit" style={{ color: "blue" }}>
          Register new account
        </Button>
      </form>
    </div>
  );
};

export default Register;

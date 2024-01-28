import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { collection, getFirestore, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase-config";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    dateOfBirth: "",
    school: "",
    classes: "",
    subject: "",
    city: "",
    country: "",
    studentEmail: "",
  });

  const navigate = useNavigate();
  const firestore = getFirestore();

  const { email, password, role, dateOfBirth, school, classes, subject, city, country, studentEmail } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      if (role === "parent") {
        const lowerCaseStudentEmail = studentEmail.toLowerCase();

        const studentDocRef = collection(firestore, 'users');
        const querySnapshot = await getDocs(query(studentDocRef, where('email', '==', lowerCaseStudentEmail)));

        if (querySnapshot.empty) {
          console.error("Invalid student email. Please enter a registered student's email.");
          return;
        }
        // const studentDocSnapshot = querySnapshot.docs[0];
        // console.log("Student Doc Data:", studentDocSnapshot.data());
        // console.log("Student Doc Exists:", studentDocSnapshot.exists());
      }

      const res = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(firestore, "users", res.user.uid);
      await setDoc(userDocRef, {
        uid: res.user.uid,
        email: email,
        role: role,
        dateOfBirth: dateOfBirth,
        school: school,
        classes: classes,
        subject: subject,
        city: city,
        country: country,
        studentEmail: studentEmail,
      });

      console.log("Registration Information:", {
        uid: res.user.uid,
        email: email,
        role: role,
        dateOfBirth: dateOfBirth,
        school: school,
        classes: classes,
        subject: subject,
        city: city,
        country: country,
        studentEmail: studentEmail,
      });

      navigate(`/home`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h3>Register</h3>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={email} onChange={handleChange} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={password} onChange={handleChange} />
        </div>
        <div>
          <label>Role:</label>
          <select name="role" value={role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="teacher">Teacher</option>
            <option value="communityMember">Community Member</option>
          </select>
        </div>

        {role === 'student' && (
          <>
            <div>
              <label>Date of Birth:</label>
              <input type="date" name="dateOfBirth" value={dateOfBirth} onChange={handleChange} />
            </div>
            <div>
              <label>School:</label>
              <input type="text" name="school" value={school} onChange={handleChange} />
            </div>
            <div>
              <label>City:</label>
              <input type="text" name="city" value={city} onChange={handleChange} />
            </div>
            <div>
              <label>Country:</label>
              <input type="text" name="country" value={country} onChange={handleChange} />
            </div>
          </>
        )}

        {role === 'parent' && (
          <div>
            <label>Student Email:</label>
            <input type="email" name="studentEmail" value={studentEmail} onChange={handleChange} />
          </div>
        )}

        {role === 'teacher' && (
          <>
            <div>
              <label>Classes:</label>
              <input type="text" name="classes" value={classes} onChange={handleChange} />
            </div>
            <div>
              <label>Subject:</label>
              <input type="text" name="subject" value={subject} onChange={handleChange} />
            </div>
            <div>
              <label>School:</label>
              <input type="text" name="school" value={school} onChange={handleChange} />
            </div>
            <div>
              <label>City:</label>
              <input type="text" name="city" value={city} onChange={handleChange} />
            </div>
            <div>
              <label>Country:</label>
              <input type="text" name="country" value={country} onChange={handleChange} />
            </div>
          </>
        )}

        {role === 'communityMember' && (
          <>
            <div>
              <label>City:</label>
              <input type="text" name="city" value={city} onChange={handleChange} />
            </div>
            <div>
              <label>Country:</label>
              <input type="text" name="country" value={country} onChange={handleChange} />
            </div>
          </>
        )}

        <div>
          <button type="button" onClick={register}>
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;

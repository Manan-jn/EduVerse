import React from "react";
import { useEffect, useState, useContext } from "react";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { AuthContext } from "../../context/AuthContext";
import { addDoc, collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { getDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase-config";
import { firestore } from "../../firebase-config";
import UserImg from "../../assets/user.jpg";

const NavBar = () => {
  const { currentUser } = useContext(AuthContext);
  const uid = currentUser.uid;
  const [user, setUser] = useState({});

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
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="#">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          EduVerse
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={<Avatar alt="User settings" src={UserImg} rounded />}
        >
          <Dropdown.Header>
            {user && <span className="block text-sm">{user.name}</span>}
            {user && (
              <span className="block truncate text-sm font-medium">
                {user.email}
              </span>
            )}
            {user && (
              <span className="block truncate text-sm font-medium">
                {user.role}
              </span>
            )}
          </Dropdown.Header>
          {/* <Dropdown.Item>Dashboard</Dropdown.Item> */}
          <Dropdown.Item>Settings</Dropdown.Item>
          {/* <Dropdown.Item>Earnings</Dropdown.Item> */}
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => signOut(auth)}>Sign out</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        {user && <p>Welcome {user.name}</p>}
        {/* <Navbar.Link href="#">About</Navbar.Link>
        <Navbar.Link href="#">Services</Navbar.Link>
        <Navbar.Link href="#">Pricing</Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link> */}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;

import { useEffect, useState } from "react";
import UserContext from "../context/UserContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../FireBase/FireBaseAuth";
import axios from "axios";

const UserContextProvider = ({ children }) => {

  const [user, setUser] = useState(null);


  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          profilePic: firebaseUser.photoURL || "",
        });

       //.......................extra data??

      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, checkingAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;

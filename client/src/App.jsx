import { Routes, Route, Navigate } from "react-router";
import Home from "./Components/Home";
import Auth from "./Components/Auth/Auth";
import { auth } from "./FireBase/FireBaseAuth";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          profilePic: firebaseUser.photoURL || "",
        });
      } else {
        setUser(null);
      }
      setCheckingAuth(false); 
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-lg">
        Checking authentication...
      </div>
    );
  }

  return (
    <Routes>
      
      <Route
        path="/auth"
        element={user ? <Navigate to="/home" /> : <Auth />}
      />

     
      <Route
        path="/home"
        element={user ? <Home /> : <Navigate to="/auth" />}
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/home" : "/auth"} />}
      />
    </Routes>
  );
}

export default App;

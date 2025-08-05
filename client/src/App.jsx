import { Routes, Route, Navigate } from "react-router";
import Home from "./Components/Home";
import Auth from "./Components/Auth/Auth";
import { useContext } from "react";
import UserContext from "./context/UserContext";
import Code from "./Components/Code";
import CodeEditor from "./Components/CodeEditor";
import LandingPage from "./Components/LandingPage";

function App() {
  const { user, checkingAuth } = useContext(UserContext);

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-lg">
        Checking authentication...
      </div>
    );
  }

  return (
    <Routes>


      {!user && (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
      {user && (
        <>
          <Route path="/code" element={<CodeEditor />} />
          <Route path="*" element={<Navigate to="/code" />} />
        </>
      )}

    </Routes>
  );
}

export default App;

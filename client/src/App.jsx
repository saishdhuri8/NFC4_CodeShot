import { Routes, Route, Navigate } from "react-router";
import Home from "./components/Home";
import Auth from "./components/Auth/Auth";
import { useContext } from "react";
import UserContext from "./context/UserContext";
import Code from "./components/Code";
import CodeEditor from "./components/CodeEditor";
import LandingPage from "./components/LandingPage";
import InterviewRoom from "./components/InterviewRoom";

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
         <Route path="/interview/:roomId" element={<InterviewRoom />} />
         
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

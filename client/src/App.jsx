import { Routes, Route, Navigate } from "react-router";
import Home from "./components/Home";
import Auth from "./components/Auth/Auth";
import { useContext } from "react";
import UserContext from "./context/UserContext";

import CodeEditor from "./Components/CodeEditor";
import LandingPage from "./Components/LandingPage";
import InterviewDashboard from "./Components/InterviewDashboard";
import Board from "./Components/Board";
import InterviewRoom from "./components/InterviewRoom";
import Editor from "./Components/Editor";


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
          <Route path="/room/:roomId" element={<InterviewRoom/>} />

          <Route path="/wb" element={<Board/>} />
          <Route path="/code" element={<Auth />} />

       
          <Route path="/editor/" element={<Editor/>} />
          
        </>
      )}
      {user && (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/code" element={<CodeEditor />} />
          
          <Route path="/interview-dashboard" element={<InterviewDashboard />} />

          <Route path="/wb" element={<Board/>} />
          <Route path="*" element={<Navigate to="/code" />} />
        </>
      )}

    </Routes>
  );
}

export default App;

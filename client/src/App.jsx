import { Routes, Route, Navigate } from "react-router";
import Home from "./components/Home";
import Auth from "./components/Auth/Auth";
import { useContext } from "react";
import UserContext from "./context/UserContext";
import Code from "./Components/Code";
import CodeEditor from "./Components/CodeEditor";
import LandingPage from "./Components/LandingPage";
import Whiteboard from "./Components/WhiteBoard";
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
          <Route path="/start" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/room/:roomId" element={<InterviewRoom/>} />

          <Route path="/wb" element={<Board/>} />
          <Route path="/code" element={<CodeEditor />} />
          <Route path="/interview" element={<InterviewRoom/>} />
          <Route path="/editor/" element={<Editor/>} />
          
        </>
      )}
      {user && (
        <>
          <Route path="/start" element={<CodeEditor />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/code" element={<CodeEditor />} />
          <Route path="*" element={<Navigate to="/code" />} />
          <Route path="/wb" element={<Board/>} />
        </>
      )}

    </Routes>
  );
}

export default App;

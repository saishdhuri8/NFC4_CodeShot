import { Routes, Route, Navigate } from "react-router";
import Home from "./Components/Home";
import Auth from "./Components/Auth/Auth";
import { useContext } from "react";
import UserContext from "./context/UserContext";

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

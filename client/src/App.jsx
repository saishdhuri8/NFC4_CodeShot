import { Routes, Route, Navigate } from "react-router";
import Home from "./Components/Home";

function App() {

  return (
    <Routes>
        <Route path="/home" element={<Home/>}/>
    </Routes>
  )
}

export default App

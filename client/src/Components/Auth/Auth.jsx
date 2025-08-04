import React, { useContext, useState } from "react";
import { useFirebase } from "../../FireBase/FireBaseAuth";
import { motion } from "framer-motion";
import { FaGoogle, FaLock, FaEnvelope } from "react-icons/fa";
import UserContext from "../../context/UserContext";



const Auth = () => {
  const { signup, signin, signinByGoogle } = useFirebase();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  
  const { userId ,setuserId} = useContext(UserContext)
  
  console.log("helloo"+ userId);
  
  
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = isLogin
    ? await signin(email, password)
    : await signup(email, password);
    console.log(result);
    
    if (!result) {
      setError("Authentication failed. Please check your credentials.");
    } else {
      alert(`Welcome, ${result.email}`);
    }
  };
  
  const handleGoogle = async () => {
    const result = await signinByGoogle();
    console.log(result);
    if (!result) {
      
      setError("Google sign-in failed.");
    } else {
      alert(`Welcome, ${result.name}`);
    }
  };
  
  
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-100 to-pink-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg"
        >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {isLogin ? "Login" : "Sign Up"}
          </motion.button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
        >
          <FaGoogle />
          Sign in with Google
        </motion.button>

        <p className="mt-4 text-sm text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;

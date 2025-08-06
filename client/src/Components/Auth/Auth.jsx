import React, { useContext, useState } from "react";
import { useFirebase } from "../../FireBase/FireBaseAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGoogle,
  FaLock,
  FaEnvelope,
  FaUserPlus,
  FaSignInAlt,
} from "react-icons/fa";
import UserContext from "../../context/UserContext";
import Navbar from "../Navbar";

const Auth = () => {
  const { signup, signin, signinByGoogle } = useFirebase();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { userId, setuserId } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = isLogin
      ? await signin(email, password)
      : await signup(email, password);

    if (!result) {
      setError("Authentication failed. Please check your credentials.");
    } else {
      alert(`Welcome, ${result.email}`);
    }
  };

  const handleGoogle = async () => {
    const result = await signinByGoogle();
    if (!result) {
      setError("Google sign-in failed.");
    } else {
      alert(`Welcome, ${result.name}`);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar/>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-30 mix-blend-multiply animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-green-600 rounded-full filter blur-3xl opacity-30 mix-blend-multiply animate-blob animation-delay-4000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-full max-w-md z-10"
        >
          <motion.div
            className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center border-b border-gray-800">
              <motion.h2
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </motion.h2>
              <motion.p
                className="text-blue-200 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isLogin
                  ? "Sign in to continue your journey"
                  : "Join our coding community"}
              </motion.p>
            </div>

            <motion.div
              className="p-8"
              variants={formVariants}
              initial="hidden"
              animate="visible"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      variants={itemVariants}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-800/50"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-lg transition-all duration-300 ${
                      isLogin
                        ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30"
                        : "bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-500/30"
                    }`}
                  >
                    {isLogin ? (
                      <>
                        <FaSignInAlt />
                        Sign In
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        Sign Up
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div
                className="flex items-center my-6"
                variants={itemVariants}
              >
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-200 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
                >
                  <FaGoogle className="text-red-400" />
                  Continue with Google
                </motion.button>
              </motion.div>

              <motion.div className="mt-6 text-center" variants={itemVariants}>
                <p className="text-sm text-gray-400">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-400 font-medium hover:text-blue-300 focus:outline-none transition"
                  >
                    {isLogin ? "Sign up" : "Login"}
                  </button>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

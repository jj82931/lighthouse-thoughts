import React from "react";
import { motion } from "framer-motion";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl font-semibold text-amber-400 mb-3">
          Please wait a moment
        </h2>
        <p className="text-stone-300 text-lg mb-6">{message}</p>
        <div className="w-10 h-10 border-4 border-stone-600 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
      </motion.div>
    </div>
  );
}

export default LoadingSpinner;

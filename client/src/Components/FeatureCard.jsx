import React from "react";
import { motion } from "framer-motion";

export default function FeatureCard({ title, description, img = "", reverse = false }) {
  return (
    <motion.div
      className={`flex flex-col md:flex-row items-center justify-between gap-12 px-6 md:px-20 py-10 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {/* Image or Placeholder */}
      <div className="w-full md:w-1/2">
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-64 md:h-80 object-contain rounded-xl shadow-md bg-white p-4"
          />
        ) : (
          <div className="bg-white w-full h-64 md:h-80 rounded-xl shadow-inner flex items-center justify-center text-gray-500 text-lg font-medium border-dashed border-2 border-gray-300">
            Add Image Here
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="w-full md:w-1/2 text-left">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">{title}</h3>
        <p className="text-gray-300 text-base md:text-lg">{description}</p>
      </div>
    </motion.div>
  );
}

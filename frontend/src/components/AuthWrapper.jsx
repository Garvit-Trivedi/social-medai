import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function AuthWrapper({ children }) {
  const location = useLocation();
  const dir = location.state?.dir || 1;

  return (
    <motion.div
      className="min-h-screen flex justify-center items-center bg-purple-600 backdrop-blur-xl"
      initial={{
        x: dir === 1 ? 450 : -450,   // slide
        opacity: 0,                  // fade
        rotateY: dir === 1 ? 35 : -35 // 3D rotate
      }}
      animate={{
        x: 0,
        opacity: 1,
        rotateY: 0,
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],  // smooth + bounce-like
          rotateY: {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1]
          }
        }
      }}
      exit={{
        x: dir === 1 ? -450 : 450,
        opacity: 0,
        rotateY: dir === 1 ? -35 : 35,
        transition: { duration: 0.7, ease: [0.55, 0.06, 0.68, 0.19] }
      }}
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94] // soft elastic bounce
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

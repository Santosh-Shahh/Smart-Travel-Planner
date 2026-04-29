import { motion } from 'framer-motion';

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{
          x: [0, 100, 0, -100, 0],
          y: [0, 50, 100, 50, 0],
          scale: [1, 1.1, 1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[800px] max-h-[800px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"
      />
      <motion.div
        animate={{
          x: [0, -100, 0, 100, 0],
          y: [0, 100, 50, -50, 0],
          scale: [1, 0.9, 1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] max-w-[700px] max-h-[700px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"
      />
      <motion.div
        animate={{
          x: [0, 50, -50, 50, 0],
          y: [0, -100, -50, 100, 0],
          scale: [1, 1.2, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] max-w-[900px] max-h-[900px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-30"
      />
    </div>
  );
};

export default BackgroundBlobs;

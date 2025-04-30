'use client';

import { motion } from 'framer-motion';
import { CodeIcon } from 'lucide-react';

export default function AnimatedLogo() {
  return (
    <div className="relative flex items-center justify-center gap-3 py-12">
      {/* Glow Behind */}
      <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 to-cyan-400 opacity-40 blur-xl rounded-lg animate-pulse z-0" />

      {/* Logo Icon + Text */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10 flex items-center gap-3"
      >
        <CodeIcon className="size-10 md:size-12 text-emerald-400 drop-shadow" />
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent animate-gradient-x">
          MeetWise  
        </h1>
      </motion.div>
    </div>
  );
}

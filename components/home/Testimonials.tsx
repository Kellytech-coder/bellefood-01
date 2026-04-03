"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Play, X } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    text: `"A customer testimonial that highlights features and answers potential customer doubts about your product or service."`,
    name: "Customer Name",
    role: "Position, Company name",
    image: "/images/user1.jpg",
    video: "/videos/test1.mp4",
    poster:"/images/videos/thumb1-jpg",
  },
  {
    text: `"Lorem ipsum dolor sit amet..."`,
    name: "Name Surname",
    role: "Position, Company name",
    image: "/images/user2.jpg",
    video: "/videos/test2.mp4",
    poster:"/images/videos/thumb1-jpg",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function Testimonials() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // ✅ Close modal with ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <section className="w-full bg-[#0B0F0E] py-16 md:py-24 px-4 sm:px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white"
          >
            Loved by Lagos
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/60 mt-3 text-sm sm:text-base"
          >
            What our customers say
          </motion.p>
        </motion.div>

        {/* CARDS */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-xl"
            >
              {/* VIDEO PREVIEW */}
              <div className="relative h-[220px] sm:h-[240px] md:h-[260px] overflow-hidden flex items-center justify-center">
                
                {/* dark overlay */}
                <div className="absolute inset-0 bg-black/40 z-[1]" />

                <video
                  src={item.video}
                  poster={item.poster}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  autoPlay={activeVideo !== item.video}
                  loop
                  playsInline
                />

                {/* PLAY BUTTON */}
                <motion.button
                  onClick={() => setActiveVideo(item.video)}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/20 backdrop-blur-md"
                >
                  <motion.span
                    className="absolute w-full h-full rounded-xl bg-white/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Play className="text-white ml-1 w-5 h-5" />
                </motion.button>
              </div>

              {/* CONTENT */}
              <div className="bg-white p-5 md:p-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.text}
                </p>

                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 text-sm">
                    {[...Array(5)].map((_, idx) => (
                      <span key={idx} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            onClick={() => setActiveVideo(null)} // ✅ click outside to close
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()} // prevent close when clicking video
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-[900px] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 transition p-2 rounded-full"
              >
                <X className="text-white w-5 h-5" />
              </button>

              {/* VIDEO */}
              <video
                key={activeVideo}
                controls
                autoPlay
                playsInline
                className="w-full aspect-video bg-black object-contain"
              >
                <source src={activeVideo} type="video/mp4" />
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
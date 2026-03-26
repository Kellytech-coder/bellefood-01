"use client";

import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Play, X } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    text: `""A customer testimonial that
     highlights features and answers potential 
     customer doubts about your product or service."`,
    name: "Customer Name",
    role: "Position, Company name",
    image: "/images/user1.jpg",
    video: "/videos/test1.mp4",
  },
  {
    text: `"Lorem ipsum dolor sit amet..."`,
    name: "Name Surname",
    role: "Position, Company name",
    image: "/images/user2.jpg",
    video: "/videos/test2.mp4",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function Testimonials() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

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
              {/* VIDEO THUMB */}
              <div className="relative h-[200px] sm:h-[240px] md:h-[260px] flex items-center justify-center overflow-hidden">

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src="/images/testimonial-thumb.jpg"
                    alt="video"
                    fill
                    className="object-cover opacity-70"
                  />
                </motion.div>

                {/* PLAY BUTTON */}
                <motion.button
                  onClick={() => setActiveVideo(item.video)}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-white/20 backdrop-blur-md"
                >
                  <motion.span
                    className="absolute w-full h-full rounded-xl bg-white/30"
                    animate={{
                      scale: [1, 1.6, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />

                  <Play className="text-white ml-1 w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>

              {/* CONTENT */}
              <div className="bg-white p-4 sm:p-5 md:p-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.text}
                </p>

                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="rounded-full overflow-hidden"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={36}
                        height={36}
                        className="sm:w-10 sm:h-10"
                      />
                    </motion.div>

                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.role}</p>
                    </div>
                  </div>

                  {/* RATING */}
                  <div className="flex gap-1 text-sm">
                    {[...Array(5)].map((_, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="text-yellow-400"
                      >
                        ★
                      </motion.span>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-[700px] bg-black rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-3 right-3 z-50 bg-white/20 p-2 rounded-full"
              >
                <X className="text-white w-4 h-4" />
              </button>

              <video
                src={activeVideo}
                controls
                autoPlay
                className="w-full h-[220px] sm:h-[300px] md:h-[400px] object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
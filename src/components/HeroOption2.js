"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import "./HeroOption2.css";
import Link from "next/link";

export default function HeroOption2() {
  const [phase, setPhase] = useState(0); // 0: plan, 1: framing, 2: drywall, 3: final
  const [wordIndex, setWordIndex] = useState(0);
  
  const words = ["Design and Build", "Renovate | Remodel", "Floors and More"];

  useEffect(() => {
    let isActive = true;
    
    const sequence = async () => {
      while (isActive) {
        setPhase(0);
        await new Promise(r => setTimeout(r, 6000)); // Pause longer (6s) on the floor plan
        if (!isActive) break;
        
        setPhase(1);
        await new Promise(r => setTimeout(r, 3000)); // Framing (3s)
        if (!isActive) break;
        
        setPhase(2);
        await new Promise(r => setTimeout(r, 3000)); // Drywall (3s)
        if (!isActive) break;
        
        setPhase(3);
        await new Promise(r => setTimeout(r, 4000)); // Final (4s)
      }
    };
    
    sequence();
    
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000); // Cycle terms every 3 seconds
    return () => clearInterval(wordInterval);
  }, []);

  return (
    <section className="hero2-section">
      <div className={`hero2-bg build-1 ${phase === 0 ? 'active' : ''}`}></div>
      <div className={`hero2-bg build-2 ${phase === 1 ? 'active' : ''}`}></div>
      <div className={`hero2-bg build-3 ${phase === 2 ? 'active' : ''}`}></div>
      <div className={`hero2-bg build-4 ${phase === 3 ? 'active' : ''}`}></div>
      
      <div className="hero2-overlay"></div>
      
      <div className="container hero2-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hero2-text-box"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            SAHIG
          </motion.h1>
          <div className="hero2-design-build-container">
            <AnimatePresence mode="wait">
              <motion.h2
                key={words[wordIndex]}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="hero2-design-build"
              >
                {words[wordIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="hero2-subtitle"
          >
            By MCN Contracting Ltd.
          </motion.p>
          <motion.div
            className="hero2-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Link href="#contact" className="btn">Free Estimate</Link>
            <Link href="#contact" className="btn btn-outline">Contact Us</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

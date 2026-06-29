"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import "./HeroSection.css";
import Link from "next/link";

export default function HeroSection() {
  const [currentBg, setCurrentBg] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % 3);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      <div className={`hero-bg sketch ${currentBg === 0 ? 'active' : ''}`}></div>
      <div className={`hero-bg cad ${currentBg === 1 ? 'active' : ''}`}></div>
      <div className={`hero-bg real ${currentBg === 2 ? 'active' : ''}`}></div>
      
      <div className="hero-overlay"></div>
      
      <div className="container hero-content">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="hero-text-box glass-panel"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Premium Flooring Installation in Abbotsford
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Elevate your space with our expert hardwood, LVP, tile, and concrete polishing services. Quality craftsmanship, built to last.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Link href="#services" className="btn">Our Services</Link>
            <Link href="#contact" className="btn btn-outline">Get a Free Quote</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

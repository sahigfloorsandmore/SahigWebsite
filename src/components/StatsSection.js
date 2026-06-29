"use client";

import { useEffect, useState, useRef } from "react";
import { useInView, motion } from "framer-motion";
import "./StatsSection.css";

function Counter({ target, duration = 2, suffix = "", keepTicking = false }) {
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseInt(target.replace(/,/g, ""), 10);
    if (isNaN(end)) return;

    const startTime = performance.now();
    let animFrameId;

    const updateCount = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * end);
      
      setCount(current);

      if (progress < 1) {
        animFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
        setIsCompleted(true);
      }
    };

    animFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animFrameId);
  }, [isInView, target, duration]);

  // Live ticking effect to keep adding sq ft
  useEffect(() => {
    if (!isCompleted || !keepTicking) return;

    const interval = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 2) + 1); // Increment by 1 or 2
    }, 1500); // Every 1.5 seconds

    return () => clearInterval(interval);
  }, [isCompleted, keepTicking]);

  const formatted = count.toLocaleString();

  return (
    <span ref={ref} className="stat-number">
      {formatted}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const stats = [
    { target: "1248350", suffix: "+", label: "Sq Ft. Flooring Installed", keepTicking: true },
    { target: "326", suffix: "+", label: "Projects Completed" },
    { target: "100", suffix: "%", label: "Satisfied Customers" }
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <motion.div 
          className="stats-grid"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <Counter target={stat.target} suffix={stat.suffix} keepTicking={stat.keepTicking} />
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

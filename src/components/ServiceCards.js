"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import "./ServiceCards.css";

const services = [
  {
    category: "Flooring Supply & Install",
    description: "Premium supply and expert installation of top-tier materials. We cover the entire spectrum of modern flooring styles tailored to your space.",
    defaultImage: "/images/services/flooring_default.png",
    items: [
      { name: "Hardwood", image: "/images/services/hardwood.png" },
      { name: "Laminate", image: "/images/services/laminate.png" },
      { name: "Luxury Vinyl Plank (LVP)", image: "/images/services/lvp.png" },
      { name: "Tiles", image: "/images/services/tile.png" },
      { name: "Carpet", image: "/images/services/carpet.png" }
    ]
  },
  {
    category: "Renovation & Remodelling",
    description: "Complete home transformations from concept to completion. Our turn-key services bring modern aesthetics and high functionality to your residential or commercial projects.",
    defaultImage: "/images/services/renovation_default.png",
    items: [
      { name: "Design and Build", image: "/images/services/design_build.png" },
      { name: "Full Scale Renovations", image: "/images/services/full_reno.png" },
      { name: "Kitchen & Bathroom Remodelling", image: "/images/services/kitchen_bath.png" }
    ]
  },
  {
    category: "Floor Prep & Finishes",
    description: "Flawless surface preparation and architectural floor treatments. We create industrial-strength durability and luxurious, light-reflective shine.",
    defaultImage: "/images/services/prep_default.png",
    items: [
      { name: "Floor Levelling", image: "/images/services/levelling.png" },
      { name: "Floor Polishing", image: "/images/services/polishing.png" },
      { name: "Epoxy Flakes System", image: "/images/services/epoxy.png" }
    ]
  },
  {
    category: "Specialty & Mechanical",
    description: "Diverse contracting capabilities including custom steel work, logistics support, and commercial-grade building systems via our dedicated mechanical team.",
    defaultImage: "/images/services/specialty_default.png",
    items: [
      { name: "Metal Fabrication", image: "/images/services/metal_fab.png" },
      { name: "Delivery & Garbage Disposal", image: "/images/services/delivery.png" },
      { name: "Mechanical Services", image: "/images/services/mechanical.png" }
    ],
    link: "https://shgmechanical.ca"
  }
];

const cardVariants = {
  incoming: {
    x: "-100vw",
    scale: 0.85,
    rotateY: -35,
    opacity: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  },
  active: {
    x: "0px",
    scale: 1,
    rotateY: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  },
  stacked: (depth) => ({
    x: depth * 20 + "px",
    scale: 1 - depth * 0.04,
    opacity: Math.max(1 - depth * 0.25, 0.3),
    filter: `blur(${depth * 2}px)`,
    rotateY: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  })
};

function ServiceCard({ service, index, activeIndex }) {
  const [activeImage, setActiveImage] = useState(service.defaultImage);
  const [hoveredTag, setHoveredTag] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);

  const isFirst = index === 0;
  let status = "incoming";
  
  if (index === activeIndex) {
    status = "active";
  } else if (index < activeIndex) {
    status = "stacked";
  }

  // Reset states when card is no longer active
  useEffect(() => {
    if (index !== activeIndex) {
      setActiveImage(service.defaultImage);
      setHoveredTag(null);
      setUserInteracted(false);
    }
  }, [activeIndex, index, service.defaultImage]);

  // Auto-cycle sub-services tags as a visual tour when card is in focus
  useEffect(() => {
    if (index !== activeIndex || userInteracted) return;

    let cycleCount = 0;
    const interval = setInterval(() => {
      if (cycleCount < service.items.length) {
        setActiveImage(service.items[cycleCount].image);
        setHoveredTag(cycleCount);
        cycleCount++;
      } else {
        // Return to default view after one complete tour
        setActiveImage(service.defaultImage);
        setHoveredTag(null);
        clearInterval(interval);
      }
    }, 2400); // Shift every 2.4s

    return () => clearInterval(interval);
  }, [activeIndex, index, userInteracted, service.items, service.defaultImage]);

  return (
    <motion.div
      custom={activeIndex - index}
      variants={cardVariants}
      initial={isFirst ? "active" : "incoming"}
      animate={status}
      style={{
        transformStyle: "preserve-3d",
        zIndex: index + 1
      }}
      className="service-deck-card"
    >
      <div className="card-inner-grid">
        <div className="card-3d-image-container">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={activeImage}
              src={activeImage} 
              alt={service.category} 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="card-3d-image" 
            />
          </AnimatePresence>
          <div className="card-3d-image-overlay"></div>
        </div>
        <div className="card-3d-content">
          <span className="card-number">0{index + 1}</span>
          <h3>{service.category}</h3>
          <p>{service.description}</p>
          
          {/* Sub-services tags list */}
          <div className="sub-services-tags">
            {service.items.map((item, i) => (
              <span 
                key={i} 
                className={`service-tag ${hoveredTag === i ? 'active-tag' : ''}`}
                onMouseEnter={() => {
                  setUserInteracted(true);
                  setActiveImage(item.image);
                  setHoveredTag(i);
                }}
                onMouseLeave={() => {
                  // Keep the hovered image or return to default (return to default is standard)
                  setActiveImage(service.defaultImage);
                  setHoveredTag(null);
                }}
              >
                {item.name}
              </span>
            ))}
          </div>

          <div className="service-card-actions">
            <a href="#contact" className="btn card-cta">
              Get a Quote
            </a>
            {service.link && (
              <a 
                href={service.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline mechanical-link-btn"
              >
                shgmechanical.ca
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServiceCards() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Track scroll progress of the entire multi-viewport track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Listen to scroll progress changes and snap to indices
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let index = 0;
    if (latest < 0.22) index = 0;
    else if (latest < 0.52) index = 1;
    else if (latest < 0.78) index = 2;
    else index = 3;

    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  });

  return (
    <div ref={containerRef} id="services" className="services-scroll-track">
      <div className="services-sticky-wrapper">
        <div className="services-deck-container">
          <div className="services-sticky-header">
            <span className="section-subtitle">Our Capabilities</span>
            <h2>Services & Solutions</h2>
          </div>

          <div className="cards-deck">
            {services.map((service, index) => (
              <ServiceCard 
                key={index} 
                service={service} 
                index={index} 
                activeIndex={activeIndex} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

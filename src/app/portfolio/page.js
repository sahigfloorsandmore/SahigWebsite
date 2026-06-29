"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Maximize2, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import "./portfolio.css";

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(["All", "Flooring", "Renovations", "Floor Prep", "Specialty"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch portfolio data and categories
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          // Sort newest projects first
          const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setProjects(sorted);
          setFilteredProjects(sorted);
        }

        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(["All", ...catData]);
        }
      } catch (err) {
        console.error("Failed to load portfolio items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  // Filter projects when activeCategory changes
  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase()));
    }
  }, [activeCategory, projects]);

  return (
    <div className="portfolio-page-wrapper">
      <Navbar />

      <header className="portfolio-header">
        <div className="container header-container">
          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Work
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="portfolio-subtitle"
          >
            Explore our curated showcase of completed residential and commercial craftsmanship throughout British Columbia.
          </motion.p>
        </div>
      </header>

      <section className="portfolio-gallery-section">
        <div className="container">
          {/* Category Filter Tabs */}
          <div className="portfolio-tabs-container">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                className={`portfolio-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid Gallery */}
          {loading ? (
            <div className="gallery-loading">
              <div className="spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="gallery-empty">
              <p>No projects found in this category.</p>
            </div>
          ) : (
            <motion.div 
              layout 
              className="portfolio-grid"
            >
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    layout
                    key={project.id}
                    className="portfolio-card glass-panel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="portfolio-img-container">
                      <img src={project.image} alt={project.title} className="portfolio-img" />
                      <div className="portfolio-hover-overlay">
                        <Maximize2 size={20} className="zoom-icon" />
                        <span className="hover-view-text">View Details</span>
                      </div>
                      <span className="portfolio-card-category-badge">{project.category}</span>
                    </div>
                    
                    <div className="portfolio-card-info">
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox / Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              className="lightbox-content glass-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lightbox-close-btn" onClick={() => setSelectedProject(null)}>
                <X size={20} />
              </button>

              <div className="lightbox-grid">
                <div className="lightbox-image-wrapper">
                  <img src={selectedProject.image} alt={selectedProject.title} />
                </div>
                <div className="lightbox-details-wrapper">
                  <span className="lightbox-category-badge">
                    <Tag size={12} />
                    <span>{selectedProject.category}</span>
                  </span>
                  <h2>{selectedProject.title}</h2>
                  <div className="lightbox-divider"></div>
                  <h3>Project Overview</h3>
                  <p className="lightbox-desc">{selectedProject.description}</p>
                  
                  <div className="lightbox-actions">
                    <Link href="/#contact" className="btn btn-lightbox-quote" onClick={() => setSelectedProject(null)}>
                      Inquire About Similar Project
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

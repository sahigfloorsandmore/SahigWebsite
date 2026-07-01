"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Calendar, Search, Newspaper, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import "./blog.css";

// Inline Facebook SVG Icon for compatibility
const Facebook = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSource, setActiveSource] = useState("All"); // All, Facebook, Manual
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch blog data
  useEffect(() => {
    async function loadBlog() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          // Sort newest first
          const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setPosts(sorted);
          setFilteredPosts(sorted);
        }
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, []);

  // Filter posts when searchQuery or activeSource changes
  useEffect(() => {
    let result = posts;

    if (activeSource !== "All") {
      result = result.filter(p => p.source.toLowerCase() === activeSource.toLowerCase());
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q)
      );
    }

    setFilteredPosts(result);
  }, [searchQuery, activeSource, posts]);

  return (
    <div className="blog-page-wrapper">
      <Navbar />

      <header className="blog-header">
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
            Company Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="blog-subtitle"
          >
            Stay updated with our latest flooring installations, project logs, subfloor prep tips, and announcements throughout BC.
          </motion.p>
        </div>
      </header>

      <section className="blog-posts-section">
        <div className="container">
          
          {/* Controls Panel (Search & Source Filters) */}
          <div className="blog-controls-row">
            
            {/* Filter Tabs */}
            <div className="blog-filter-tabs">
              {["All", "Facebook", "Manual"].map((src, idx) => (
                <button
                  key={idx}
                  className={`blog-filter-tab ${activeSource === src ? 'active' : ''}`}
                  onClick={() => setActiveSource(src)}
                >
                  {src === "Facebook" ? "FB Posts" : src === "Manual" ? "Articles" : "All Updates"}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="blog-search-wrapper glass-panel">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="search-clear">
                  <X size={14} />
                </button>
              )}
            </div>

          </div>

          {/* Grid Layout */}
          {loading ? (
            <div className="blog-loading">
              <div className="spinner"></div>
              <p>Loading updates...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="blog-empty">
              <p>No blog updates found matching your search.</p>
            </div>
          ) : (
            <motion.div 
              layout 
              className="blog-grid"
            >
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                  <motion.div
                    layout
                    key={post.id}
                    className="blog-card glass-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="blog-img-container">
                      <img src={post.image} alt={post.title} className="blog-img" />
                      <div className="blog-hover-overlay">
                        <span className="hover-read-text">Read Article</span>
                      </div>
                      <span className={`blog-source-badge ${post.source.toLowerCase()}`}>
                        {post.source === "Facebook" ? (
                          <>
                            <Facebook size={12} />
                            <span>FB Post</span>
                          </>
                        ) : (
                          <>
                            <Newspaper size={12} />
                            <span>Article</span>
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="blog-card-info">
                      <span className="blog-card-date">
                        <Calendar size={12} />
                        <span>
                          {new Date(post.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Blog Details Modal Layout */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              className="blog-modal-content glass-panel"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="lightbox-close-btn" onClick={() => setSelectedPost(null)}>
                <X size={20} />
              </button>

              <div className="blog-modal-scroll">
                {selectedPost.isVideo && selectedPost.sourceUrl ? (
                  <div className="blog-modal-video-wrapper" style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px 12px 0 0", background: "#000" }}>
                    <iframe
                      src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(selectedPost.sourceUrl)}&show_text=0&width=560`}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    ></iframe>
                  </div>
                ) : (
                  <div className="blog-modal-image-wrapper">
                    <img src={selectedPost.image} alt={selectedPost.title} />
                    <div className="blog-modal-img-gradient"></div>
                  </div>
                )}

                <div className="blog-modal-body">
                  <div className="blog-modal-meta">
                    <span className="blog-modal-date">
                      <Calendar size={14} />
                      <span>
                        {new Date(selectedPost.date).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </span>
                    <span className={`blog-source-badge ${selectedPost.source.toLowerCase()}`}>
                      {selectedPost.source === "Facebook" ? "Facebook Post" : "Website Article"}
                    </span>
                  </div>

                  <h2>{selectedPost.title}</h2>
                  <div className="lightbox-divider"></div>

                  <div className="blog-modal-article-text">
                    {selectedPost.content.split("\n").map((para, idx) => (
                      para.trim() && <p key={idx}>{para}</p>
                    ))}
                  </div>

                  <div className="blog-modal-footer">
                    {selectedPost.source === "Facebook" && selectedPost.sourceUrl && (
                      <a 
                        href={selectedPost.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-facebook-link"
                      >
                        <Facebook size={14} />
                        <span>View Original Post on Facebook</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    <button className="btn btn-close-modal" onClick={() => setSelectedPost(null)}>
                      Back to Blog Feed
                    </button>
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

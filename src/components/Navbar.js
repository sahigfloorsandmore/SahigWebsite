"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Phone, Menu, X } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      className="navbar glass-panel"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container nav-content">
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src="/images/branding/logo.png" alt="Sahig Floors and More Logo" className="logo-img" />
          <h1>Sahig <span>Floors and More</span></h1>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links desktop-nav">
          <Link href="/#services">Services</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
          <Link href="/#contact" className="btn nav-cta">
            <Phone size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Get a Quote
          </Link>
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Link href="/#services" onClick={() => setMenuOpen(false)}>Services</Link>
            <Link href="/portfolio" onClick={() => setMenuOpen(false)}>Portfolio</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/#contact" className="btn mobile-cta" onClick={() => setMenuOpen(false)}>
              Get a Quote
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Compass, Award, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./about.css";

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="about-page-wrapper">
      <Navbar />

      {/* Hero Section */}
      <header className="about-hero">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About <span>SAHIG Floors and More</span>
          </motion.h1>
          <motion.p
            className="about-hero-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            At Sahig, we believe that a floor is more than just a surface—it is the foundation of your home’s character and the stage where your life’s best moments happen.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <a href="tel:778-956-7287" className="btn btn-call">
              <Phone size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Call Us: 778-956-7287
            </a>
          </motion.div>
        </div>
      </header>

      {/* Founding / Intro Section */}
      <section className="about-intro-section">
        <div className="container">
          <div className="about-grid-two-col">
            <motion.div 
              className="about-intro-img-wrapper"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img src="/images/hero/flooring.png" alt="Wood floor installation" className="about-intro-img" />
            </motion.div>
            
            <motion.div 
              className="about-intro-content"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>Founded on Quality.<br />Built on Trust.</h2>
              <p>
                The word <strong>"Sahig"</strong> literally means <em>floor</em>, and for us, it represents our singular focus: providing the most reliable, beautiful, and durable flooring solutions for our community.
              </p>
              <p>
                From our home base in Abbotsford, we have dedicated ourselves to transforming residential and commercial spaces across Metro Vancouver and the Fraser Valley with craftsmanship that lasts a lifetime.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="about-mission-section">
        <div className="container">
          <motion.div 
            className="about-mission-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3>Our Mission</h3>
            <p>
              Our mission is simple: to provide premium flooring materials and master-level installation without the premium price tag. We bridge the gap between high-end design and competitive pricing, ensuring that every homeowner in the Lower Mainland can experience the luxury of a professionally installed floor.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Sahig Difference */}
      <section className="about-diff-section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            The Sahig Difference
          </motion.h2>

          <motion.div 
            className="about-diff-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Diff Card 1 */}
            <motion.div className="about-diff-card" variants={fadeInUp}>
              <div className="about-diff-card-icon-wrapper">
                <Compass size={24} />
              </div>
              <h3>Local Roots</h3>
              <p>
                Located at <strong>31053 Peardonville Rd</strong>, we are proud members of the Abbotsford business community. We know the local styles, the climate needs of the Pacific Northwest, and the importance of a job well done.
              </p>
            </motion.div>

            {/* Diff Card 2 */}
            <motion.div className="about-diff-card" variants={fadeInUp}>
              <div className="about-diff-card-icon-wrapper">
                <Award size={24} />
              </div>
              <h3>Exacting Standards</h3>
              <p>
                We don't settle for "good enough." Our team treats every project with a white-glove approach, ensuring precision in every cut and perfection in every plank.
              </p>
            </motion.div>

            {/* Diff Card 3 */}
            <motion.div className="about-diff-card" variants={fadeInUp}>
              <div className="about-diff-card-icon-wrapper">
                <Shield size={24} />
              </div>
              <h3>Transparent Service</h3>
              <p>
                No hidden fees, no complicated jargon. Just honest advice, clear communication, and a seamless experience from the first measurement to the final walkthrough.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Service Area Text */}
      <section className="about-service-area-section">
        <div className="container">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Serving the Lower Mainland
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            Whether you are renovating a heritage home in Vancouver, building a modern space in Langley, or upgrading your office in Chilliwack, Sahig is your local partner. We bring years of expertise and a passion for interior excellence to every doorstep in the region.
          </motion.p>
        </div>
      </section>

      {/* Let's Build / Contact & Map */}
      <section className="about-contact-section">
        <div className="container">
          <div className="about-contact-grid">
            <motion.div 
              className="about-contact-details"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>Let’s Build Something Beautiful Together.</h2>
              <p>
                Your dream floor is just a conversation away. Visit us at our Abbotsford location or reach out today to see how we can elevate your space.
              </p>
              
              <div className="about-contact-list">
                <div className="about-contact-item">
                  <div className="about-contact-icon">
                    <MapPin size={20} />
                  </div>
                  <div className="about-contact-info">
                    <span className="label">Visit Us</span>
                    <span className="value">31053 Peardonville Rd, Abbotsford, BC V2T 6K4</span>
                  </div>
                </div>

                <div className="about-contact-item">
                  <div className="about-contact-icon">
                    <Mail size={20} />
                  </div>
                  <div className="about-contact-info">
                    <span className="label">Email</span>
                    <a href="mailto:admin@sahig.ca" className="value">admin@sahig.ca</a>
                    <a href="mailto:mark@sahig.ca" className="value" style={{ marginLeft: '10px' }}>mark@sahig.ca</a>
                  </div>
                </div>

                <div className="about-contact-item">
                  <div className="about-contact-icon">
                    <Phone size={20} />
                  </div>
                  <div className="about-contact-info">
                    <span className="label">Call Us</span>
                    <a href="tel:778-956-7287" className="value">(778) 956-7287</a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="about-map-wrapper"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1647.4137781297352!2d-122.36508359315819!3d49.04660150207495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5485cab8471c7b6f%3A0x3eb7cd3c158e8bce!2s31053%20Peardonville%20Rd%2C%20Abbotsford%2C%20BC%20V2T%206K4!5e0!3m2!1sen!2sca!4v1770456583988!5m2!1sen!2sca" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Sahig Location Map"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

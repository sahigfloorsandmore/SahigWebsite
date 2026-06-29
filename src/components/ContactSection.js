"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import "./ContactSection.css";

const servicesList = [
  "Hardwood Flooring",
  "Laminate Installation",
  "Luxury Vinyl Plank (LVP)",
  "Custom Tile Work",
  "Carpet Installation",
  "Design & Build",
  "Renovations & Remodelling",
  "Floor Levelling",
  "Floor Polishing",
  "Epoxy Flakes System",
  "Metal Fabrication",
  "Garbage Disposal & Delivery",
  "Mechanical Services"
];

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Hardwood Flooring",
    contactMethod: "Email",
    message: ""
  });

  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "Hardwood Flooring",
          contactMethod: "Email",
          message: ""
        });
      } else {
        const err = await res.json();
        setErrorMessage(err.message || "Failed to submit request.");
        setStatus("error");
      }
    } catch (error) {
      setErrorMessage("Connection error. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="container contact-grid">
        
        {/* Left Column: Get Estimate Form */}
        <motion.div 
          className="contact-form-panel"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-subtitle">Project Estimation</span>
          <h2>Get a Free Estimate</h2>
          <p className="contact-desc">
            Submit your details and project type below. Our project managers will reach out to schedule an on-site consultation.
          </p>

          <form onSubmit={handleSubmit} className="contact-form glass-panel">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-fields">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="john@example.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="(604) 555-0199"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="service">Service Needed</label>
              <select 
                id="service" 
                name="service" 
                value={formData.service} 
                onChange={handleChange}
                className="form-select"
              >
                {servicesList.map((service, idx) => (
                  <option key={idx} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Contact Method</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="contactMethod" 
                    value="Email" 
                    checked={formData.contactMethod === "Email"} 
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <span>Email</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="contactMethod" 
                    value="Call" 
                    checked={formData.contactMethod === "Call"} 
                    onChange={handleChange}
                    className="radio-input"
                  />
                  <span>Phone Call</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Project Details</label>
              <textarea 
                id="message" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                rows="4"
                placeholder="Describe your project, dimensions, timelines, etc..."
                className="form-textarea"
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn form-submit-btn" 
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <span>Sending...</span>
              ) : (
                <>
                  <span>Request Estimate</span>
                  <Send size={14} />
                </>
              )}
            </button>

            {/* Status alerts */}
            {status === "success" && (
              <motion.div 
                className="alert success-alert"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle size={18} />
                <span>Estimate request submitted successfully! We will contact you shortly.</span>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div 
                className="alert error-alert"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Right Column: Office Details + Map */}
        <motion.div 
          className="contact-details-panel"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="contact-details-card glass-panel">
            <h3>Contact Info</h3>
            <div className="contact-details-stacked">
              <div className="detail-row">
                <div className="icon-badge">
                  <Phone size={18} />
                </div>
                <div className="detail-content">
                  <h4>Phone</h4>
                  <a href="tel:7789567287">(778) 956-7287</a>
                </div>
              </div>

              <div className="detail-row">
                <div className="icon-badge">
                  <Mail size={18} />
                </div>
                <div className="detail-content">
                  <h4>Email</h4>
                  <a href="mailto:admin@sahig.ca">admin@sahig.ca</a>
                </div>
              </div>

              <div className="detail-row">
                <div className="icon-badge">
                  <MapPin size={18} />
                </div>
                <div className="detail-content">
                  <h4>Office</h4>
                  <p>31053 Peardonville Rd, Abbotsford, BC V2T 6K4</p>
                </div>
              </div>

              <div className="detail-row">
                <div className="icon-badge">
                  <Clock size={18} />
                </div>
                <div className="detail-content">
                  <h4>Hours</h4>
                  <p>Mon – Fri: 8:00 AM – 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="map-wrapper glass-panel">
            <iframe 
              title="Sahig Floors Office Map"
              src="https://maps.google.com/maps?q=Sahig%20Floors%20and%20More%2C%2031053%20Peardonville%20Rd%2C%20Abbotsford%2C%20BC%20V2T%206K4&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

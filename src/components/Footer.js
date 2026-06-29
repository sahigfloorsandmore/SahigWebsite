import "./Footer.css";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="footer-logo-container">
            <img src="/images/branding/logo.png" alt="Sahig Floors and More Logo" className="footer-logo-img" />
            <h2>Sahig <span>Floors and More</span></h2>
          </div>
          <p>Professional flooring installation and general contracting services throughout the Lower Mainland and Fraser Valley.</p>
          <div className="footer-nav-links">
            <a href="/#services" className="footer-nav-link">Services</a>
            <span className="footer-nav-divider">|</span>
            <a href="/portfolio" className="footer-nav-link">Portfolio</a>
            <span className="footer-nav-divider">|</span>
            <a href="/blog" className="footer-nav-link">Blog</a>
            <span className="footer-nav-divider">|</span>
            <a href="/#about" className="footer-nav-link">About</a>
            <span className="footer-nav-divider">|</span>
            <a href="/#contact" className="footer-nav-link">Contact</a>
          </div>
        </div>
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <ul>
            <li>
              <Phone size={18} />
              <span>(778) 956-7287</span>
            </li>
            <li>
              <Mail size={18} />
              <span>admin@sahig.ca</span>
            </li>
            <li>
              <MapPin size={18} />
              <span>31053 Peardonville Rd<br/>Abbotsford, BC V2T 6K4</span>
            </li>
          </ul>
        </div>
        <div className="footer-area">
          <h3>Our Services</h3>
          <ul>
            <li>Hardwood Flooring</li>
            <li>Laminate Installation</li>
            <li>Luxury Vinyl Plank (LVP)</li>
            <li>Custom Tile Work</li>
            <li>Carpet Installation</li>
            <li>Design & Build</li>
            <li>Renovations & Remodelling</li>
            <li>Floor Levelling</li>
            <li>Floor Polishing</li>
            <li>Epoxy Flakes System</li>
            <li>Metal Fabrication</li>
            <li>Garbage Disposal & Delivery</li>
            <li>
              <a href="https://shgmechanical.ca" target="_blank" rel="noopener noreferrer" className="footer-link">
                Mechanical Services
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-area">
          <h3>Metro Vancouver</h3>
          <ul>
            <li>Vancouver</li>
            <li>Burnaby</li>
            <li>Surrey</li>
            <li>White Rock</li>
            <li>Richmond</li>
            <li>Delta</li>
            <li>North Vancouver</li>
            <li>West Vancouver</li>
            <li>Coquitlam</li>
            <li>Port Coquitlam</li>
            <li>Port Moody</li>
          </ul>
        </div>
        <div className="footer-area">
          <h3>Fraser Valley</h3>
          <ul>
            <li>Langley</li>
            <li>Abbotsford</li>
            <li>Maple Ridge</li>
            <li>Pitt Meadows</li>
            <li>Mission</li>
            <li>Chilliwack</li>
            <li>New Westminster</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Sahig Floors and More Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

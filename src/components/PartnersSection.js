"use client";

import "./PartnersSection.css";

const partners = [
  { name: "Anthem Properties", domain: "anthemproperties.com" },
  { name: "Beedie Living", domain: "beedie.ca" },
  { name: "Concord Pacific", domain: "concordpacific.com" },
  { name: "Cressey Development", domain: "cressey.com" },
  { name: "Mosaic Homes", domain: "mosaichomes.com" },
  { name: "Onni Group", domain: "onni.com" },
  { name: "Polygon Homes", domain: "polyhomes.com" },
  { name: "Townline", domain: "townline.ca" },
  { name: "Wesgroup Properties", domain: "wesgroup.ca" },
  { name: "ITC Group", domain: "itc-group.com" },
  { name: "Axiom Builders", domain: "axiombuilders.ca" }
];

// Duplicate list for seamless infinite horizontal scroll
const doublePartners = [...partners, ...partners];

export default function PartnersSection() {
  return (
    <section className="partners-section">
      <div className="container">
        <span className="partners-subtitle">Builders & Developers We Have Worked With</span>
      </div>
      <div className="partners-marquee-container">
        <div className="partners-marquee">
          {doublePartners.map((partner, index) => (
            <div key={index} className="partner-logo-item">
              <div className="partner-img-wrapper">
                <img 
                  src={`https://img.logo.dev/${partner.domain}?token=pk_Lu6RKwpDTXCSx1fR_T2f1A&size=512`} 
                  alt={partner.name}
                  className="partner-img"
                  onError={(e) => {
                    // Hide the image wrapper on load error so only the label text displays
                    e.target.parentNode.style.display = "none";
                  }}
                />
              </div>
              <span className="partner-label-text">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import "./ReviewsSection.css";

const reviews = [
  {
    name: "Franco's",
    rating: 5,
    time: "2 years ago",
    text: "I am delighted to provide my highest recommendation for MCN contracting and the team who recently completed a stunning bathroom project for me. Mark is not only exceptionally talented but also displays a remarkable level of professionalism."
  },
  {
    name: "Fred",
    rating: 5,
    time: "3 years ago",
    text: "Mark was very professional and accommodating. I had a small flooring job, but Mark completed it quickly and did a fantastic job. Price was very fair. I highly recommend MCN Floors."
  },
  {
    name: "Abe De Guzman",
    rating: 5,
    time: "11 months ago",
    text: "Highly recommended. Fast response and excellent service. Mark and his team did an awesome job of replacing our floor."
  },
  {
    name: "Marvin",
    rating: 5,
    time: "3 years ago",
    text: "I recently had the pleasure of hiring MCN Floors for a flooring installation project at my home, and I couldn't be happier with the exceptional service they provided. From start to finish, the entire experience was seamless."
  },
  {
    name: "Suchita Venugopal",
    rating: 5,
    time: "2 years ago",
    text: "I would recommend MCN Floors to anyone who is looking for a home renovation with great quality at a reasonable price. Their commitment to quality and customer satisfaction is unparalleled."
  },
  {
    name: "Splash Contracting",
    rating: 5,
    time: "2 years ago",
    text: "Working with MCN Flooring is a good choice. The quality of works and the details is always their priority we will definitely hire them again in my future project."
  },
  {
    name: "Jeck Cunan",
    rating: 5,
    time: "2 years ago",
    text: "Mark and his team did an amazing job on our floor. Highly recommended!"
  },
  {
    name: "Albert",
    rating: 5,
    time: "2 weeks ago",
    text: "Choosing Sahig Floors and More was a good decision we made. The workmanship was of quality and very professional. We highly recommend their services. Thank you."
  },
  {
    name: "Rico Santiago",
    rating: 5,
    time: "A year ago",
    text: "Very happy, guys go above and beyond. The project looks great, fantastic job MCN."
  }
];

// Duplicate list for infinite marquee effect
const doubleReviews = [...reviews, ...reviews];

export default function ReviewsSection() {
  const googleLink = "https://www.google.com/search?q=mcn+contracting+ltd&rlz=1C1HKFL_enCA1200CA1200&oq=mcn+contracting+ltd&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg90gEIODYzMmowajeoAgCwAgA&sourceid=chrome&ie=UTF-8#sv=CAESzQEKuQEStgEKd0FKaVQ0dEkweEtxMXVOaDBZREF1NEYtWWZ5LUVsT185RGdreEV0LW9iR1AyUDBXWklQRWlzenptUkpXN2htWG1Wcnc2LTlvd2pRRXdhNnFPdG9fLXVuM1RIQ2RLY3F3NEhEcFhjMjc5bHZLZWRQSG1kN3ZyTUZ3Ehd3dHRBYXMyOEc4X2gwUEVQOW9iczhRdxoiQURzcjlmUzFZRVVWMHotb3h4OGE4S1NtX1V5WHRDZFkxZxIEODA1MRoBMyoAMAA4AUAAGAAgkq--uQk6AEoCEAI";

  return (
    <section className="reviews-section">
      <div className="container">
        <div className="reviews-header">
          <span className="section-subtitle">Client Feedback</span>
        </div>
      </div>

      {/* Infinite Horizontal Scrolling Marquee */}
      <div className="reviews-marquee-container">
        <div className="reviews-marquee">
          {doubleReviews.map((review, index) => (
            <div key={index} className="review-card glass-panel">
              <div className="review-card-header">
                <div className="review-avatar">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div className="review-meta">
                  <h4>{review.name}</h4>
                  <span className="review-time">{review.time}</span>
                </div>
                <div className="review-stars">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="#ffb800" color="#ffb800" />
                  ))}
                </div>
              </div>
              <p className="review-text">"{review.text}"</p>
              <div className="google-badge-small">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container reviews-footer">
        <a 
          href={googleLink}
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-outline"
        >
          Write a Review
        </a>
      </div>
    </section>
  );
}

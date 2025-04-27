import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">EduConnect</div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Learn, Teach, and Grow Together</h1>
          <p>Join our community of learners and mentors to share knowledge, gain skills, and build connections.</p>
          
          <div className="cta-buttons">
            <Link to="/register/student" className="cta-button student">
              <span className="button-icon">👨‍🎓</span>
              Join as Student
            </Link>
            <Link to="/register/tutor" className="cta-button tutor">
              <span className="button-icon">👨‍🏫</span>
              Become a Tutor
            </Link>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <h3>Learn from Experts</h3>
          <p>Access courses from verified instructors in various fields</p>
        </div>
        <div className="feature-card">
          <h3>Share Your Knowledge</h3>
          <p>Teach others and earn while doing what you love</p>
        </div>
        <div className="feature-card">
          <h3>Community Learning</h3>
          <p>Join discussions and learn with peers</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 
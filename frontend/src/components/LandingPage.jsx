import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import courseservice from '../backend/courses.config.js';
import './LandingPage.css';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseservice.getAllCourses();
        setCourses(data.slice(0, 3)); // Get top 3 courses
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleViewCourse = (courseId) => {
    navigate('/login', { state: { from: `/courses/${courseId}` } });
  };

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

      <section className="top-courses">
        <h2>Our Top Courses</h2>
        <div className="courses-grid">
          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div key={course._id} className="course-card">
                <h3>{course.courseName}</h3>
                <p>{course.courseDescription}</p>
                <div className="course-details">
                  <span className="price">${course.coursePrice}</span>
                  <span className="students">{course.studentsEnrolled?.length || 0} students enrolled</span>
                </div>
                <button 
                  onClick={() => handleViewCourse(course._id)} 
                  className="view-course-btn"
                >
                  View Course
                </button>
              </div>
            ))
          ) : (
            <p>No courses available at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 
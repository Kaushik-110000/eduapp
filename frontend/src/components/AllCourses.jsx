import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import courseservice from '../backend/courses.config.js';
import './AllCourses.css';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseservice.getAllCourses();
        setCourses(data);
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

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="all-courses-container">
      <div className="courses-header">
        <h1>All Available Courses</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course._id} className="course-card">
                <h3>{course.courseName}</h3>
                <p>{course.courseDescription}</p>
                <div className="course-details">
                  <span className="price">${course.coursePrice}</span>
                  <span className="students">{course.studentsEnrolled?.length || 0} students enrolled</span>
                </div>
                <div className="course-tags">
                  {course.tags?.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
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
            <p className="no-courses">No courses found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AllCourses; 
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  User,
  Book,
  Bookmark,
  LogOut,
  CheckCircle,
} from "lucide-react";
import courseservice from "../../backend/courses.config";
import authservice from "../../backend/auth.config";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [student, setStudent] = useState(null);

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await courseservice.getAllCourses();
      if (res) {
        setCourses(res);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  // Fetch current student data
  const fetchStudentData = useCallback(async () => {
    try {
      await authservice.getCurrentStudent().then((res) => {
        console.log("res");
        console.log(res);
        if (res && res.status) {
          setStudent(res);
        }
      });
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchStudentData();
  }, [fetchCourses, fetchStudentData]);

  // Handler for buying/enrolling in a course
  const handleEnrollment = (courseId) => {
    console.log(`Enroll clicked for course ID: ${courseId}`);
    // TODO: call enrollment API, then update state
  };

  // Filter enrolled courses
  const enrolledCourses = student
    ? courses.filter((c) => student.coursesSubscribed.includes(c._id))
    : [];

  // Inline styles for blue & white theme
  const styles = {
    container: {
      backgroundColor: "#ffffff",
      color: "#1d4ed8",
      minHeight: "100vh",
      padding: "2rem",
    },
    header: { display: "flex", alignItems: "center", marginBottom: "1rem" },
    avatar: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      marginRight: "1rem",
    },
    greeting: { fontSize: "1.75rem", color: "#1e3a8a" },
    studentInfo: {
      display: "flex",
      flexDirection: "column",
      marginBottom: "2rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      padding: "1rem",
      backgroundColor: "#f3f4f6",
    },
    infoRow: { marginBottom: "0.5rem", color: "#374151" },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1rem",
    },
    sectionTitle: {
      fontSize: "1.5rem",
      margin: "1.5rem 0 1rem",
      color: "#1e40af",
    },
    card: {
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      padding: "1rem",
      backgroundColor: "#f9fafb",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    title: { fontSize: "1.25rem", marginBottom: "0.5rem", color: "#1e40af" },
    desc: { fontSize: "0.9rem", marginBottom: "1rem", color: "#374151" },
    price: { fontWeight: "bold", marginBottom: "1rem", color: "#111827" },
    button: {
      backgroundColor: "#1d4ed8",
      color: "#fff",
      border: "none",
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      cursor: "pointer",
    },
    enrolledTag: {
      display: "inline-flex",
      alignItems: "center",
      color: "#10b981",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header and Student Info */}
      <div style={styles.header}>
        {student && (
          <img
            src={student.avatar}
            alt={student.studentName}
            style={styles.avatar}
          />
        )}
        <h1 style={styles.greeting}>
          Welcome, {student?.studentName || "Student"}!
        </h1>
      </div>
      {student && (
        <div style={styles.studentInfo}>
          <div style={styles.infoRow}>
            <strong>Email:</strong> {student.email}
          </div>
          <div style={styles.infoRow}>
            <strong>Student ID:</strong> {student.studentID}
          </div>
          <div style={styles.infoRow}>
            <strong>Interests:</strong> {student.interests.join(", ")}
          </div>
          <div style={styles.infoRow}>
            <strong>Member Since:</strong>{" "}
            {new Date(student.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <h2 style={styles.sectionTitle}>My Courses</h2>
      {enrolledCourses.length > 0 ? (
        <div style={styles.grid}>
          {enrolledCourses.map((course) => (
            <div key={course._id} style={styles.card}>
              <h3 style={styles.title}>{course.courseName}</h3>
              <p style={styles.desc}>{course.courseDescription}</p>
              <p style={styles.price}>${course.coursePrice}</p>
              <span style={styles.enrolledTag}>
                <CheckCircle size={16} style={{ marginRight: "0.25rem" }} />
                Enrolled
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>No courses enrolled yet.</p>
      )}

      {/* Available Courses Section */}
      <h2 style={styles.sectionTitle}>Available Courses</h2>
      <div style={styles.grid}>
        {courses.map((course) => {
          const isEnrolled = student?.coursesSubscribed.includes(course._id);
          return (
            <div key={course._id} style={styles.card}>
              <h3 style={styles.title}>{course.courseName}</h3>
              <p style={styles.desc}>{course.courseDescription}</p>
              <p style={styles.price}>${course.coursePrice}</p>
              {isEnrolled ? (
                <span style={styles.enrolledTag}>
                  <CheckCircle size={16} style={{ marginRight: "0.25rem" }} />
                  Enrolled
                </span>
              ) : (
                <button
                  style={styles.button}
                  onClick={() => handleEnrollment(course._id)}
                >
                  Buy
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;

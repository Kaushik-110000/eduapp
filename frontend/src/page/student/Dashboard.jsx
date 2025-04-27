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
  Calendar,
  Mail,
  Hash,
  Tag,
} from "lucide-react";
import courseservice from "../../backend/courses.config";
import studentService from "../../backend/student.config";
import paymentService from "../../backend/payment.config";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Fetch current student data
  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      const studentData = await studentService.getCurrentStudent();
      console.log("Student data response:", studentData);
      
      if (studentData) {
        setStudent(studentData);
      } else {
        setError("No student data received");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      setError(error.message || "Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchCourses();
    fetchStudentData();
  }, [fetchCourses, fetchStudentData]);

  // Handler for buying/enrolling in a course
  const handleEnrollment = async (courseId) => {
    try {
      setPaymentLoading(true);
      console.log(`Initiating enrollment for course ID: ${courseId}`);

      // Generate payment order
      const orderResponse = await paymentService.generateOrder(courseId);
      console.log("Payment order generated:", orderResponse);

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: "EduApp",
        description: "Course Enrollment",
        order_id: orderResponse.data.id,
        handler: async function (response) {
          try {
            console.log("Payment successful:", response);
            
            // Verify payment and enroll
            const paymentData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              email: student.email,
              courseID: courseId,
            };

            await paymentService.verifyPayment(paymentData);
            console.log("Payment verified and course enrolled");

            // Refresh student data to update enrolled courses
            await fetchStudentData();
            await fetchCourses();
          } catch (error) {
            console.error("Error in payment verification:", error);
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: student.studentName,
          email: student.email,
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error in enrollment process:", error);
      setError("Failed to initiate enrollment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Filter enrolled courses
  const enrolledCourses = student?.coursesSubscribed 
    ? courses.filter((c) => student.coursesSubscribed.includes(c._id))
    : [];

  // Enhanced styles for a more professional look
  const styles = {
    container: {
      backgroundColor: "#f8fafc",
      color: "#1e293b",
      minHeight: "100vh",
      padding: "2rem",
      maxWidth: "1400px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      alignItems: "center",
      marginBottom: "2rem",
      padding: "1.5rem",
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      marginRight: "1.5rem",
      border: "3px solid #e2e8f0",
      objectFit: "cover",
    },
    greeting: {
      fontSize: "2rem",
      color: "#0f172a",
      fontWeight: "600",
      margin: 0,
    },
    studentInfo: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2.5rem",
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    infoCard: {
      display: "flex",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: "#f8fafc",
      borderRadius: "0.75rem",
      gap: "1rem",
    },
    infoIcon: {
      color: "#3b82f6",
      backgroundColor: "#dbeafe",
      padding: "0.75rem",
      borderRadius: "0.5rem",
    },
    infoContent: {
      display: "flex",
      flexDirection: "column",
    },
    infoLabel: {
      fontSize: "0.875rem",
      color: "#64748b",
      marginBottom: "0.25rem",
    },
    infoValue: {
      fontSize: "1rem",
      color: "#0f172a",
      fontWeight: "500",
    },
    sectionTitle: {
      fontSize: "1.5rem",
      margin: "2rem 0 1.5rem",
      color: "#0f172a",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "1.5rem",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
      border: "1px solid #e2e8f0",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
    title: {
      fontSize: "1.25rem",
      marginBottom: "0.75rem",
      color: "#0f172a",
      fontWeight: "600",
    },
    desc: {
      fontSize: "0.875rem",
      marginBottom: "1rem",
      color: "#64748b",
      lineHeight: "1.5",
    },
    price: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "1rem",
    },
    button: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      fontWeight: "500",
      transition: "background-color 0.2s",
      width: "100%",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
    },
    enrolledTag: {
      display: "inline-flex",
      alignItems: "center",
      color: "#059669",
      backgroundColor: "#d1fae5",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      fontWeight: "500",
      gap: "0.5rem",
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      color: "#64748b",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading student data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header and Student Info */}
      <div style={styles.header}>
        {student?.avatar && (
          <img
            src={student.avatar}
            alt={student.studentName || "Student"}
            style={styles.avatar}
          />
        )}
        <h1 style={styles.greeting}>
          Welcome back, {student?.studentName || "Student"}!
        </h1>
      </div>

      {student && (
        <div style={styles.studentInfo}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <Mail size={20} />
            </div>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{student.email || "Not provided"}</span>
            </div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <Hash size={20} />
            </div>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Student ID</span>
              <span style={styles.infoValue}>{student.studentID || "Not provided"}</span>
            </div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <Tag size={20} />
            </div>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Interests</span>
              <span style={styles.infoValue}>
                {student.interests?.length > 0 
                  ? student.interests.join(", ") 
                  : "No interests specified"}
              </span>
            </div>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>
              <Calendar size={20} />
            </div>
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Member Since</span>
              <span style={styles.infoValue}>
                {student.createdAt 
                  ? new Date(student.createdAt).toLocaleDateString()
                  : "Not available"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <h2 style={styles.sectionTitle}>
        <Book size={24} />
        My Courses
      </h2>
      {enrolledCourses.length > 0 ? (
        <div style={styles.grid}>
          {enrolledCourses.map((course) => (
            <div 
              key={course._id} 
              style={styles.card}
              onClick={() => navigate(`/student/course/${course._id}`)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/student/course/${course._id}`);
                }
              }}
            >
              <h3 style={styles.title}>{course.courseName}</h3>
              <p style={styles.desc}>{course.courseDescription}</p>
              <p style={styles.price}>${course.coursePrice}</p>
              <span style={styles.enrolledTag}>
                <CheckCircle size={16} />
                Enrolled
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>You haven't enrolled in any courses yet.</p>
        </div>
      )}

      {/* Available Courses Section */}
      <h2 style={styles.sectionTitle}>
        <Bookmark size={24} />
        Available Courses
      </h2>
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
                  <CheckCircle size={16} />
                  Enrolled
                </span>
              ) : (
                <button
                  style={{
                    ...styles.button,
                    opacity: paymentLoading ? 0.7 : 1,
                    cursor: paymentLoading ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handleEnrollment(course._id)}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? "Processing..." : "Enroll Now"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          backgroundColor: "#ef4444",
          color: "white",
          padding: "1rem",
          borderRadius: "0.5rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          zIndex: 1000,
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

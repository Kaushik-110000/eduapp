import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Hash,
  Calendar,
  Book,
  LogOut,
  Home,
  Users,
  BookOpen,
  Settings,
  MessageSquare,
  BarChart,
  Menu,
  X,
  Plus,
  Edit,
  Trash,
  DollarSign,
  Tag,
} from "lucide-react";
import tutorService from "../../backend/tutor.config";
import courseService from "../../backend/course.config";

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    courseDescription: '',
    coursePrice: '',
    tags: '',
  });

  // Fetch current tutor data
  const fetchTutorData = useCallback(async () => {
    try {
      setLoading(true);
      const tutorData = await tutorService.getCurrentTutor();
      console.log("Tutor data response:", tutorData);
      
      if (tutorData) {
        setTutor(tutorData);
      } else {
        setError("No tutor data received");
      }
    } catch (error) {
      console.error("Error fetching tutor:", error);
      setError(error.message || "Failed to fetch tutor data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tutor's courses
  const fetchCourses = useCallback(async () => {
    try {
      if (tutor?.coursesTaught?.length > 0) {
        // Fetch full course details for each course ID
        const coursePromises = tutor.coursesTaught.map(courseId => 
          courseService.getCourse(courseId)
        );
        const coursesData = await Promise.all(coursePromises);
        setCourses(coursesData.filter(course => course)); // Filter out any null/undefined results
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses");
    }
  }, [tutor]);

  useEffect(() => {
    fetchTutorData();
  }, [fetchTutorData]);

  useEffect(() => {
    if (tutor && activeSection === 'courses') {
      fetchCourses();
    }
  }, [tutor, activeSection, fetchCourses]);

  // Handle course creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        ...newCourse,
        coursePrice: parseFloat(newCourse.coursePrice),
        tags: newCourse.tags.split(',').map(tag => tag.trim()),
      };

      await tutorService.createCourse(courseData);
      
      setIsAddingCourse(false);
      setNewCourse({
        courseName: '',
        courseDescription: '',
        coursePrice: '',
        tags: '',
      });
      
      // Refresh tutor data to get updated coursesTaught array
      await fetchTutorData();
    } catch (error) {
      console.error("Error creating course:", error);
      setError("Failed to create course");
    }
  };

  // Handle course deletion
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        
        // Update the tutor's coursesTaught array
        const updatedTutor = {
          ...tutor,
          coursesTaught: tutor.coursesTaught.filter(id => id !== courseId)
        };
        await tutorService.updateTutor(tutor._id, updatedTutor);
        
        // Refresh both tutor data and courses
        await fetchTutorData();
        await fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        setError("Failed to delete course");
      }
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Enhanced styles for a more professional look
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      position: "relative",
    },
    sidebar: {
      width: "250px",
      backgroundColor: "#ffffff",
      borderRight: "1px solid #e2e8f0",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      height: "100vh",
      zIndex: 1000,
      transition: "transform 0.3s ease-in-out",
      "@media (max-width: 768px)": {
        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
      },
    },
    mainContent: {
      flex: 1,
      padding: "2rem",
      maxWidth: "1400px",
      margin: "0 auto",
      marginLeft: "250px",
      "@media (max-width: 768px)": {
        marginLeft: 0,
        padding: "1rem",
      },
    },
    mobileHeader: {
      display: "none",
      "@media (max-width: 768px)": {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 900,
      },
    },
    menuButton: {
      display: "none",
      "@media (max-width: 768px)": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#64748b",
        "&:hover": {
          color: "#0f172a",
        },
      },
    },
    navItem: {
      display: "flex",
      alignItems: "center",
      padding: "0.75rem 1rem",
      marginBottom: "0.5rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      transition: "all 0.2s",
      color: "#64748b",
      textDecoration: "none",
      "&:hover": {
        backgroundColor: "#f1f5f9",
        color: "#0f172a",
      },
    },
    activeNavItem: {
      backgroundColor: "#dbeafe",
      color: "#3b82f6",
      fontWeight: "500",
    },
    navIcon: {
      marginRight: "0.75rem",
      width: "20px",
      height: "20px",
    },
    header: {
      display: "flex",
      alignItems: "center",
      marginBottom: "2rem",
      padding: "1.5rem",
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      "@media (max-width: 768px)": {
        marginBottom: "1rem",
        padding: "1rem",
      },
    },
    avatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      marginRight: "1.5rem",
      border: "3px solid #e2e8f0",
      objectFit: "cover",
      "@media (max-width: 768px)": {
        width: "60px",
        height: "60px",
        marginRight: "1rem",
      },
    },
    greeting: {
      fontSize: "2rem",
      color: "#0f172a",
      fontWeight: "600",
      margin: 0,
      "@media (max-width: 768px)": {
        fontSize: "1.5rem",
      },
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
      "@media (max-width: 768px)": {
        gridTemplateColumns: "1fr",
        gap: "1rem",
        padding: "1rem",
      },
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
      "@media (max-width: 768px)": {
        fontSize: "1.25rem",
        margin: "1.5rem 0 1rem",
      },
    },
    logoutButton: {
      backgroundColor: "#ef4444",
      color: "#ffffff",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      fontWeight: "500",
      transition: "background-color 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "auto",
      "&:hover": {
        backgroundColor: "#dc2626",
      },
    },
    overlay: {
      display: "none",
      "@media (max-width: 768px)": {
        display: isSidebarOpen ? "block" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 999,
      },
    },
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'students', label: 'My Students', icon: <Users size={20} /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { id: 'sessions', label: 'Sessions', icon: <Calendar size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  // Add new styles for courses section
  const courseStyles = {
    courseGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "1.5rem",
      marginTop: "1.5rem",
    },
    courseCard: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
    courseHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "1rem",
    },
    courseTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
    },
    coursePrice: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "#059669",
      fontWeight: "500",
    },
    courseDescription: {
      color: "#64748b",
      marginBottom: "1rem",
      lineHeight: "1.5",
    },
    courseTags: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginBottom: "1rem",
    },
    tag: {
      backgroundColor: "#e2e8f0",
      color: "#475569",
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
      fontSize: "0.875rem",
    },
    courseActions: {
      display: "flex",
      gap: "0.5rem",
      marginTop: "1rem",
    },
    actionButton: {
      padding: "0.5rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    editButton: {
      backgroundColor: "#dbeafe",
      color: "#3b82f6",
      "&:hover": {
        backgroundColor: "#bfdbfe",
      },
    },
    deleteButton: {
      backgroundColor: "#fee2e2",
      color: "#ef4444",
      "&:hover": {
        backgroundColor: "#fecaca",
      },
    },
    addCourseButton: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1.5rem",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
    },
    courseForm: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    formGroup: {
      marginBottom: "1rem",
    },
    formLabel: {
      display: "block",
      marginBottom: "0.5rem",
      color: "#475569",
      fontWeight: "500",
    },
    formInput: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      "&:focus": {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    formTextarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      minHeight: "100px",
      resize: "vertical",
      "&:focus": {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    formActions: {
      display: "flex",
      gap: "1rem",
      marginTop: "1.5rem",
    },
    submitButton: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
    },
    cancelButton: {
      backgroundColor: "#e2e8f0",
      color: "#475569",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#cbd5e1",
      },
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem", width: "100%" }}>
          Loading tutor data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem", color: "red", width: "100%" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      <div style={styles.mobileHeader}>
        <button
          style={styles.menuButton}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a" }}>
          Tutor Portal
        </h1>
      </div>

      {/* Overlay for mobile */}
      <div style={styles.overlay} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar Navigation */}
      <div id="sidebar" style={styles.sidebar}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a" }}>
            Tutor Portal
          </h2>
        </div>
        
        {navItems.map((item) => (
          <div
            key={item.id}
            style={{
              ...styles.navItem,
              ...(activeSection === item.id ? styles.activeNavItem : {}),
            }}
            onClick={() => {
              setActiveSection(item.id);
              if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
              }
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}

        <button
          style={styles.logoutButton}
          onClick={() => {
            tutorService.logout();
            navigate("/login");
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header and Tutor Info */}
        <div style={styles.header}>
          {tutor?.avatar && (
            <img
              src={tutor.avatar}
              alt={tutor.tutorName || "Tutor"}
              style={styles.avatar}
            />
          )}
          <h1 style={styles.greeting}>
            Welcome back, {tutor?.tutorName || "Tutor"}!
          </h1>
        </div>

        {tutor && (
          <div style={styles.studentInfo}>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <Mail size={20} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{tutor.email || "Not provided"}</span>
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <Hash size={20} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Tutor ID</span>
                <span style={styles.infoValue}>{tutor.tutorID || "Not provided"}</span>
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>
                <Book size={20} />
              </div>
              <div style={styles.infoContent}>
                <span style={styles.infoLabel}>Courses Taught</span>
                <span style={styles.infoValue}>
                  {tutor.coursesTaught?.length > 0 
                    ? `${tutor.coursesTaught.length} courses` 
                    : "No courses assigned"}
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
                  {tutor.createdAt 
                    ? new Date(tutor.createdAt).toLocaleDateString()
                    : "Not available"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Description Section */}
        <h2 style={styles.sectionTitle}>
          <User size={24} />
          About Me
        </h2>
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <p style={{
            fontSize: "1rem",
            color: "#1e293b",
            lineHeight: "1.6",
          }}>
            {tutor?.description || "No description provided"}
          </p>
        </div>

        {activeSection === 'courses' && (
          <>
            <h2 style={styles.sectionTitle}>
              <BookOpen size={24} />
              My Courses
            </h2>

            {!isAddingCourse ? (
              <button
                style={courseStyles.addCourseButton}
                onClick={() => setIsAddingCourse(true)}
              >
                <Plus size={20} />
                Add New Course
              </button>
            ) : (
              <div style={courseStyles.courseForm}>
                <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: "600" }}>
                  Create New Course
                </h3>
                <form onSubmit={handleCreateCourse}>
                  <div style={courseStyles.formGroup}>
                    <label style={courseStyles.formLabel}>Course Name</label>
                    <input
                      type="text"
                      style={courseStyles.formInput}
                      value={newCourse.courseName}
                      onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                      required
                    />
                  </div>
                  <div style={courseStyles.formGroup}>
                    <label style={courseStyles.formLabel}>Description</label>
                    <textarea
                      style={courseStyles.formTextarea}
                      value={newCourse.courseDescription}
                      onChange={(e) => setNewCourse({ ...newCourse, courseDescription: e.target.value })}
                      required
                    />
                  </div>
                  <div style={courseStyles.formGroup}>
                    <label style={courseStyles.formLabel}>Price ($)</label>
                    <input
                      type="number"
                      style={courseStyles.formInput}
                      value={newCourse.coursePrice}
                      onChange={(e) => setNewCourse({ ...newCourse, coursePrice: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div style={courseStyles.formGroup}>
                    <label style={courseStyles.formLabel}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      style={courseStyles.formInput}
                      value={newCourse.tags}
                      onChange={(e) => setNewCourse({ ...newCourse, tags: e.target.value })}
                      placeholder="e.g., math, algebra, calculus"
                    />
                  </div>
                  <div style={courseStyles.formActions}>
                    <button type="submit" style={courseStyles.submitButton}>
                      Create Course
                    </button>
                    <button
                      type="button"
                      style={courseStyles.cancelButton}
                      onClick={() => setIsAddingCourse(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {courses.length > 0 ? (
              <div style={courseStyles.courseGrid}>
                {courses.map((course) => (
                  <div 
                    key={course._id} 
                    style={courseStyles.courseCard}
                    onClick={() => navigate(`/tutor/course/${course._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/tutor/course/${course._id}`);
                      }
                    }}
                  >
                    <div style={courseStyles.courseHeader}>
                      <h3 style={courseStyles.courseTitle}>{course.courseName}</h3>
                      <div style={courseStyles.coursePrice}>
                        <DollarSign size={16} />
                        {course.coursePrice}
                      </div>
                    </div>
                    <p style={courseStyles.courseDescription}>{course.courseDescription}</p>
                    <div style={courseStyles.courseTags}>
                      {course.tags?.map((tag, index) => (
                        <span key={index} style={courseStyles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div style={courseStyles.courseActions}>
                      <button
                        style={{ ...courseStyles.actionButton, ...courseStyles.editButton }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-course/${course._id}`);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        style={{ ...courseStyles.actionButton, ...courseStyles.deleteButton }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course._id);
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "3rem",
                backgroundColor: "#ffffff",
                borderRadius: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}>
                <BookOpen size={48} style={{ color: "#94a3b8", marginBottom: "1rem" }} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>
                  No Courses Yet
                </h3>
                <p style={{ color: "#64748b" }}>
                  Start by creating your first course using the "Add New Course" button above.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;
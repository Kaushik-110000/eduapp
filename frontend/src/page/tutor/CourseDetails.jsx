import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Video,
  Plus,
  Edit,
  Trash,
  DollarSign,
  Tag,
  Users,
  ArrowLeft,
} from "lucide-react";
import courseService from "../../backend/course.config";

const CourseDetails = () => {
  const { courseId } = useParams();
  console.log(courseId)
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [newVideo, setNewVideo] = useState({
    url: '',
  });

  // Fetch course details
  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourse(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Fetch course videos
  const fetchVideos = useCallback(async () => {
    try {
      const videosData = await courseService.getAllVideos(courseId);
      setVideos(videosData || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to fetch course videos");
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
    fetchVideos();
  }, [fetchCourseDetails, fetchVideos]);

  // Function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  // Handle video creation
  const handleCreateVideo = async (e) => {
    e.preventDefault();
    try {
      const embedUrl = getYouTubeEmbedUrl(newVideo.url);
      if (!embedUrl) {
        setError("Please enter a valid YouTube URL");
        return;
      }

      // Log the data being sent
      console.log("Sending video data:", {
        url: embedUrl,
        courseID: courseId
      });

      const videoData = await courseService.createVideoRoom({
        url: embedUrl,
        courseID: courseId
      });
      
      console.log("Video creation response:", videoData);
      
      setIsCreatingVideo(false);
      setNewVideo({ url: '' });
      fetchVideos(); // Refresh videos list
    } catch (error) {
      console.error("Error creating video:", error);
      setError(error.response?.data?.message || "Failed to create video session");
    }
  };

  const styles = {
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem",
    },
    header: {
      display: "flex",
      alignItems: "center",
      marginBottom: "2rem",
      gap: "1rem",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      backgroundColor: "#f1f5f9",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer",
      color: "#475569",
      "&:hover": {
        backgroundColor: "#e2e8f0",
      },
    },
    courseInfo: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "2rem",
      marginBottom: "2rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    courseHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "1.5rem",
    },
    courseTitle: {
      fontSize: "2rem",
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
      fontSize: "1.25rem",
    },
    courseDescription: {
      color: "#475569",
      marginBottom: "1.5rem",
      lineHeight: "1.6",
    },
    courseTags: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginBottom: "1.5rem",
    },
    tag: {
      backgroundColor: "#e2e8f0",
      color: "#475569",
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
      fontSize: "0.875rem",
    },
    courseStats: {
      display: "flex",
      gap: "2rem",
      marginTop: "1.5rem",
      paddingTop: "1.5rem",
      borderTop: "1px solid #e2e8f0",
    },
    stat: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "#64748b",
    },
    videosSection: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "2rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    sectionTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#0f172a",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    addVideoButton: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem 1.5rem",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
    },
    videoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "1.5rem",
    },
    videoCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      },
    },
    videoTitle: {
      fontSize: "1.25rem",
      fontWeight: "500",
      color: "#0f172a",
      marginBottom: "0.5rem",
    },
    videoInfo: {
      color: "#64748b",
      marginBottom: "1rem",
    },
    videoActions: {
      display: "flex",
      gap: "0.5rem",
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
  };

  // Add new styles for video form
  const videoFormStyles = {
    form: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "2rem",
      marginBottom: "2rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    formTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "1.5rem",
    },
    formGroup: {
      marginBottom: "1.5rem",
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
      fontSize: "1rem",
      "&:focus": {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    formActions: {
      display: "flex",
      gap: "1rem",
      marginTop: "2rem",
    },
    submitButton: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "500",
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
      fontSize: "1rem",
      fontWeight: "500",
      "&:hover": {
        backgroundColor: "#cbd5e1",
      },
    },
  };

  // Add iframe styles
  const iframeStyles = {
    width: "100%",
    height: "200px",
    border: "none",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading course details...
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
      <div style={styles.header}>
        <button
          style={styles.backButton}
          onClick={() => navigate("/tutor/dashboard")}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      {course && (
        <div style={styles.courseInfo}>
          <div style={styles.courseHeader}>
            <h1 style={styles.courseTitle}>{course.courseName}</h1>
            <div style={styles.coursePrice}>
              <DollarSign size={24} />
              {course.coursePrice}
            </div>
          </div>
          <p style={styles.courseDescription}>{course.courseDescription}</p>
          <div style={styles.courseTags}>
            {course.tags?.map((tag, index) => (
              <span key={index} style={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <div style={styles.courseStats}>
            <div style={styles.stat}>
              <Users size={20} />
              <span>{course.studentsEnrolled?.length || 0} Students</span>
            </div>
            <div style={styles.stat}>
              <Video size={20} />
              <span>{videos.length} Videos</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.videosSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <Video size={24} />
            Course Videos
          </h2>
          <button
            style={styles.addVideoButton}
            onClick={() => setIsCreatingVideo(true)}
          >
            <Plus size={20} />
            Add New Video
          </button>
        </div>

        {isCreatingVideo && (
          <div style={videoFormStyles.form}>
            <h3 style={videoFormStyles.formTitle}>Add New Video</h3>
            <form onSubmit={handleCreateVideo}>
              <div style={videoFormStyles.formGroup}>
                <label style={videoFormStyles.formLabel}>YouTube Video URL</label>
                <input
                  type="url"
                  style={videoFormStyles.formInput}
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  placeholder="Enter YouTube video URL (e.g., https://youtu.be/8wFdbwtr61I)"
                  required
                />
              </div>
              {newVideo.url && getYouTubeEmbedUrl(newVideo.url) && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ marginBottom: "0.5rem", color: "#475569" }}>Preview:</p>
                  <iframe
                    src={getYouTubeEmbedUrl(newVideo.url)}
                    style={iframeStyles}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div style={videoFormStyles.formActions}>
                <button type="submit" style={videoFormStyles.submitButton}>
                  Create Video
                </button>
                <button
                  type="button"
                  style={videoFormStyles.cancelButton}
                  onClick={() => {
                    setIsCreatingVideo(false);
                    setNewVideo({ url: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {videos.length > 0 ? (
          <div style={styles.videoGrid}>
            {videos.map((video) => (
              <div key={video._id} style={styles.videoCard}>
                <iframe
                  src={video.url}
                  style={iframeStyles}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div style={styles.videoInfo}>
                  <p>Started: {new Date(video.startTime).toLocaleString()}</p>
                  {video.endTime && (
                    <p>Ended: {new Date(video.endTime).toLocaleString()}</p>
                  )}
                  <p>Status: {video.endTime ? 'Completed' : 'Active'}</p>
                </div>
                <div style={styles.videoActions}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...styles.actionButton,
                      ...styles.editButton,
                      textDecoration: 'none',
                    }}
                  >
                    Open in YouTube
                  </a>
                  <button
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    onClick={() => handleDeleteVideo(video._id)}
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
            backgroundColor: "#f8fafc",
            borderRadius: "0.75rem",
          }}>
            <Video size={48} style={{ color: "#94a3b8", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>
              No Videos Yet
            </h3>
            <p style={{ color: "#64748b" }}>
              Start by adding your first video using the "Add New Video" button above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails; 
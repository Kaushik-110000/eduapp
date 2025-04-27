import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Video, MessageSquare, ArrowLeft, Send, Star } from "lucide-react";
import courseService from "../../backend/course.config";
import studentService from "../../backend/student.config";
import videosService from "../../backend/videos.config";
import Courseservice from "../../backend/courses.config";

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Fetch course, student, and videos data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, studentData, videosData] = await Promise.all([
          courseService.getCourse(courseId),
          studentService.getCurrentStudent(),
          videosService.getVideosByCourseId(courseId),
        //   Courseservice.getVideoComments(videoId)
        ]);
        console.log(courseData, studentData, videosData);
        setCourse(courseData);
        setStudent(studentData);
        setVideos(videosData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SERVER_URL || "http://localhost:8011";
    console.log("Connecting to socket server:", socketUrl);

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket");
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle video selection and socket room joining
  useEffect(() => {
    if (selectedVideo && socketRef.current) {
      console.log("Joining video room:", selectedVideo._id);
      socketRef.current.emit("joinVideoRoom", { videoId: selectedVideo._id });
    }
  }, [selectedVideo]);

  // Socket event listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const handleLoadMessages = (loadedMessages) => {
      console.log("Received messages:", loadedMessages);
      setMessages(loadedMessages);
    };

    const handleNewMessage = (message) => {
      console.log("New message received:", message);
      setMessages((prev) => [...prev, message]);
    };

    socketRef.current.on("loadMessages", handleLoadMessages);
    socketRef.current.on("newMessage", handleNewMessage);

    return () => {
      socketRef.current.off("loadMessages", handleLoadMessages);
      socketRef.current.off("newMessage", handleNewMessage);
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedVideo || !student) {
      console.log("Cannot send message:", {
        newMessage,
        selectedVideo,
        student,
      });
      return;
    }

    console.log("Sending message:", {
      videoId: selectedVideo._id,
      message: newMessage,
      user: {
        id: student._id,
        name: student.studentName,
      },
    });

    socketRef.current.emit("sendMessage", {
      videoId: selectedVideo._id,
      message: newMessage,
      user: {
        id: student._id,
        name: student.studentName,
      },
    });

    setNewMessage("");
  };

  // Fetch comments when video is selected
  useEffect(() => {
    const fetchComments = async () => {
      if (selectedVideo) {
        try {
          setCommentLoading(true);
          const commentsData = await Courseservice.getVideoComments(selectedVideo._id);
          setComments(commentsData);
        } catch (error) {
          console.error("Error fetching comments:", error);
        } finally {
          setCommentLoading(false);
        }
      }
    };

    fetchComments();
  }, [selectedVideo]);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedVideo || !student) return;

    try {
      const commentData = {
        content: newComment,
        studentId: student._id,
        videoId: selectedVideo._id
      };

      const response = await Courseservice.postComments(commentData);
      setComments(prev => [...prev, response]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const styles = {
    container: {
      maxWidth: "1400px",
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
    courseTitle: {
      fontSize: "2rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
    },
    courseDescription: {
      color: "#475569",
      marginTop: "1rem",
      lineHeight: "1.6",
    },
    mainContent: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "2rem",
    },
    videoSection: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "2rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    videoPlayer: {
      width: "100%",
      aspectRatio: "16/9",
      marginBottom: "1rem",
      borderRadius: "0.5rem",
    },
    videoList: {
      marginTop: "2rem",
    },
    videoItem: {
      display: "flex",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: "#f8fafc",
      borderRadius: "0.5rem",
      marginBottom: "0.5rem",
      cursor: "pointer",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#e2e8f0",
      },
    },
    videoItemActive: {
      backgroundColor: "#dbeafe",
    },
    chatSection: {
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      padding: "2rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    chatHeader: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "1rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #e2e8f0",
    },
    chatMessages: {
      flex: 1,
      overflowY: "auto",
      marginBottom: "1rem",
      padding: "1rem",
      backgroundColor: "#f8fafc",
      borderRadius: "0.5rem",
    },
    message: {
      marginBottom: "1rem",
      padding: "0.75rem",
      backgroundColor: "#ffffff",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    messageHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "0.5rem",
    },
    messageUser: {
      fontWeight: "500",
      color: "#0f172a",
    },
    messageTime: {
      fontSize: "0.875rem",
      color: "#64748b",
    },
    messageText: {
      color: "#475569",
    },
    chatInput: {
      display: "flex",
      gap: "1rem",
    },
    messageInput: {
      flex: 1,
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      "&:focus": {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    sendButton: {
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
    reviewSection: {
      marginTop: "2rem",
      padding: "1.5rem",
      backgroundColor: "#ffffff",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    reviewTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#0f172a",
      marginBottom: "1rem",
    },
    commentForm: {
      marginBottom: "2rem",
    },
    commentInput: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      marginBottom: "1rem",
      resize: "vertical",
      "&:focus": {
        outline: "none",
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    submitButton: {
      padding: "0.75rem 1.5rem",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "0.5rem",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#2563eb",
      },
      "&:disabled": {
        backgroundColor: "#94a3b8",
        cursor: "not-allowed",
      },
    },
    commentsList: {
      marginTop: "1rem",
    },
    commentCard: {
      padding: "1rem",
      backgroundColor: "#f8fafc",
      borderRadius: "0.5rem",
      marginBottom: "1rem",
    },
    commentHeader: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "0.5rem",
    },
    commentUser: {
      fontWeight: "500",
      color: "#0f172a",
    },
    commentDate: {
      fontSize: "0.875rem",
      color: "#64748b",
    },
    commentText: {
      color: "#475569",
      lineHeight: "1.5",
    },
    loadingText: {
      textAlign: "center",
      color: "#64748b",
      padding: "1rem",
    },
    noComments: {
      textAlign: "center",
      color: "#64748b",
      padding: "1rem",
      fontStyle: "italic",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading course...
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
          onClick={() => navigate("/student/dashboard")}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      {course && (
        <div style={styles.courseInfo}>
          <h1 style={styles.courseTitle}>{course.courseName}</h1>
          <p style={styles.courseDescription}>{course.courseDescription}</p>
        </div>
      )}

      <div style={styles.mainContent}>
        <div style={styles.videoSection}>
          {selectedVideo ? (
            <iframe
              src={selectedVideo.url}
              style={styles.videoPlayer}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Select a video to start watching
            </div>
          )}

          <div style={styles.videoList}>
            {videos?.length > 0 &&
              videos.map((video) => (
                <div
                  key={video._id}
                  style={{
                    ...styles.videoItem,
                    ...(selectedVideo?._id === video._id &&
                      styles.videoItemActive),
                  }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <Video size={20} style={{ marginRight: "1rem" }} />
                  <span>Video Session</span>
                </div>
              ))}
          </div>

          {/* Review Section */}
          {selectedVideo && (
            <div style={styles.reviewSection}>
              <h3 style={styles.reviewTitle}>Reviews</h3>
              
              {/* Comment Form */}
              <form style={styles.commentForm} onSubmit={handleSubmitComment}>
                <textarea
                  style={styles.commentInput}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your review..."
                  rows={3}
                />
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={!newComment.trim() || commentLoading}
                >
                  {commentLoading ? "Posting..." : "Post Review"}
                </button>
              </form>

              {/* Comments List */}
              <div style={styles.commentsList}>
                {commentLoading ? (
                  <div style={styles.loadingText}>Loading reviews...</div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} style={styles.commentCard}>
                      <div style={styles.commentHeader}>
                        <span style={styles.commentUser}>
                          {comment.studentId?.studentName || "Anonymous"}
                        </span>
                        <span style={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={styles.commentText}>{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <div style={styles.noComments}>No reviews yet. Be the first to review!</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.chatSection}>
          <div style={styles.chatHeader}>
            <MessageSquare size={20} />
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Live Chat</h2>
          </div>

          <div style={styles.chatMessages}>
            {messages?.length > 0 &&
              messages.map((message) => (
                <div key={message.id} style={styles.message}>
                  <div style={styles.messageHeader}>
                    <span style={styles.messageUser}>{message.user.name}</span>
                    <span style={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={styles.messageText}>{message.text}</p>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          <form style={styles.chatInput} onSubmit={handleSendMessage}>
            <input
              type="text"
              style={styles.messageInput}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!selectedVideo}
            />
            <button
              type="submit"
              style={styles.sendButton}
              disabled={!selectedVideo || !newMessage.trim()}
            >
              <Send size={20} />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseView;

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import {
  Search,
  Filter,
  User,
  Book,
  Bookmark,
  LogOut,
  CheckCircle,
} from "lucide-react";

// Enhanced mock course data with more details
const mockCourses = [
  {
    _id: "1",
    name: "Introduction to Web Development",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.",
    price: 199.99,
    instructor: "Sarah Johnson",
    duration: "8 weeks",
    level: "Beginner",
    rating: 4.7,
    students: 1243,
    image: "/api/placeholder/800/400",
  },
  {
    _id: "2",
    name: "Advanced React & Redux",
    description:
      "Master state management and build complex applications with React.",
    price: 249.99,
    instructor: "Michael Chen",
    duration: "10 weeks",
    level: "Intermediate",
    rating: 4.9,
    students: 876,
    image: "/api/placeholder/800/400",
  },
  {
    _id: "3",
    name: "Data Science Fundamentals",
    description:
      "Introduction to data analysis, visualization, and machine learning concepts.",
    price: 299.99,
    instructor: "Elena Rodriguez",
    duration: "12 weeks",
    level: "Intermediate",
    rating: 4.8,
    students: 1589,
    image: "/api/placeholder/800/400",
  },
  {
    _id: "4",
    name: "UI/UX Design Principles",
    description:
      "Learn to create intuitive and beautiful user interfaces for web and mobile.",
    price: 179.99,
    instructor: "David Wilson",
    duration: "6 weeks",
    level: "Beginner",
    rating: 4.6,
    students: 952,
    image: "/api/placeholder/800/400",
  },
];

// Banner data for slideshow
const bannerData = [
  {
    image: "/api/placeholder/1200/400",
    title: "Spring Special Offer",
    description: "Get 20% off on all courses until May 31st",
    buttonText: "View Offers",
  },
  {
    image: "/api/placeholder/1200/400",
    title: "New Course: Python for Data Analysis",
    description: "Starting next month - Register now for early bird pricing",
    buttonText: "Learn More",
  },
  {
    image: "/api/placeholder/1200/400",
    title: "Live Workshop: Portfolio Building",
    description: "Join our free workshop on May 15th",
    buttonText: "Register Now",
  },
];

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState(mockCourses);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [coursePriceRange, setCoursePriceRange] = useState([0, 500]);
  const [courseLevel, setCourseLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [progress, setProgress] = useState({});
  const [sortBy, setSortBy] = useState("popular");
  const navigate = useNavigate();

  // Simulated student data fetch
  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock student data
      setStudent({
        studentId: "ST12345",
        studentName: "John Doe",
        email: "john.doe@example.com",
        joinDate: "January 15, 2025",
        profileImage: "/api/placeholder/200/200",
        interests: ["Web Development", "Data Science", "UI/UX Design"],
        bio: "Computer Science student passionate about web development and AI.",
        location: "San Francisco, CA",
      });

      // Mock enrolled courses with progress
      const mockEnrolled = [mockCourses[1]];
      setEnrolledCourses(mockEnrolled);

      // Set mock progress for enrolled courses
      const mockProgress = {};
      mockEnrolled.forEach((course) => {
        mockProgress[course._id] = {
          completed: 65,
          lastAccessed: "April 25, 2025",
          certificateEligible: false,
        };
      });
      setProgress(mockProgress);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError(
        "Failed to load your profile. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // Show a notification with auto-dismiss
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = async () => {
    setLoading(true);
    // Simulate logout API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.clear();
    navigate("/login");
  };

  // Enhanced enrollment flow
  const handleEnroll = async (courseId) => {
    if (paymentProcessing) return;
    setPaymentProcessing(true);
    try {
      const course = courses.find((c) => c._id === courseId);
      if (!course) throw new Error("Course not found");

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEnrolledCourses((prev) => [...prev, course]);
      setProgress((prev) => ({
        ...prev,
        [courseId]: {
          completed: 0,
          lastAccessed: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          certificateEligible: false,
        },
      }));

      showNotification(`Successfully enrolled in ${course.name}!`);
      setActiveTab("my-learning");
    } catch (err) {
      console.error("Payment error:", err);
      showNotification("Failed to process payment. Please try again.", "error");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Carousel settings
  const slideshowSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
  };

  // Advanced filtering logic
  const getFilteredCourses = () => {
    return courses
      .filter((course) => {
        // Filter by enrollment status
        if (courseFilter === "enrolled" && !isEnrolled(course._id))
          return false;
        if (courseFilter === "available" && isEnrolled(course._id))
          return false;

        // Filter by price range
        if (
          course.price < coursePriceRange[0] ||
          course.price > coursePriceRange[1]
        )
          return false;

        // Filter by level
        if (
          courseLevel !== "all" &&
          course.level.toLowerCase() !== courseLevel.toLowerCase()
        )
          return false;

        // Filter by search query
        if (
          searchQuery &&
          !course.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          !course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting logic
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          case "newest":
            return -1; // In a real app, would compare dates
          default: // popular
            return b.students - a.students;
        }
      });
  };

  const isEnrolled = (id) => enrolledCourses.some((e) => e._id === id);

  // Get progress data for a course
  const getCourseProgress = (courseId) => {
    return (
      progress[courseId] || {
        completed: 0,
        lastAccessed: "N/A",
        certificateEligible: false,
      }
    );
  };

  // Loading state
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-semibold text-gray-700">
          Loading your dashboard...
        </div>
      </div>
    );

  // Error state
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="text-xl text-red-600 font-bold mb-4">
            Unable to load dashboard
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex space-x-4">
            <button
              onClick={fetchStudentData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-md animate-fade-in
            ${
              notification.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
        >
          <div className="flex items-center">
            {notification.type === "error" ? (
              <span className="text-red-500 mr-2">⚠️</span>
            ) : (
              <CheckCircle className="text-green-500 mr-2" size={18} />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-6">
              <h1 className="text-2xl font-bold text-gray-900">Learning Hub</h1>
              {student && (
                <p className="text-sm text-gray-600">
                  Welcome back, {student.studentName}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Navigation buttons for mobile */}
            <div className="md:hidden flex space-x-4">
              <button
                onClick={() => setActiveTab("profile")}
                className={`p-2 rounded-full ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <User size={20} />
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`p-2 rounded-full ${
                  activeTab === "courses"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <Book size={20} />
              </button>
              <button
                onClick={() => setActiveTab("my-learning")}
                className={`p-2 rounded-full ${
                  activeTab === "my-learning"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <Bookmark size={20} />
              </button>
            </div>

            {/* Profile avatar */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <img
                  src={student?.profileImage}
                  alt="Profile"
                  className="h-10 w-10 rounded-full border-2 border-gray-200 cursor-pointer"
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Your Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut size={16} className="mr-2" /> Sign Out
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut size={16} className="mr-2" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Desktop Tabs */}
        <nav className="hidden md:flex space-x-8 mb-8 border-b border-gray-200">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "courses", label: "Browse Courses", icon: Book },
            { id: "my-learning", label: "My Learning", icon: Bookmark },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center pb-4 text-sm font-medium transition-colors hover:text-blue-600
                ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
            >
              <tab.icon size={18} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content sections */}
        <div className="mb-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Profile header */}
              <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
                <div className="absolute -bottom-16 left-8">
                  <img
                    src={student.profileImage}
                    alt="Profile"
                    className="h-32 w-32 rounded-full border-4 border-white"
                  />
                </div>
              </div>

              {/* Profile details */}
              <div className="pt-20 pb-8 px-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {student.studentName}
                    </h2>
                    <p className="text-gray-600">{student.bio}</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Edit Profile
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Personal Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Student ID</span>
                        <span className="font-medium">{student.studentId}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium">{student.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium">{student.location}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Joined</span>
                        <span className="font-medium">{student.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Learning Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {student.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">
                      Learning Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {enrolledCourses.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Enrolled Courses
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          0
                        </div>
                        <div className="text-sm text-gray-600">
                          Certificates
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Courses Tab */}
          {activeTab === "courses" && (
            <div>
              {/* Featured courses carousel */}
              

              {/* Search and filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses by name, description, or instructor"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  {/* Filter dropdown */}
                  <div className="md:w-48">
                    <div className="relative">
                      <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Courses</option>
                        <option value="available">Not Enrolled</option>
                        <option value="enrolled">Enrolled Only</option>
                      </select>
                      <Filter
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Level filter */}
                  <div className="md:w-48">
                    <div className="relative">
                      <select
                        value={courseLevel}
                        onChange={(e) => setCourseLevel(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <Book
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Sort dropdown */}
                  <div className="md:w-48">
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest</option>
                      </select>
                      <Filter
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredCourses().map((course) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                  >
                    <img
                      src={course.image}
                      alt={course.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {course.name}
                        </h3>
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {course.level}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 flex-1">
                        {course.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="mr-4">⭐ {course.rating}</span>
                        <span>{course.students.toLocaleString()} students</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span className="mr-4">👨‍🏫 {course.instructor}</span>
                        <span>⏱️ {course.duration}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-gray-900">
                          ${course.price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleEnroll(course._id)}
                          disabled={isEnrolled(course._id) || paymentProcessing}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isEnrolled(course._id)
                              ? "bg-green-100 text-green-700 cursor-default"
                              : paymentProcessing
                              ? "bg-gray-200 text-gray-500 cursor-wait"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {isEnrolled(course._id)
                            ? "Already Enrolled"
                            : paymentProcessing
                            ? "Processing..."
                            : "Enroll Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getFilteredCourses().length === 0 && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-3">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCourseFilter("all");
                      setCourseLevel("all");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
          {/* My Learning Tab */}
          {activeTab === "my-learning" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                My Enrolled Courses
              </h2>
              {enrolledCourses.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-3 text-4xl">📚</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No courses enrolled yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Browse our catalog and enroll in your first course
                  </p>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => {
                    const courseProgress = getCourseProgress(course._id);
                    return (
                      <div
                        key={course._id}
                        className="bg-white shadow rounded-lg overflow-hidden"
                      >
                        <div className="md:flex">
                          <div className="md:w-1/4">
                            <img
                              src={course.image}
                              alt={course.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-6 md:w-3/4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                  {course.name}
                                </h3>
                                <div className="flex items-center mb-3">
                                  <span className="text-yellow-500 mr-1">
                                    ⭐
                                  </span>
                                  <span className="text-sm">
                                    {course.rating}
                                  </span>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-sm text-gray-600">
                                    {course.instructor}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                  {course.description}
                                </p>
                              </div>
                              <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                                <div className="text-sm text-gray-500 mb-2">
                                  Last accessed: {courseProgress.lastAccessed}
                                </div>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                  Continue Learning
                                </button>
                              </div>
                            </div>

                            <div className="mt-6">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Course Progress
                                </span>
                                <span className="text-sm font-medium text-blue-600">
                                  {courseProgress.completed}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${courseProgress.completed}%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-4">
                              <div className="bg-gray-50 px-4 py-3 rounded-md text-center flex-1">
                                <div className="text-sm text-gray-500">
                                  Duration
                                </div>
                                <div className="font-medium">
                                  {course.duration}
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-3 rounded-md text-center flex-1">
                                <div className="text-sm text-gray-500">
                                  Level
                                </div>
                                <div className="font-medium">
                                  {course.level}
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-3 rounded-md text-center flex-1">
                                <div className="text-sm text-gray-500">
                                  Certificate
                                </div>
                                <div className="font-medium">
                                  {courseProgress.certificateEligible ? (
                                    <span className="text-green-600">
                                      Available
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">
                                      After completion
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                              <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Course Materials
                              </button>
                              <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                  />
                                </svg>
                                Discussion Forum
                              </button>
                              <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Get Help
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recommended courses section */}
              {enrolledCourses.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Recommended For You
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses
                      .filter((course) => !isEnrolled(course._id))
                      .slice(0, 3)
                      .map((course) => (
                        <div
                          key={course._id}
                          className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                        >
                          <img
                            src={course.image}
                            alt={course.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-md font-bold text-gray-900 mb-2">
                              {course.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-gray-900">
                                ${course.price.toFixed(2)}
                              </div>
                              <button
                                onClick={() => handleEnroll(course._id)}
                                disabled={paymentProcessing}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
                                  ${
                                    paymentProcessing
                                      ? "bg-gray-200 text-gray-500 cursor-wait"
                                      : "bg-blue-600 hover:bg-blue-700 text-white"
                                  }`}
                              >
                                {paymentProcessing ? "Processing..." : "Enroll"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Learning calendar/schedule section */}
              {enrolledCourses.length > 0 && (
                <div className="mt-12 bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Your Learning Schedule
                  </h2>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-7 bg-gray-50 border-b">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="p-3 text-center font-medium text-gray-700 border-r last:border-r-0"
                          >
                            {day}
                          </div>
                        )
                      )}
                    </div>
                    <div className="grid grid-cols-7 h-44">
                      {Array(7)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={index}
                            className="p-2 border-r border-b last:border-r-0 relative min-h-full"
                          >
                            <div className="text-xs text-gray-500 mb-1">
                              {index + 22}
                            </div>
                            {index === 2 && (
                              <div className="bg-blue-100 border-l-4 border-blue-600 text-blue-800 p-2 rounded-r-sm text-xs">
                                <div className="font-semibold">
                                  Advanced React
                                </div>
                                <div>Module 4 Assignment</div>
                                <div>4:00 PM</div>
                              </div>
                            )}
                            {index === 4 && (
                              <div className="bg-purple-100 border-l-4 border-purple-600 text-purple-800 p-2 rounded-r-sm text-xs">
                                <div className="font-semibold">
                                  Advanced React
                                </div>
                                <div>Live Q&A Session</div>
                                <div>2:00 PM</div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="mt-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Full Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-6 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-gray-900">Learning Hub</h3>
              <p className="text-sm text-gray-600 mt-1">
                © {new Date().getFullYear()} Learning Hub. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Help Center
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Contact Us
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentDashboard;

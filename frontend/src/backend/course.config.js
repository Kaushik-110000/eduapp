// src/services/course.service.js

import axios from "axios";
import server from "../conf/conf.js";

axios.defaults.withCredentials = true; // send cookies by default

class CourseService {
  /**
   * Get all available courses
   */
  async getAllCourses() {
    try {
      const res = await axios.get(
        `${server.serverUrl}/courses/all`
      );
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a specific course by ID
   * @param {string} courseId - The ID of the course to fetch
   */
  async getCourse(courseId) {
    try {
      const res = await axios.get(
        `${server.serverUrl}/courses/${encodeURIComponent(courseId)}`
      );
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a video room for a course (tutor only)
   * @param {Object} roomData - Data for creating the video room
   */
  async createVideoRoom(roomData) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/courses/createVideo`,
        roomData
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get courses taught by a specific tutor
   * @param {string} tutorId - The ID of the tutor
   */
  async getTutorCourses(tutorId) {
    try {
      const res = await axios.get(
        `${server.serverUrl}/courses/tutor/${encodeURIComponent(tutorId)}`
      );
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get courses enrolled by a specific student
   * @param {string} studentId - The ID of the student
   */
  async getStudentCourses(studentId) {
    try {
      const res = await axios.get(
        `${server.serverUrl}/courses/student/${encodeURIComponent(studentId)}`
      );
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a new course (tutor only)
   * @param {Object} courseData - Course information
   */
  async createCourse(courseData) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/courses/create`,
        courseData
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update an existing course (tutor only)
   * @param {string} courseId - The ID of the course to update
   * @param {Object} courseData - Updated course information
   */
  async updateCourse(courseId, courseData) {
    try {
      const res = await axios.put(
        `${server.serverUrl}/courses/${encodeURIComponent(courseId)}`,
        courseData
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a course (tutor only)
   * @param {string} courseId - The ID of the course to delete
   */
  async deleteCourse(courseId) {
    try {
      const res = await axios.delete(
        `${server.serverUrl}/courses/${encodeURIComponent(courseId)}`
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }
}

const courseService = new CourseService();
export default courseService;

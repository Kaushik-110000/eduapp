// src/services/student.service.js

import axios from "axios";
import server from "../conf/conf.js";

axios.defaults.withCredentials = true; // send cookies by default

class StudentService {
  async register(data) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/student/register`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res;
    } catch (err) {
      // You can inspect err.response.data for validation errors, etc.
      throw err;
    }
  }

  /**
   * Log in (email + password)
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/student/login`,
        credentials,
        {
          withCredentials: true,
        }
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Log out current student (requires valid access token cookie/header)
   */
  async logout() {
    try {
      const res = await axios.post(
        `${server.serverUrl}/student/logout`
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Refresh the access token using the refresh token cookie
   */
  async refreshAccessToken() {
    try {
      const res = await axios.post(
        `${server.serverUrl}/student/refresh-token`
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Check the refresh token’s validity
   */
  async checkRefreshToken() {
    try {
      const res = await axios.get(
        `${server.serverUrl}/student/check-refresh`
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get the currently authenticated student's profile
   */
  async getCurrentStudent() {
    try {
      const res = await axios.get(
        `${server.serverUrl}/student/current-student`
      );
      // assume data.data contains your student document
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get any student by their studentID
   * @param {string} studentID
   */
  async getStudent(studentID) {
    try {
      const res = await axios.get(
        `${server.serverUrl}/student/${encodeURIComponent(studentID)}`
      );
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Generate a payment order (e.g. via Razorpay) for the logged-in student
   * @param {{ amount: number, currency?: string, receipt?: string }} orderInfo
   */
  async generatePaymentOrder(orderInfo) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/student/generatePaymentOrder`,
        orderInfo
      );
      return res.data; // contains order id, amount, etc.
    } catch (err) {
      throw err;
    }
  }

  /**
   * Enroll the student in a course after successful payment
   * @param {{ courseId: string, paymentId: string }} enrollmentInfo
   */
  async enrollCourse(enrollmentInfo) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/student/enrollCourse`,
        enrollmentInfo
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }
}

const studentService = new StudentService();
export default studentService;
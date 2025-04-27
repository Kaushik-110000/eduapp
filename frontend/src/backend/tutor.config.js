// src/services/tutor.service.js

import axios from "axios";
import server from "../conf/conf.js";

axios.defaults.withCredentials = true; // send cookies by default

class TutorService {
  async register(data) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/tutor/register`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res;
    } catch (err) {
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
        `${server.serverUrl}/tutor/login`,
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
   * Log out current tutor (requires valid access token cookie/header)
   */
  async logout() {
    try {
      const res = await axios.post(
        `${server.serverUrl}/tutor/logout`
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
        `${server.serverUrl}/tutor/refresh-token`
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Check the refresh token's validity
   */
  async checkRefreshToken() {
    try {
      const res = await axios.get(
        `${server.serverUrl}/tutor/check-refresh`
      );
      return res;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get the currently authenticated tutor's profile
   */
  async getCurrentTutor() {
    try {
      const res = await axios.get(
        `${server.serverUrl}/tutor/current-tutor`
      );
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get any tutor by their tutorID
   * @param {string} tutorID
   */
  async getTutor(tutorID) {
    try {
      const res = await axios.get(
        `${server.serverUrl}/tutor/${encodeURIComponent(tutorID)}`
      );
      return res.data.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a new course
   * @param {Object} courseData - Course information
   */
  async createCourse(courseData) {
    try {
      const res = await axios.post(
        `${server.serverUrl}/tutor/createCourse`,
        courseData
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Check tutor verification status
   */
  async checkVerification() {
    try {
      const res = await axios.post(
        `${server.serverUrl}/tutor/checkVerification`
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }
}

const tutorService = new TutorService();
export default tutorService;

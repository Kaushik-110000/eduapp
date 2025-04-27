import axios from "axios";

import server from '../conf/conf.js'

const videosService = {
  getVideosByCourseId: async (courseId) => {
    try {
      const response = await axios.get(`${server.serverUrl}/videos/course/${courseId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw error.response?.data || { message: "Failed to fetch videos" };
    }
  },
};

export default videosService; 
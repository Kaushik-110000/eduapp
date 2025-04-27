import axios from "axios";
import server from "../conf/conf.js";

const paymentService = {
  generateOrder: async (courseId) => {
    try {
      const response = await axios.post(
        `${server.serverUrl}/student/generatePaymentOrder`,
        { courseId },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating payment order:", error);
      throw error.response?.data || { message: "Failed to generate payment order" };
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await axios.post(
        `${server.serverUrl}/student/enrollCourse`,
        paymentData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error.response?.data || { message: "Failed to verify payment" };
    }
  },
};

export default paymentService; 
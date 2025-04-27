import { retry } from "@reduxjs/toolkit/query";
import server from "../conf/conf.js";
import axios from "axios";
axios.defaults.withCredentials = true;
export class Courseservice {
  async getAllCourses() {
    try {
      const response = await axios.get(`${server.serverUrl}/courses/all`);
      if (response.status == 200) {
        return response.data.data;
      } else throw err;
    } catch (error) {
      throw err;
    }
  }

  async getSingleCourse(courseId) {
    try {
      const response = await axios.get(
        `${server.serverUrl}/courses/${courseId}`
      );
      if (response.status == 200) {
        return response.data.data;
      } else throw err;
    } catch (error) {
      throw err;
    }
  }

  async postComments(data) {
    try {
      const response = await axios.post(
        `${server.serverUrl}/postcomment`,
        data
      );
      if (response.status == 200) {
        return response.data.data;
      } else throw err;
    } catch (error) {
      throw err;
    }
  }
}
const courseservice = new Courseservice();
export default courseservice;

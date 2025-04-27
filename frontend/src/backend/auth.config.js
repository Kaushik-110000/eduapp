import { retry } from "@reduxjs/toolkit/query";
import server from "../conf/conf.js";
import axios from "axios";
axios.defaults.withCredentials = true;
export class Authservice {
  async getCurrentStudent() {
    try {
      const response = await axios.get(
        `${server.serverUrl}/student/current-student`
      ); //hello
      if (response.status == 200) {
        const {
          _id,
          studentName,
          email,
          studentID,
          avatar,
          refreshToken,
          interests,
          coursesSubscribed,
        } = response.data.data;
        return {
          _id,
          studentName,
          email,
          studentID,
          avatar,
          refreshToken,
          interests,
          coursesSubscribed,
        };
      } else throw error;
    } catch (err) {
      throw err;
    }
  }

  async getCurrentTutor() {
    try {
      const response = await axios.get(
        `${server.serverUrl}/tutor/current-tutor`
      );
      if (response.status == 200) {
        const { _id, userName, email, fullName, avatar, refreshToken } =
          response.data.data;
        return {
          _id,
          userName,
          email,
          fullName,
          avatar,
          refreshToken,
        };
      } else throw error;
    } catch (err) {
      throw err;
    }
  }

  async getCurrentAdmin() {
    try {
      const response = await axios.get(
        `${server.serverUrl}/admin/current-admin`
      );
      if (response.status == 200) {
        const { _id, userName, email, fullName, avatar, refreshToken } =
          response.data.data;
        return {
          _id,
          userName,
          email,
          fullName,
          avatar,
          refreshToken,
        };
      } else throw error;
    } catch (err) {
      throw err;
    }
  }
}
const authservice = new Authservice();
export default authservice;

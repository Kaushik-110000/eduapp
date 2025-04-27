import { Server } from "socket.io";
import { Video } from "../models/videos.model.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
    transports: ["websocket"],
  });

  // Store active video rooms and their messages
  const videoRooms = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a video room
    socket.on("joinVideoRoom", async ({ videoId }) => {
      try {
        console.log(`User ${socket.id} joining video room:`, videoId);
        
        // Verify video exists
        const video = await Video.findById(videoId);
        if (!video) {
          console.error(`Video not found: ${videoId}`);
          socket.emit("error", { message: "Video not found" });
          return;
        }

        socket.join(videoId);
        
        // Initialize room if it doesn't exist
        if (!videoRooms.has(videoId)) {
          console.log(`Creating new room for video: ${videoId}`);
          videoRooms.set(videoId, {
            messages: [],
            viewers: new Set(),
          });
        }

        // Add viewer to room
        videoRooms.get(videoId).viewers.add(socket.id);
        console.log(`Room ${videoId} now has ${videoRooms.get(videoId).viewers.size} viewers`);

        // Send existing messages to the new viewer
        const messages = videoRooms.get(videoId).messages;
        console.log(`Sending ${messages.length} messages to user ${socket.id}`);
        socket.emit("loadMessages", messages);
      } catch (error) {
        console.error("Error in joinVideoRoom:", error);
        socket.emit("error", { message: "Failed to join video room" });
      }
    });

    // Handle new messages
    socket.on("sendMessage", async ({ videoId, message, user }) => {
      try {
        console.log(`New message in room ${videoId} from user ${user.name}:`, message);
        
        const room = videoRooms.get(videoId);
        if (!room) {
          console.error(`Room not found: ${videoId}`);
          socket.emit("error", { message: "Video room not found" });
          return;
        }

        const newMessage = {
          id: Date.now(),
          text: message,
          user: user,
          timestamp: new Date().toISOString(),
        };

        room.messages.push(newMessage);
        console.log(`Broadcasting message to ${room.viewers.size} viewers in room ${videoId}`);
        io.to(videoId).emit("newMessage", newMessage);
      } catch (error) {
        console.error("Error in sendMessage:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      
      // Remove viewer from all rooms
      videoRooms.forEach((room, videoId) => {
        if (room.viewers.has(socket.id)) {
          room.viewers.delete(socket.id);
          console.log(`User ${socket.id} removed from room ${videoId}`);
          
          if (room.viewers.size === 0) {
            console.log(`Room ${videoId} is now empty, cleaning up`);
            videoRooms.delete(videoId);
          }
        }
      });
    });
  });

  return io;
}; 
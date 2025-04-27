import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initializeSocket } from "./socket/socket.js";
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize socket.io
initializeSocket(server);

// Connect to database
connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error :", err);
      throw err;
    });
  })
  .catch((err) => {
    console.log("Error in connection of database !!", err);
  });



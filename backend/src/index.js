import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("Error :", err);
      throw err;
    });

    app.listen(process.env.PORT || 8011, () => {
      console.log("Server is running on ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Error in connection of database !!", err);
  });



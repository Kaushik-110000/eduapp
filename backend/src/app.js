import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ limit: "20kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import healthcheckRouter from "./routes/healthcheck.routes.js";
import studentRouter from "./routes/student.routes.js";
import tutorRouter from "./routes/tutor.routes.js";
import adminRouter from "./routes/admin.routes.js";
import courseRouter from "./routes/course.routes.js";
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/tutor", tutorRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/courses", courseRouter);
export { app };

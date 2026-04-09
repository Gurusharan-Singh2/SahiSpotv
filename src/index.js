import express from "express";

import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { fileURLToPath } from "url";
import path from "path";

import UserRouter from "./routes/user.js";
import ContactRouter from "./routes/contact.js";
import AdminRouter from "./routes/admin.routes.js";
import ParkingRouter from "./routes/parking.routes.js";

const app = express();

app.disable("x-powered-by");

const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

const allowedOrigins = [
  "http://localhost:5173",
  "https://sahi-spotv.vercel.app",
  "https://yourapp.com", // keep or replace with your actual prod domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server Running Good",
  });
});
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "SahiSpot Backend is running 🚀",
  });
});

app.use("/api/v1", UserRouter);
app.use("/api/v1/contact", ContactRouter);
app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/parking", ParkingRouter);
app.post("/api/v1/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.json({ message: "Logged out successfully" });
});

export default app;

const PORT = process.env.PORT || 8080;

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const message = err?.message || "Internal Server Error";
  let status = err?.statusCode || err?.status;

  if (!status) {
    if (message.includes("Invalid image type")) status = 400;
    else if (err?.code === "LIMIT_FILE_SIZE") status = 413;
    else status = 500;
  }
  res.status(status).json({ message });
});

// app.listen(PORT, () => {
//   console.log(`Server Started on ${PORT}`);
// });


import express from "express"
import "dotenv/config"
import cors from "cors"
import cookieParser from "cookie-parser"
import {connectToDatabase} from './config/db.js'
import authRouter from "./routes/authRoutes.js"
import formRouter from "./routes/formRoutes.js"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI must be set in environment variables");
}

const app=express()

await connectToDatabase();

const origins = (process.env.ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: origins,
  credentials: true,   // required for cookies (httpOnly JWT session)
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// --- Cookie parser — authMiddleware needs req.cookies.token ---
app.use(cookieParser());

// --- Health check ---
app.get("/", (_req, res) => res.send("server is live"));

// --- Routes ---
app.use("/api/auth", authRouter);
app.use("/api/forms", formRouter);

// --- 404 for unknown routes ---
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error(`[Error] ${err.message}`);
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";
  res.status(status).json({
    error: status === 500 && isProd ? "Internal server error" : err.message,
  });
});

// --- Start listening ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
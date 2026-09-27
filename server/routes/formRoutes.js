// formRoutes.js
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { validateSubmission } from "../middleware/validateSubmission.js";
import {
  createForm, listForms, getForm, deleteForm, updateForm, publishForm, getPublicForm,
} from "../controllers/formController.js";
import { chat } from "../controllers/chatController.js";
import {
  submitForm, listSubmissions, updateSubmissionStatus, deleteSubmission,
} from "../controllers/submissionController.js";

const formRouter = Router();

// ---------- PUBLIC ----------
formRouter.get("/public/:id", getPublicForm);

// Rate limiter for public submissions — 5 per 10 min per IP
const submitLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "You've submitted this form too many times. Please wait a few minutes.",
});

formRouter.post(
  "/public/:id/submit",
  submitLimiter,          // 1. rate limit first (cheap check)
  validateSubmission,     // 2. then validate (DB fetch + rules)
  submitForm              // 3. then save
);

// ---------- PROTECTED ----------
formRouter.use(authMiddleware);

formRouter.post("/", createForm);
formRouter.get("/", listForms);
formRouter.get("/:id", getForm);
formRouter.put("/:id", updateForm);
formRouter.delete("/:id", deleteForm);
formRouter.post("/:id/publish", publishForm);
formRouter.post("/:id/chat", chat);

// Submission management
formRouter.get("/:id/submissions", listSubmissions);
formRouter.patch("/:id/submissions/:subId", updateSubmissionStatus);
formRouter.delete("/:id/submissions/:subId", deleteSubmission);

export default formRouter;
// controllers/submissionController.js
import { Form } from "../models/form.js";
import { Submission } from "../models/submission.js";

// POST /api/forms/public/:id/submit
// Public — validated by validateSubmission middleware beforehand
export async function submitForm(req, res) {
  try {
    const form = req.form;                    // attached by validateSubmission
    const cleanValues = req.cleanValues;
    const clientMeta = req.clientMeta;

    const submission = await Submission.create({
      form: form._id,
      values: cleanValues,
      ip: clientMeta.ip,
      userAgent: clientMeta.userAgent,
      status: "new",
    });

    res.status(201).json({
      success: true,
      submissionId: submission._id,
    });
  } catch (err) {
    console.error("Submit form error:", err);
    res.status(500).json({ error: "Failed to save your response. Please try again." });
  }
}

// GET /api/forms/:id/submissions
// Owner-only — list all submissions for a form
export async function listSubmissions(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // Verify ownership (single query — cheap)
    const form = await Form.findOne(
      { _id: req.params.id, owner: req.user.userId },
      { _id: 1 }
    );
    if (!form) return res.status(404).json({ error: "Form not found" });

    // Optional status filter: ?status=new
    const filter = { form: form._id };
    if (req.query.status && ["new", "read", "archived"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const submissions = await Submission.find(filter).sort({ createdAt: -1 });

    res.json({
      count: submissions.length,
      submissions,
    });
  } catch (err) {
    console.error("List submissions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /api/forms/:id/submissions/:subId
// Owner-only — update the status of a submission
export async function updateSubmissionStatus(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { status } = req.body;
    if (!["new", "read", "archived"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Verify ownership
    const form = await Form.findOne(
      { _id: req.params.id, owner: req.user.userId },
      { _id: 1 }
    );
    if (!form) return res.status(404).json({ error: "Form not found" });

    const submission = await Submission.findOneAndUpdate(
      { _id: req.params.subId, form: form._id },
      { status },
      { returnDocument: "after" }
    );
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    res.json({ success: true, submission });
  } catch (err) {
    console.error("Update submission status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /api/forms/:id/submissions/:subId
// Owner-only — delete a submission (spam cleanup)
export async function deleteSubmission(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const form = await Form.findOne(
      { _id: req.params.id, owner: req.user.userId },
      { _id: 1 }
    );
    if (!form) return res.status(404).json({ error: "Form not found" });

    const result = await Submission.findOneAndDelete({
      _id: req.params.subId,
      form: form._id,
    });
    if (!result) return res.status(404).json({ error: "Submission not found" });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete submission error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
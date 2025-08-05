// routes/interviews.js
import { Router } from "express";
import InterviewSpace from "../models/InterviewSpace.js"; // adjust path as needed
import { randomUUID } from "crypto";

const interviewRoutes = Router();

/**
 * POST /api/interviews
 * Body (JSON) should match the InterviewSpace schema:
 * {
 *   ownerId, // ObjectId string
 *   title,
 *   scheduledAt, // ISO date string
 *   candidateId, // optional ObjectId string
 *   candidateEmail,
 *   invitedInterviewers: [{ userId, email }],
 *   dsaQuestions: [{ title, description, difficulty, testCases: [{input}], externalId }],
 *   // optional: videoRoomId, codeRoomId, whiteBoardRoom (will be auto-generated if not provided)
 * }
 */
interviewRoutes.post("/interview-create", async (req, res) => {
  try {
    const payload = req.body;

    // Basic validation
    const required = ["ownerId", "title", "scheduledAt", "candidateEmail"];
    const missing = required.filter((k) => !payload?.[k]);
    if (missing.length) {
      return res.status(400).json({ error: "Missing required fields", missing });
    }

    // Generate room ids if not provided
    const videoRoomId = payload.videoRoomId || `video_${randomUUID()}`;
    const codeRoomId = payload.codeRoomId || `code_${randomUUID()}`;
    const whiteBoardRoom = payload.whiteBoardRoom || `wb_${randomUUID()}`;

    // Normalize scheduledAt to Date
    const scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;

    // Build document according to schema
    const doc = {
      ownerId: payload.ownerId,
      title: payload.title,
      scheduledAt,
      candidateId: payload.candidateId || null,
      candidateEmail: payload.candidateEmail,
      invitedInterviewers: Array.isArray(payload.invitedInterviewers) ? payload.invitedInterviewers : [],
      dsaQuestions: Array.isArray(payload.dsaQuestions) ? payload.dsaQuestions : [],
      videoRoomId,
      codeRoomId,
      whiteBoardRoom,
    };

    const created = await InterviewSpace.create(doc);

    return res.status(201).json({ success: true, interviewSpace: created });
  } catch (err) {
    console.error("Create interview space error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

export default interviewRoutes;

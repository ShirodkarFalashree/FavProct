import express from "express";
import { createExam, getExams } from "../controllers/generateExam.controller.js";

const router = express.Router();

// 🔥 Create exam from question bank
router.post("/create", createExam);
router.get("/", getExams);

export default router;
import express from "express";
import { createExam } from "../controllers/generateExam.controller.js";

const router = express.Router();

// 🔥 Create exam from question bank
router.post("/create", createExam);

export default router;
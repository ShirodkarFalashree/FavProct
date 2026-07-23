import express from "express";
import multer from "multer";
import { createExam, getExams, deleteExam } from "../controllers/generateExam.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🔥 Create exam from question bank
router.post("/create", upload.single("excel"), createExam);
router.get("/", getExams);
router.delete("/:id", deleteExam);

export default router;
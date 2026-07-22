import express from "express";
import {
  getStudentDashboard,
  startExam,
  submitExam,
  getTeacherDashboard,
  getStudentExamDetail,
  evaluateExam
} from "../controllers/studentExam.controller.js";

const router = express.Router();

// Student endpoints
router.get("/student-dashboard", getStudentDashboard);
router.post("/:studentExamId/start", startExam);
router.post("/:studentExamId/submit", submitExam);

// Teacher endpoints
router.get("/teacher-dashboard", getTeacherDashboard);
router.get("/:studentExamId/detail", getStudentExamDetail);
router.post("/:studentExamId/evaluate", evaluateExam);

export default router;

import express from "express";
import multer from "multer";
import {
  addTeacher,
  getTeachers,
  allotExamViaExcel,
  getAdminStats
} from "../controllers/admin.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/teachers", addTeacher);
router.get("/teachers", getTeachers);
router.post("/allot-exam", upload.single("excel"), allotExamViaExcel);
router.get("/stats", getAdminStats);

export default router;

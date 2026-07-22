import express from "express";
import {
  createCohort,
  getCohorts,
  addClassToCohort,
  addSubjectToClass
} from "../controllers/cohort.controller.js";

const router = express.Router();

// Cohorts endpoints
router.post("/", createCohort);
router.get("/", getCohorts);
router.post("/:cohortId/classes", addClassToCohort);
router.post("/:cohortId/classes/:classId/subjects", addSubjectToClass);

export default router;

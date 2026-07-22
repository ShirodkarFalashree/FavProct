import Cohort from "../models/Cohort.js";

// Create Cohort
export const createCohort = async (req, res) => {
  try {
    const { name, organizationId } = req.body;
    
    if (!name || !organizationId) {
      return res.status(400).json({ message: "Name and organizationId are required" });
    }

    const existing = await Cohort.findOne({ name, organizationId });
    if (existing) {
      return res.status(400).json({ message: "Cohort name already exists in this organization" });
    }

    const cohort = await Cohort.create({
      name,
      organizationId,
      classes: []
    });

    res.status(201).json({ message: "Cohort created successfully", cohort });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Cohorts for an organization
export const getCohorts = async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const cohorts = await Cohort.find({ organizationId }).sort({ name: 1 });
    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add class to Cohort
export const addClassToCohort = async (req, res) => {
  try {
    const { cohortId } = req.params;
    const { className } = req.body;

    if (!className) {
      return res.status(400).json({ message: "className is required" });
    }

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    // Check if class already exists
    const classExists = cohort.classes.some(
      (c) => c.name.toLowerCase() === className.toLowerCase()
    );

    if (classExists) {
      return res.status(400).json({ message: "Class already exists in this cohort" });
    }

    cohort.classes.push({ name: className, subjects: [] });
    await cohort.save();

    res.json({ message: "Class added successfully", cohort });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add subject to a Class in a Cohort
export const addSubjectToClass = async (req, res) => {
  try {
    const { cohortId, classId } = req.params;
    const { subjectName } = req.body;

    if (!subjectName) {
      return res.status(400).json({ message: "subjectName is required" });
    }

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    const classObj = cohort.classes.id(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found in this cohort" });
    }

    // Check if subject already exists
    const subjectExists = classObj.subjects.some(
      (s) => s.toLowerCase() === subjectName.toLowerCase()
    );

    if (subjectExists) {
      return res.status(400).json({ message: "Subject already exists in this class" });
    }

    classObj.subjects.push(subjectName);
    await cohort.save();

    res.json({ message: "Subject added successfully", cohort });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

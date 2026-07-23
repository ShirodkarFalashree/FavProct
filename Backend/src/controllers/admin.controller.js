import XLSX from "xlsx";
import User from "../models/User.js";
import StudentExam from "../models/StudentExam.js";
import Cohort from "../models/Cohort.js";
import GeneratedExam from "../models/GeneratedExam.js";
import { sendEmail } from "../utils/emailService.js";
import fs from "fs";

// Helper to generate a random password
const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// Add Teacher Manually
export const addTeacher = async (req, res) => {
  try {
    const { name, email, organizationId, subjects } = req.body;

    if (!name || !email || !organizationId) {
      return res.status(400).json({ message: "Name, email, and organizationId are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === "teacher") {
        // Teacher already exists. Append new subjects if not present.
        const newSubjects = (subjects || []).filter(sub => !existing.subjects.includes(sub));
        
        if (newSubjects.length > 0) {
          existing.subjects.push(...newSubjects);
          await existing.save();

          // Send notification email for new subjects
          await sendEmail({
            to: email,
            subject: "New Subjects Assigned to Your Account",
            text: `Hello ${existing.name},\n\nNew subjects/exams have been assigned to you on the Assessment Platform.\n\nNewly Assigned Subjects: ${newSubjects.join(", ")}\n\nPlease log in to view details.\n\nRegards,\nAdmin Team`
          });
        } else {
          // Send reminder email anyway
          await sendEmail({
            to: email,
            subject: "Your Assigned Subjects Updated",
            text: `Hello ${existing.name},\n\nYour assigned subjects list was reviewed by the admin.\n\nCurrent Assigned Subjects: ${existing.subjects.join(", ")}\n\nRegards,\nAdmin Team`
          });
        }

        return res.status(200).json({
          message: "Teacher account updated and notification email sent",
          teacher: { id: existing._id, name: existing.name, email: existing.email }
        });
      } else {
        return res.status(400).json({ message: `User with this email already exists as a ${existing.role}` });
      }
    }

    const tempPassword = generatePassword();

    const teacher = await User.create({
      name,
      email,
      password: tempPassword,
      role: "teacher",
      organizationId,
      subjects: subjects || []
    });

    // Send Welcome Email
    await sendEmail({
      to: email,
      subject: "Your Teacher Account Created",
      text: `Hello ${name},\n\nAn account has been created for you on the Assessment Platform.\n\nYour login credentials are:\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease log in and change your password.\n\nRegards,\nAdmin Team`
    });

    res.status(201).json({
      message: "Teacher account created and welcome email sent",
      teacher: { id: teacher._id, name: teacher.name, email: teacher.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get List of Teachers
export const getTeachers = async (req, res) => {
  try {
    const { organizationId } = req.query;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const teachers = await User.find({ organizationId, role: "teacher" }).select("-password");
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Allot Exam to Students via Excel upload
export const allotExamViaExcel = async (req, res) => {
  try {
    const { examId, organizationId } = req.body;

    if (!examId || !organizationId) {
      return res.status(400).json({ message: "examId and organizationId are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    // Verify exam exists
    const exam = await GeneratedExam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Parse Excel File
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    const summary = {
      studentsCreated: 0,
      studentsUpdated: 0,
      teachersCreated: 0,
      examsAllotted: 0,
      errors: []
    };

    for (const row of data) {
      // Support matching headers (case-insensitive and space-insensitive)
      const studentName = row.StudentName || row["Student Name"] || row.studentname;
      const studentEmail = (row.StudentEmail || row["Student Email"] || row.studentemail || "").toString().trim().toLowerCase();
      const cohortName = row.Cohort || row.cohort || "";
      const className = row.Class || row.class || "";
      const evaluatorName = row.EvaluatorName || row["Evaluator Name"] || row.evaluatorname || "Default Evaluator";
      const evaluatorEmail = (row.EvaluatorEmail || row["Evaluator Email"] || row.evaluatoremail || "").toString().trim().toLowerCase();

      if (!studentName || !studentEmail || !evaluatorEmail) {
        summary.errors.push(`Missing fields in row: ${JSON.stringify(row)}`);
        continue;
      }

      try {
        // 1. Find or create Evaluator (teacher)
        let teacher = await User.findOne({ email: evaluatorEmail, role: "teacher" });
        if (!teacher) {
          const teacherTempPassword = generatePassword();
          teacher = await User.create({
            name: evaluatorName,
            email: evaluatorEmail,
            password: teacherTempPassword,
            role: "teacher",
            organizationId,
            subjects: [exam.title] // Tag subjects with exam name/subject
          });
          summary.teachersCreated++;

          // Send welcome email
          await sendEmail({
            to: evaluatorEmail,
            subject: "Your Teacher Account Created",
            text: `Hello ${evaluatorName},\n\nAn evaluator account has been created for you.\n\nYour login credentials are:\nEmail: ${evaluatorEmail}\nPassword: ${teacherTempPassword}\n\nRegards,\nAdmin Team`
          });
        } else {
          // If teacher exists, verify if exam.title is assigned to them.
          if (!teacher.subjects.includes(exam.title)) {
            teacher.subjects.push(exam.title);
            await teacher.save();

            // Send notification email about new assignment
            await sendEmail({
              to: evaluatorEmail,
              subject: "New Exam Evaluation Assigned",
              text: `Hello ${teacher.name},\n\nYou have been assigned to evaluate student attempts for the exam: "${exam.title}".\n\nPlease log in to your dashboard to review and grade submissions.\n\nRegards,\nAdmin Team`
            });
          }
        }

        // 2. Find or create Student
        let student = await User.findOne({ email: studentEmail, role: "student" });
        const isNewStudent = !student;
        if (isNewStudent) {
          const studentTempPassword = generatePassword();
          student = await User.create({
            name: studentName,
            email: studentEmail,
            password: studentTempPassword,
            role: "student",
            organizationId,
            cohort: cohortName,
            subject: exam.title // initial mapping
          });
          summary.studentsCreated++;

          // Send welcome email
          await sendEmail({
            to: studentEmail,
            subject: "Your Student Account Created & Exam Allotted",
            text: `Hello ${studentName},\n\nYou have been registered on the assessment system.\n\nCredentials:\nEmail: ${studentEmail}\nPassword: ${studentTempPassword}\n\nAn exam has been allotted: "${exam.title}". Please log in to complete it.\n\nRegards,\nAdmin Team`
          });
        } else {
          // If student exists, update cohort/subject if provided
          if (cohortName) student.cohort = cohortName;
          await student.save();
          summary.studentsUpdated++;
        }

        // 3. Create or append Exam Allotment
        const existingAllotment = await StudentExam.findOne({
          studentId: student._id,
          examId: exam._id
        });

        if (!existingAllotment) {
          await StudentExam.create({
            studentId: student._id,
            examId: exam._id,
            evaluatorId: teacher._id,
            status: "allotted"
          });
          summary.examsAllotted++;

          // Send email to existing student for new exam allotment
          if (!isNewStudent) {
            await sendEmail({
              to: studentEmail,
              subject: "New Exam Allotted",
              text: `Hello ${student.name},\n\nA new exam has been allotted to you: "${exam.title}".\n\nPlease log in to your dashboard to complete it.\n\nRegards,\nAdmin Team`
            });
          }
        }
      } catch (err) {
        summary.errors.push(`Error processing row for ${studentEmail}: ${err.message}`);
      }
    }

    res.json({
      message: "Exam allotment Excel processed successfully",
      summary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Dashboard Statistics for admin
export const getAdminStats = async (req, res) => {
  try {
    const { organizationId } = req.query;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const studentsCount = await User.countDocuments({ organizationId, role: "student" });
    const teachersCount = await User.countDocuments({ organizationId, role: "teacher" });
    const cohortsCount = await Cohort.countDocuments({ organizationId });
    const examsCount = await GeneratedExam.countDocuments({ organizationId });

    // Fetch all student exam count
    const studentExams = await StudentExam.find()
      .populate({
        path: "examId",
        match: { organizationId }
      });
    
    // Filter and count statuses
    const orgStudentExams = studentExams.filter(se => se.examId !== null);
    const totalAllotments = orgStudentExams.length;
    const pendingEvaluations = orgStudentExams.filter(se => se.status === "submitted").length;
    const completedEvaluations = orgStudentExams.filter(se => se.status === "evaluated").length;

    res.json({
      studentsCount,
      teachersCount,
      cohortsCount,
      examsCount,
      totalAllotments,
      pendingEvaluations,
      completedEvaluations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

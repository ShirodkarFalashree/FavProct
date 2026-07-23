import GeneratedExam from "../models/GeneratedExam.js";
import QuestionBank from "../models/QuestionBank.js";
import User from "../models/User.js";
import StudentExam from "../models/StudentExam.js";
import { sendEmail } from "../utils/emailService.js";
import XLSX from "xlsx";
import fs from "fs";

export const createExam = async (req, res) => {
  try {
    const {
      title,
      code,
      questionBankId,
      organizationId,
      userId,
      duration,
      totalMarks,
      scheduledDateTime,
      settings,
      difficultyDistribution
    } = req.body;

    const debugMode = req.query.debug === "true";

    // Safe parsing in case of multipart form transmission
    const settingsObj = typeof settings === "string" ? JSON.parse(settings) : settings;
    const difficultyDistributionObj = typeof difficultyDistribution === "string" ? JSON.parse(difficultyDistribution) : difficultyDistribution;
    const parsedTotalMarks = Number(totalMarks);
    const parsedDuration = Number(duration);

    const qb = await QuestionBank.findById(questionBankId);

    if (!qb) {
      return res.status(404).json({ message: "Question bank not found" });
    }

    let questions = qb.questions;

    // 🔥 FIX: FORCE CORRECT DIFFICULTY FROM MARKS
    questions = questions.map(q => {
      let difficulty = q.difficulty;

      if (q.marks === 1) difficulty = "easy";
      else if (q.marks === 2) difficulty = "medium";
      else if (q.marks === 3) difficulty = "hard";

      return { ...q.toObject(), difficulty };
    });

    // 🔥 COUNT → MARKS
    const easyCount = difficultyDistributionObj?.easy || 0;
    const mediumCount = difficultyDistributionObj?.medium || 0;
    const hardCount = difficultyDistributionObj?.hard || 0;

    const easyMarks = easyCount * 1;
    const mediumMarks = mediumCount * 2;
    const hardMarks = hardCount * 3;

    if (easyMarks + mediumMarks + hardMarks !== parsedTotalMarks) {
      return res.status(400).json({
        message: "Difficulty marks must sum to totalMarks",
        ...(debugMode && { debug: { easyMarks, mediumMarks, hardMarks } })
      });
    }

    // 🧠 DEBUG OBJECT
    const debug = {
      selected: [],
      skipped: [],
      stats: {
        currentMarks: 0,
        easy: 0,
        medium: 0,
        hard: 0
      }
    };

    // 🧠 HELPER
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    // 🧠 GROUPING
    const grouped = {};
    const individual = [];

    questions.forEach(q => {
      if (q.order) {
        const key = q.order[0];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(q);
      } else {
        individual.push(q);
      }
    });

    const groupList = shuffle(Object.values(grouped));
    const remaining = shuffle(individual);

    let selected = [];
    let currentMarks = 0;
    let currentEasy = 0;
    let currentMedium = 0;
    let currentHard = 0;

    // 🔥 STEP 1: GROUPS
    for (const group of groupList) {
      const groupMarks = group.reduce((sum, q) => sum + q.marks, 0);

      const groupEasy = group.filter(q => q.difficulty === "easy")
        .reduce((s, q) => s + q.marks, 0);

      const groupMedium = group.filter(q => q.difficulty === "medium")
        .reduce((s, q) => s + q.marks, 0);

      const groupHard = group.filter(q => q.difficulty === "hard")
        .reduce((s, q) => s + q.marks, 0);

      if (currentMarks + groupMarks > parsedTotalMarks) {
        debug.skipped.push({ type: "group", reason: "exceeds totalMarks", group });
        continue;
      }

      if (currentEasy + groupEasy > easyMarks) {
        debug.skipped.push({ type: "group", reason: "exceeds easy limit", group });
        continue;
      }

      if (currentMedium + groupMedium > mediumMarks) {
        debug.skipped.push({ type: "group", reason: "exceeds medium limit", group });
        continue;
      }

      if (currentHard + groupHard > hardMarks) {
        debug.skipped.push({ type: "group", reason: "exceeds hard limit", group });
        continue;
      }

      selected.push(...group);

      group.forEach(q => {
        debug.selected.push({
          id: q.questionId,
          marks: q.marks,
          difficulty: q.difficulty,
          order: q.order
        });
      });

      currentMarks += groupMarks;
      currentEasy += groupEasy;
      currentMedium += groupMedium;
      currentHard += groupHard;
    }

    // 🔥 STEP 2: INDIVIDUAL
    for (const q of remaining) {
      if (!q) continue;

      if (currentMarks + q.marks > parsedTotalMarks) {
        debug.skipped.push({ id: q.questionId, reason: "exceeds totalMarks" });
        continue;
      }

      if (q.difficulty === "easy" && currentEasy + q.marks > easyMarks) {
        debug.skipped.push({ id: q.questionId, reason: "exceeds easy limit" });
        continue;
      }

      if (q.difficulty === "medium" && currentMedium + q.marks > mediumMarks) {
        debug.skipped.push({ id: q.questionId, reason: "exceeds medium limit" });
        continue;
      }

      if (q.difficulty === "hard" && currentHard + q.marks > hardMarks) {
        debug.skipped.push({ id: q.questionId, reason: "exceeds hard limit" });
        continue;
      }

      selected.push(q);

      debug.selected.push({
        id: q.questionId,
        marks: q.marks,
        difficulty: q.difficulty,
        order: q.order
      });

      currentMarks += q.marks;

      if (q.difficulty === "easy") currentEasy += q.marks;
      else if (q.difficulty === "medium") currentMedium += q.marks;
      else if (q.difficulty === "hard") currentHard += q.marks;
    }

    debug.stats = {
      currentMarks,
      easy: currentEasy,
      medium: currentMedium,
      hard: currentHard
    };

    // ⚠️ FINAL CHECK
    if (currentMarks < parsedTotalMarks) {
      return res.status(400).json({
        message: "Not enough questions to satisfy totalMarks",
        details: `${currentMarks}/${parsedTotalMarks}`,
        ...(debugMode && { debug })
      });
    }

    // 🔥 SORT
    selected = selected.sort((a, b) =>
      (a.order || "").localeCompare(b.order || "")
    );

    // 💾 CREATE EXAM
    const exam = await GeneratedExam.create({
      title,
      code,
      sourceExamId: qb._id,
      organizationId,
      createdBy: userId,
      duration: parsedDuration,
      totalMarks: parsedTotalMarks,
      scheduledDateTime: scheduledDateTime || null,
      settings: {
        calculatorAllowed: settingsObj?.calculatorAllowed || false,
        negativeMarking: settingsObj?.negativeMarking !== undefined ? Number(settingsObj.negativeMarking) : 0
      },
      questions: selected
    });

    // 📬 OPTIONAL: ALLOT STUDENTS IMMEDIATELY VIA EXCEL UPLOAD
    let allotmentSummary = null;

    if (req.file) {
      try {
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

        const generatePassword = () => {
          const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let pass = "";
          for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return pass;
        };

        for (const row of data) {
          const studentName = row.StudentName || row["Student Name"] || row.studentname;
          const studentEmail = (row.StudentEmail || row["Student Email"] || row.studentemail || "").toString().trim().toLowerCase();
          const cohortName = row.Cohort || row.cohort || "";
          const className = row.Class || row.class || "";
          const evaluatorName = row.EvaluatorName || row["Evaluator Name"] || row.evaluatorname || "Default Evaluator";
          const evaluatorEmail = (row.EvaluatorEmail || row["Evaluator Email"] || row.evaluatoremail || "").toString().trim().toLowerCase();

          if (!studentName || !studentEmail || !evaluatorEmail) {
            summary.errors.push(`Missing fields in row student: ${studentName || 'N/A'}, email: ${studentEmail || 'N/A'}`);
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
                subjects: [exam.title]
              });
              summary.teachersCreated++;

              await sendEmail({
                to: evaluatorEmail,
                subject: "Your Teacher Account Created",
                text: `Hello ${evaluatorName},\n\nAn evaluator account has been created for you.\n\nYour login credentials are:\nEmail: ${evaluatorEmail}\nPassword: ${teacherTempPassword}\n\nRegards,\nAdmin Team`
              });
            } else {
              if (!teacher.subjects.includes(exam.title)) {
                teacher.subjects.push(exam.title);
                await teacher.save();

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
                subject: exam.title
              });
              summary.studentsCreated++;

              await sendEmail({
                to: studentEmail,
                subject: "Your Student Account Created & Exam Allotted",
                text: `Hello ${studentName},\n\nYou have been registered on the assessment system.\n\nCredentials:\nEmail: ${studentEmail}\nPassword: ${studentTempPassword}\n\nAn exam has been allotted: "${exam.title}". Please log in to complete it.\n\nRegards,\nAdmin Team`
              });
            } else {
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

        allotmentSummary = summary;
      } catch (err) {
        console.error("Excel allotment failed inside createExam:", err);
      }
    }

    res.json({
      message: "Exam created successfully",
      exam,
      allotmentSummary,
      ...(debugMode && { debug })
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExams = async (req, res) => {
  try {
    const { organizationId } = req.query;
    if (!organizationId) {
      return res.status(400).json({ message: "organizationId is required" });
    }

    const exams = await GeneratedExam.find({ organizationId }).sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await GeneratedExam.findByIdAndDelete(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    // Delete all allotments associated with this exam
    await StudentExam.deleteMany({ examId });
    res.json({ message: "Exam and associated student allotments deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
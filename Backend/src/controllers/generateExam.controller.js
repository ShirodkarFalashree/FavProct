import GeneratedExam from "../models/GeneratedExam.js";
import QuestionBank from "../models/QuestionBank.js";

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
    const easyCount = difficultyDistribution?.easy || 0;
    const mediumCount = difficultyDistribution?.medium || 0;
    const hardCount = difficultyDistribution?.hard || 0;

    const easyMarks = easyCount * 1;
    const mediumMarks = mediumCount * 2;
    const hardMarks = hardCount * 3;

    if (easyMarks + mediumMarks + hardMarks !== totalMarks) {
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

      if (currentMarks + groupMarks > totalMarks) {
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

      if (currentMarks + q.marks > totalMarks) {
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
    if (currentMarks < totalMarks) {
      return res.status(400).json({
        message: "Not enough questions to satisfy totalMarks",
        details: `${currentMarks}/${totalMarks}`,
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
      duration,
      totalMarks,
      scheduledDateTime: scheduledDateTime || null,
      settings: {
        calculatorAllowed: settings?.calculatorAllowed || false,
        negativeMarking: settings?.negativeMarking || 0
      },
      questions: selected
    });

    res.json({
      message: "Exam created successfully",
      exam,
      ...(debugMode && { debug })
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
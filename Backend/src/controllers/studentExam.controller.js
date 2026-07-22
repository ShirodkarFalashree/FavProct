import StudentExam from "../models/StudentExam.js";
import GeneratedExam from "../models/GeneratedExam.js";
import User from "../models/User.js";

// Student: Get allotted & completed exams
export const getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const allotments = await StudentExam.find({ studentId })
      .populate("examId")
      .populate("evaluatorId", "name email")
      .sort({ createdAt: -1 });

    const available = [];
    const pending = [];
    const graded = [];

    allotments.forEach((allotment) => {
      if (allotment.status === "allotted") {
        available.push(allotment);
      } else if (allotment.status === "started" || allotment.status === "submitted") {
        pending.push(allotment);
      } else if (allotment.status === "evaluated") {
        graded.push(allotment);
      }
    });

    res.json({ available, pending, graded });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student: Start exam (strips correct answers for security)
export const startExam = async (req, res) => {
  try {
    const { studentExamId } = req.params;
    const { studentId } = req.body;

    const allotment = await StudentExam.findById(studentExamId).populate("examId");
    if (!allotment) {
      return res.status(404).json({ message: "Exam allotment not found" });
    }

    if (allotment.studentId.toString() !== studentId) {
      return res.status(403).json({ message: "Unauthorized access to this exam" });
    }

    if (allotment.status === "submitted" || allotment.status === "evaluated") {
      return res.status(400).json({ message: "Exam already submitted/evaluated" });
    }

    if (allotment.status === "allotted") {
      allotment.status = "started";
      allotment.startedAt = new Date();
      await allotment.save();
    }

    // Clone the exam and strip the correct answers from questions
    const examObj = allotment.examId.toObject();
    const secureQuestions = examObj.questions.map((q) => {
      const { correctAnswer, ...secureQ } = q;
      return secureQ;
    });

    examObj.questions = secureQuestions;

    res.json({
      allotment: {
        _id: allotment._id,
        status: allotment.status,
        startedAt: allotment.startedAt,
        answers: allotment.answers
      },
      exam: examObj
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student: Submit exam
export const submitExam = async (req, res) => {
  try {
    const { studentExamId } = req.params;
    const { studentId, answers } = req.body; // answers: [{ questionId, studentAnswer }]

    const allotment = await StudentExam.findById(studentExamId).populate("examId");
    if (!allotment) {
      return res.status(404).json({ message: "Exam allotment not found" });
    }

    if (allotment.studentId.toString() !== studentId) {
      return res.status(403).json({ message: "Unauthorized access to this exam" });
    }

    if (allotment.status !== "started") {
      return res.status(400).json({ message: "Exam must be started before submission" });
    }

    const exam = allotment.examId;
    const questions = exam.questions;
    const gradedAnswers = [];

    // Process and auto-grade MCQs
    questions.forEach((q) => {
      const studentAnsObj = answers.find((a) => a.questionId === q.questionId);
      const studentAnswer = studentAnsObj ? studentAnsObj.studentAnswer : null;

      let isCorrect = false;
      let marksAwarded = 0;

      if (q.type === "MCQ") {
        if (studentAnswer !== null && studentAnswer !== undefined) {
          isCorrect = studentAnswer.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase();
          if (isCorrect) {
            marksAwarded = q.marks || 1;
          } else {
            const negativeFactor = exam.settings?.negativeMarking || 0;
            marksAwarded = -1 * (q.marks || 1) * negativeFactor;
          }
        }
      } else {
        // Subjective question - will be graded by teacher
        isCorrect = false;
        marksAwarded = 0;
      }

      gradedAnswers.push({
        questionId: q.questionId,
        studentAnswer,
        isCorrect,
        marksAwarded,
        feedback: ""
      });
    });

    allotment.answers = gradedAnswers;
    allotment.status = "submitted";
    allotment.submittedAt = new Date();
    await allotment.save();

    res.json({ message: "Exam submitted successfully", status: allotment.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Get evaluations dashboard
export const getTeacherDashboard = async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId) {
      return res.status(400).json({ message: "teacherId is required" });
    }

    const allotments = await StudentExam.find({ evaluatorId: teacherId })
      .populate("studentId", "name email cohort")
      .populate("examId")
      .sort({ updatedAt: -1 });

    const pending = [];
    const evaluated = [];

    allotments.forEach((allotment) => {
      // Exclude allotments that haven't been submitted yet
      if (allotment.status === "submitted") {
        pending.push(allotment);
      } else if (allotment.status === "evaluated") {
        evaluated.push(allotment);
      }
    });

    res.json({ pending, evaluated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Get single exam attempt detail (including questions + correct answers)
export const getStudentExamDetail = async (req, res) => {
  try {
    const { studentExamId } = req.params;

    const allotment = await StudentExam.findById(studentExamId)
      .populate("studentId", "name email cohort")
      .populate("examId");

    if (!allotment) {
      return res.status(404).json({ message: "Student exam attempt not found" });
    }

    res.json(allotment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Teacher: Evaluate and score student exam
export const evaluateExam = async (req, res) => {
  try {
    const { studentExamId } = req.params;
    const { answersScores, overallFeedback } = req.body; // answersScores: [{ questionId, marksAwarded, feedback }]

    const allotment = await StudentExam.findById(studentExamId).populate("examId");
    if (!allotment) {
      return res.status(404).json({ message: "Student exam not found" });
    }

    if (allotment.status !== "submitted") {
      return res.status(400).json({ message: "Exam has not been submitted or already evaluated" });
    }

    const exam = allotment.examId;

    // Update marks for each question
    answersScores.forEach((scoreObj) => {
      const studentAnsRecord = allotment.answers.find((a) => a.questionId === scoreObj.questionId);
      if (studentAnsRecord) {
        // Find corresponding question to check max marks
        const q = exam.questions.find((qi) => qi.questionId === scoreObj.questionId);
        const maxMarks = q ? q.marks : 1;

        // Cap marks at max marks, allow negative grading if configured
        studentAnsRecord.marksAwarded = Math.min(Number(scoreObj.marksAwarded), maxMarks);
        studentAnsRecord.feedback = scoreObj.feedback || "";
        
        // For subjective, check correct if they got full marks
        if (q && q.type !== "MCQ") {
          studentAnsRecord.isCorrect = studentAnsRecord.marksAwarded >= maxMarks;
        }
      }
    });

    // Sum total marks obtained
    const totalScore = allotment.answers.reduce((sum, ans) => sum + ans.marksAwarded, 0);

    allotment.marksObtained = totalScore;
    allotment.feedback = overallFeedback || "";
    allotment.status = "evaluated";
    allotment.evaluatedAt = new Date();

    await allotment.save();

    res.json({ message: "Exam evaluated successfully", allotment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

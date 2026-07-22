import mongoose from "mongoose";

const studentAnswerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  studentAnswer: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  marksAwarded: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ""
  }
});

const studentExamSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GeneratedExam",
      required: true
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["allotted", "started", "submitted", "evaluated"],
      default: "allotted"
    },
    startedAt: {
      type: Date,
      default: null
    },
    submittedAt: {
      type: Date,
      default: null
    },
    answers: {
      type: [studentAnswerSchema],
      default: []
    },
    marksObtained: {
      type: Number,
      default: null
    },
    feedback: {
      type: String,
      default: ""
    },
    evaluatedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Ensure a student can only be allotted a specific exam once
studentExamSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export default mongoose.model("StudentExam", studentExamSchema);

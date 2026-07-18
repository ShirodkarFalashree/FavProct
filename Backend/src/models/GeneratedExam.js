import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionId: String,
  type: String,
  difficulty: String,

  question: String,

  options: [String],

  correctAnswer: mongoose.Schema.Types.Mixed,

  marks: Number,

  imageURL: String,

  group: String,
  order: String
});

const generatedExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  code: {
    type: String,
    required: true,
    unique: true
  },

  sourceExamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionBank"
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  duration: Number,

  totalMarks: Number,

  scheduledDateTime: {
    type: Date,
    default: null
  },

  settings: {
    calculatorAllowed: {
      type: Boolean,
      default: false
    },
    negativeMarking: {
      type: Number,
      default: 0
    }
  },

  questions: [questionSchema]

}, { timestamps: true });

export default mongoose.model("GeneratedExam", generatedExamSchema);
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

const questionBankSchema = new mongoose.Schema({
  name: String,
  code: String,

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  questions: [questionSchema]

}, { timestamps: true });

export default mongoose.model("QuestionBank", questionBankSchema);
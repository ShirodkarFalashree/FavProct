import XLSX from "xlsx";
import QuestionBank from "../models/QuestionBank.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

export const uploadQuestionBank = async (req, res) => {
  try {
    // 📄 files from multer
    const excelPath = req.files["excel"][0].path;
    const imageFiles = req.files["images"] || [];

    // 📊 read excel
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // 🔥 filename → cloudinary URL map
    const imageMap = {};

    // 🧠 upload all images
    for (const file of imageFiles) {
      const uploadRes = await cloudinary.uploader.upload(file.path, {
        folder: "question-bank"
      });

      // map original file name → cloud URL
      imageMap[file.originalname] = uploadRes.secure_url;

      // cleanup uploaded temp file
      fs.unlinkSync(file.path);
    }

    // 🧠 map questions
    const questions = data.map((row, index) => ({
      questionId: (index + 1).toString(),

      type: row.QuestionType,
      difficulty: "medium",

      question: row.QuestionText,

      options: [
        row.OptionA,
        row.OptionB,
        row.OptionC,
        row.OptionD
      ].filter(opt => opt && opt.toString().trim() !== ""),

      correctAnswer:
        row.QuestionType === "MCQ"
          ? row.CorrectAnswer.toString()
          : row.CorrectAnswer?.toString(),

      marks: Number(row.Marks) || 1,

      // 🔥 match Excel filename with uploaded images
      imageURL: imageMap[row.ImageFileName] || null,

      group: row.group || null,
      order: row.order || ""
    }));

    // 💾 save question bank
    const questionBank = await QuestionBank.create({
      name: req.body.name,
      code: req.body.code,
      organizationId: req.body.organizationId,
      createdBy: req.body.userId,
      questions
    });

    // 🧹 cleanup excel
    fs.unlinkSync(excelPath);

    res.json({
      message: "Question bank uploaded successfully",
      questionBank
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
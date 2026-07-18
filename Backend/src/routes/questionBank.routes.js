// import express from "express";
// import multer from "multer";
// import { uploadQuestionBank } from "../controllers/questionBank.controller.js";

// const router = express.Router();

// // 📦 Multer config (stores file temporarily in uploads/)
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   }
// });

// const upload = multer({ storage });

// router.post(
//   "/upload",
//   upload.fields([
//     { name: "excel", maxCount: 1 },
//     { name: "zip", maxCount: 1 }
//   ]),
//   uploadQuestionBank
// );

// export default router;


import express from "express";
import multer from "multer";
import { uploadQuestionBank } from "../controllers/questionBank.controller.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.fields([
    { name: "excel", maxCount: 1 },
    { name: "images", maxCount: 100 }
  ]),
  uploadQuestionBank
);

export default router;
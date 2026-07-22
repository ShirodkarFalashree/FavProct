import express from "express";
import cors from "cors";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orgRoutes from "./routes/organization.routes.js";
import questionBankRoutes from "./routes/questionBank.routes.js";
import examRoutes from "./routes/exam.routes.js";
import cohortRoutes from "./routes/cohort.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentExamRoutes from "./routes/studentExam.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/question-bank", questionBankRoutes);
app.use("/api/cohorts", cohortRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student-exams", studentExamRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

export default app;
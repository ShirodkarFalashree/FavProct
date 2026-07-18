import express from "express";
import cors from "cors";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orgRoutes from "./routes/organization.routes.js";
import questionBankRoutes from "./routes/questionBank.routes.js";
import examRoutes from "./routes/exam.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/question-bank", questionBankRoutes);
app.get("/", (req, res) => {
  res.send("API Running...");
});

export default app;
import express from "express";
import "dotenv/config";
import cors from "cors";
import userController from "./user/user.controller";
import lvmdp1Controller from "./lvmdp/LVMDP_1/lvmdp_1.controller";
import lvmdp2Controller from "./lvmdp/LVMDP_2/lvmdp_2.controller";
import lvmdp3Controller from "./lvmdp/LVMDP_3/lvmdp_3.controller";
import lvmdp4Controller from "./lvmdp/LVMDP_4/lvmdp_4.controller";
import lvmdp1DailyReportController from "./lvmdp/LVMDP_1/lvmdp_1.dailyReport.controller";
import lvmdp2DailyReportController from "./lvmdp/LVMDP_2/lvmdp_2.dailyReport.controller";
import lvmdp3DailyReportController from "./lvmdp/LVMDP_3/lvmdp_3.dailyReport.controller";
import lvmdp4DailyReportController from "./lvmdp/LVMDP_4/lvmdp_4.dailyReport.controller";
import productionController from "./production/production.controller";
import packingController from "./packing/packing.controller";
import dailyReportRouter from "./routes/dailyReport.router";
import lvmdpRouter from "./routes/lvmdp.router";
import debugRouter from "./routes/debug.router";
import authController from "./auth/auth.controller";
import usersController from "./auth/users.controller";
import { authMiddleware } from "./auth/auth.middleware";
import "./utils/pgTimezoneFix";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:30",
      "http://localhost:31",
      "http://10.125.48.102",
      "http://10.125.48.102:30",
      "http://10.125.48.102:5173",
      "http://10.125.48.102:3000",
      "http://10.125.48.102:3001",
      "http://localhost",
    ],
    credentials: true,
  })
);

// Disable caching for all API responses
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// const PORT = Number(process.env.PORT);

app.get("/api", (_req, res) => {
  res.send("Sukses landing ke endpoint api");
});

// Auth routes (public)
app.use("/api/auth", authController);

// Users management routes (admin only)
app.use("/api/users", usersController);

// Protected routes - apply auth middleware
app.use("/api/lvmdp", authMiddleware, lvmdpRouter);
app.use("/debug", debugRouter);

app.use("/api/user", authMiddleware, userController);
app.use("/api/lvmdp1", authMiddleware, lvmdp1Controller);
app.use("/api/lvmdp1/daily-report", authMiddleware, lvmdp1DailyReportController);
app.use("/api/lvmdp2", authMiddleware, lvmdp2Controller);
app.use("/api/lvmdp2/daily-report", authMiddleware, lvmdp2DailyReportController);
app.use("/api/lvmdp3", authMiddleware, lvmdp3Controller);
app.use("/api/lvmdp3/daily-report", authMiddleware, lvmdp3DailyReportController);
app.use("/api/lvmdp4", authMiddleware, lvmdp4Controller);
app.use("/api/lvmdp4/daily-report", authMiddleware, lvmdp4DailyReportController);

// Production & Packing routes
app.use("/api/production", authMiddleware, productionController);
app.use("/api/packing", authMiddleware, packingController);

// Utility Consumption routes
import utilityController from "./utility/utility.controller";
app.use("/api/utility", authMiddleware, utilityController);

// Daily Report routes
app.use("/api/daily-report", authMiddleware, dailyReportRouter);

// Hourly Report routes
import hourlyReportRouter from "./routes/hourlyReport.router";
app.use("/api/hourly-report", authMiddleware, hourlyReportRouter);

// Summary routes
import summaryRouter from "./routes/summary.router";
app.use("/api/summary", authMiddleware, summaryRouter);

// Electrical Report routes (Professional reporting system)
import electricalReportRouter from "./routes/electricalReport.router";
app.use("/api/report", authMiddleware, electricalReportRouter);

// Visibility settings routes (Role-based UI visibility)
import visibilityController from "./visibility/visibility.controller";
app.use("/api/visibility", authMiddleware, visibilityController);

// Multi-plant routes
import metadataRouter from "./routes/metadata.router";
import globalRouter from "./routes/global.router";
import plantRouter from "./routes/plant.router";
import machineRouter from "./routes/machine.router";

app.use("/api/metadata", authMiddleware, metadataRouter);
app.use("/api/global", authMiddleware, globalRouter);
app.use("/api/plants", authMiddleware, plantRouter);
app.use("/api/machine", authMiddleware, machineRouter);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

export default app;

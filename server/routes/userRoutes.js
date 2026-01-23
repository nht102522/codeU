import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getLectureProgress,
  getUserData,
  markLectureComplete,
  updateProfile,
} from "../controllers/userController.js";
const userRouter = express.Router();
userRouter.get("/data", userAuth, getUserData);
userRouter.get("/progress", userAuth, getLectureProgress);
userRouter.post("/progress", userAuth, markLectureComplete);
userRouter.put("/profile", userAuth, updateProfile);

export default userRouter;

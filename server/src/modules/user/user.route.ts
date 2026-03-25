import { Router } from "express";
import * as UserController from "./user.controller";
import { userAuth, adminAuth } from "../../middleware/auth.middleware";

const userRouter: Router = Router();

// 🔐 Admin only: List all students
userRouter.get("/", adminAuth, UserController.getUsers);

// 🔓 User/Admin: Get profile
userRouter.get("/:id", userAuth, UserController.getUserById);

// 🔓 User/Admin: Update profile
userRouter.patch("/:id", userAuth, UserController.updateUser);

// 🔐 Admin only: Remove a user
userRouter.delete("/:id", adminAuth, UserController.deleteUser);

export default userRouter;
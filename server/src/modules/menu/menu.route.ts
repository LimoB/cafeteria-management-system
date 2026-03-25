import { Router } from "express";
import * as MenuController from "./menu.controller";
import { adminAuth, userAuth } from "../../middleware/auth.middleware";
import { upload } from "../../config/cloudinary"; 

const menuRouter: Router = Router();

// Public / Student
menuRouter.get("/", MenuController.getMenu);
menuRouter.get("/:id", userAuth, MenuController.getMenuItem);

// Admin Protected
menuRouter.post("/", adminAuth, upload.single("image"), MenuController.createMenuItem);
menuRouter.patch("/:id", adminAuth, upload.single("image"), MenuController.updateMenuItem);
menuRouter.delete("/:id", adminAuth, MenuController.deleteMenuItem);

export default menuRouter;
import { Router } from "express";
import * as LocationController from "./location.controller";
import { adminAuth, userAuth } from "../../middleware/auth.middleware";

const locationRouter: Router = Router();

/**
 * PATH: /api/locations
 */

// 🔓 User/Student: View available pickup points
locationRouter.get("/", userAuth, LocationController.getLocations);

// 🔐 Admin Only: Create a new location
locationRouter.post("/", adminAuth, LocationController.createLocation);

// 🔐 Admin Only: Delete a location
locationRouter.delete("/:id", adminAuth, LocationController.deleteLocation);

export default locationRouter;
import { Router } from "express";
import { AuthController } from "./AuthControllers";

const router: Router = Router();

router.post("/auth/login", AuthController);
router.post("/auth/signup", AuthController);

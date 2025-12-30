import { Router } from "express";
import {
  register,
  googleRegister,
  login,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController";
const router = Router();
router.post("/login", login);
router.post("/register", register);
router.post("/google", googleRegister);
router.post("/request-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;

import express from "express";
const router = express.Router();

import accountController from "./../../controllers/accountController.js"
const account = new accountController()
router.get('/',account.getInformationOfUser)
router.post("/",account.createAccount)
router.put("/:id", account.updateAccount)
router.delete("/:id", account.deleteAccount)
router.post("/login",account.login)
router.post("/register",account.register)
export default router
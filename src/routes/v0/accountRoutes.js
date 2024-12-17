import express from "express";
const router = express.Router();

import accountController from "./../../controllers/accountController.js"
const account = new accountController()
router.get('/',account.getAllInformationOfUser)
router.get("/:id",account.getOneInformationOfUser)
router.post("/",account.createAccount)
router.put("/:id", account.updateAccount)
router.delete("/:id", account.deleteAccount)

export default router
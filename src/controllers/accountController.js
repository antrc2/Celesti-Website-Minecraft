// accountController.js
import accountModel from "../models/accountModel.js"

class accountController {
    constructor() {
        this.acc = new accountModel();
    }

    getAllInformationOfUser = async (req, res) => {
        try {
            const usersInfo = await this.acc.getAllInformationOfUsers();
            res.json(usersInfo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
    }
    getOneInformationOfUser = async (req, res) => {
        try {
            const userInfo = await this.acc.getOneInformationOfUser(req.params.id)
            res.json(userInfo);
        } catch (error) {
            
        }
    }
    createAccount = async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;
            const email = req.body.email;
            let response = await this.acc.createAccount(username,password,email);
            res.json(response)
        } catch (error) {
            
        }
      }
}

export default accountController;
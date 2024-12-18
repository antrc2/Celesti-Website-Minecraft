import accountModel from "../models/accountModel.js"
class accountController {
    constructor() {
        this.acc = new accountModel();
    }
    getInformationOfUser = async (req, res) => {
        try {
            let id=0;
            let username = ""
            if (typeof req.query.id != 'undefined') {
                id = req.query.id;

            }
            if (typeof req.query.username != "undefined") {
                username = req.query.username;

            }
            const usersInfo = await this.acc.getAllInformationOfUsers(id, username)
            res.json(usersInfo)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
    }
    createAccount = async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;
            const email = req.body.email;
            let response = await this.acc.createAccount(username, password, email);
            res.json(response)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
    }
    updateAccount = async (req, res) => {
        try {
            const id = req.params.id;
            const password = req.body.password;
            const email = req.body.email;
            const lastLogin = req.body.lastLogin;
            const roleId = req.body.roleId;
            let response = await this.acc.updateAccount(id, password, email, lastLogin, roleId);
            res.json(response)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
    }
    deleteAccount = async (req, res) => {
        try {
            const id = req.params.id
            let response = await this.acc.deleteAccount(id);
            res.json(response)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
    }
    login = async (req, res) => {
        try {
            const username = req.body.username;
            const password = req.body.password;
            let response = await this.acc.login(username,password);
            res.json(response)
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
    }
    register = async (req, res) => {
        try {
            this.createAccount(req, res);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
    }
}

export default accountController;
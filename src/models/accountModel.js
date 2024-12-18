import { response } from "express";
import database from "../config/database.js"
import crypto from "crypto"

class accountModel {
    constructor() {
        this.acc = database()
    }
    computeHash(password, salt = "") {
        return new Promise((resolve, reject) => {
            if (salt === "") {
                salt = crypto.randomBytes(8).toString('hex');  // Tạo salt nếu không có
            }
            const firstHash = crypto.createHash('sha256').update(password).digest('hex');
            const combined = firstHash + salt;
            const secondHash = crypto.createHash('sha256').update(combined).digest('hex');
            const finalHash = `$SHA$${salt}$${secondHash}`;
            resolve(finalHash);
        });
    }
    async comparePassword(password, hashedPassword) {
        return new Promise(async (resolve, reject) => {
            const parts = hashedPassword.split('$');
            if (parts.length === 4) {
                const salt = parts[2];  // Lấy salt từ kết quả hash
                const computedHash = await this.computeHash(password, salt);  // Tính lại hash với salt
                // So sánh hash đã tính với hash đã lưu
                const isMatch = crypto.timingSafeEqual(Buffer.from(hashedPassword), Buffer.from(computedHash));
                resolve(isMatch);
            } else {
                resolve(false);
            }
        });
    }
    getAllInformationOfUsers(id, username) {
        let sql = "SELECT * FROM authme WHERE 1=1 ";
        if (id != 0) {
            sql += `and id=${id} `
        }
        if (username != "") {
            sql += `and realname = '${username}'`;
        }
        return new Promise((resolve, reject) => {
            this.acc.query(sql, (err, result) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }
    getOneInformationOfUserById(id) {
        return new Promise((resolve, reject) => {
            this.acc.query(`SELECT * FROM authme WHERE id=${id}`, (err, result) => {
                if (err) reject(err)
                if (result.length == 0) {
                    resolve({ "message": "Không tìm thấy tài khoản" })
                } else {
                    resolve(result)
                }
            });
        });
    }
    async getOneInformationOfUserByUsername(username) {
        return new Promise(async (resolve, reject) => {
            this.acc.query(`SELECT * FROM authme WHERE realname='${username}'`, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
    checkIssetEmail(email) {
        return new Promise((resolve, reject) => {
            this.acc.query(`SELECT * FROM authme WHERE email='${email}'`, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
    async createAccount(username, password, email) {
        try {
            let sql = ""
            let response = {};
            let userInfo = await this.getOneInformationOfUserByUsername(username);
            if (userInfo.length > 0) {
                response = {
                    "message": "Tài khoản đã tồn tại"
                };
                return response;
            }
            const hashedPassword = await this.computeHash(password);
            let regDate = Date.now();
            let lastLogin = Date.now();
            let usernameButLowerCase = username.toLowerCase();
            if (typeof email != "undefined") {
                let emailInfo = await this.checkIssetEmail(email);
                if (emailInfo.length > 0) {
                    response = {
                        "message": "Email đã tồn tại"
                    };
                    return response;
                }
                sql = `INSERT INTO authme (username, realname, password,email, lastlogin, regdate) VALUES ('${usernameButLowerCase}', '${username}', '${hashedPassword}','${email}', ${lastLogin}, ${regDate})`
            } else {
                sql = `INSERT INTO authme (username, realname, password, lastlogin, regdate) VALUES ('${usernameButLowerCase}', '${username}', '${hashedPassword}', ${lastLogin}, ${regDate})`
            }

            await new Promise((resolve, reject) => {
                this.acc.query(sql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
                );
            });
            response = {
                "message": "Tạo tài khoản thành công"
            };
            return response;
        } catch (error) {
            return { "message": "Có lỗi xảy ra" };
        }
    }
    async updateAccount(id, password, email, lastLogin, roleId) {
        try {
            let response = {};
            let updates = [];
            let params = [];
            if (password) {
                const hashedPassword = await this.computeHash(password);
                updates.push("password = ?");
                params.push(hashedPassword);
            }
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return { "message": "Email không hợp lệ" };
                } else {
                    const emailExists = await this.checkIssetEmail(email);
                    if (emailExists.length > 0) {
                        return { "message": "Email đã tồn tại" };
                    } else {
                        updates.push("email = ?");
                        params.push(email);
                    }
                }
            }
            if (lastLogin) {
                if (!Number.isInteger(lastLogin)) {
                    return { "message": "lastLogin phải là số nguyên" };
                } else {
                    updates.push("lastlogin = ?");
                    params.push(lastLogin);
                }
            }
            if (roleId) {
                if (!Number.isInteger(roleId)) {
                    return { "message": "roleId phải là số nguyên" };
                } else {
                    updates.push("role_id = ?");
                    params.push(roleId);
                }
            }
            if (updates.length === 0) {
                return { "message": "Không có thông tin nào được cập nhật" };
            }
            const sql = `UPDATE authme SET ${updates.join(', ')} WHERE id = ?`;
            params.push(id);
            await new Promise((resolve, reject) => {
                this.acc.query(sql, params, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            response = { "message": "Cập nhật tài khoản thành công" };
            return response;
        } catch (error) {
            console.log(error);
            return { "message": "Có lỗi xảy ra" };
        }
    }
    deleteAccount(id) {
        return new Promise((resolve, reject) => {
            this.acc.query(`DELETE FROM authme WHERE id=${id}`, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    let response = {
                        "message": "Xóa tài khoản thành công"
                    }
                    resolve(response);
                }
            })
        })
    }
    async login(username, password) {
        let response = {}
        const userInfo = await this.getOneInformationOfUserByUsername(username);
        if (userInfo.length == 0) {
            response = {
                "message": "Tài khoản không tồn tại"
            }
            return response;
        } else {
            let hashedPassword = userInfo[0].password;
            if (await this.comparePassword(password, hashedPassword)) {
                response = {
                    "message": "Đăng nhập thành công"
                }
                return response
            } else {
                response = {
                    "message": "Sai mật khẩu"
                }
                return response
            }
        }
    }
}

export default accountModel;

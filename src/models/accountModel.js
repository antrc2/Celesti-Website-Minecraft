// accountModel.js
import { response } from "express";
import database from "../config/database.js"
import crypto from "crypto"

class accountModel {
    constructor() {
        this.acc = database()
    }

    // Tạo hash cho mật khẩu
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

    // Hàm kiểm tra mật khẩu
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

    // Lấy tất cả thông tin người dùng
    getAllInformationOfUsers() {
        return new Promise((resolve, reject) => {
            this.acc.query("SELECT * FROM authme", (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    // Lấy thông tin người dùng theo id
    getOneInformationOfUserById(id) {
        return new Promise((resolve, reject) => {
            this.acc.query(`SELECT * FROM authme WHERE id=${id}`, (err, result) => {
                if(err) reject(err)
                if(result.length==0){
                    resolve({"message":"Không tìm thấy tài khoản"})
                } else {
                    resolve(result)
                }
            });
        });
    }

    // Lấy thông tin người dùng theo username
    async getOneInformationOfUserByUsername(username) {
        return new Promise( async (resolve, reject) => {
            this.acc.query(`SELECT * FROM authme WHERE realname='${username}'`, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    // Kiểm tra email đã tồn tại chưa
    checkIssetEmail(email) {
        return new Promise((resolve, reject) => {
            this.acc.query(`SELECT * FROM authme WHERE email='${email}'`, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    // Tạo tài khoản
    async createAccount(username, password, email) {
        try {
            let response = {};

            // Kiểm tra tài khoản đã tồn tại
            let userInfo = await this.getOneInformationOfUserByUsername(username);
            if (userInfo.length > 0) {
                response = {
                    "message": "Tài khoản đã tồn tại"
                };
                return response;  // Trả kết quả ngay
            }

            // Kiểm tra email đã tồn tại
            if (email !== "") {
                let emailInfo = await this.checkIssetEmail(email);
                if (emailInfo.length > 0) {
                    response = {
                        "message": "Email đã tồn tại"
                    };
                    return response;  // Trả kết quả ngay
                }
            }

            // Tạo tài khoản mới
            const hashedPassword = await this.computeHash(password);
            let regDate = Date.now();
            let lastLogin = Date.now();
            let usernameButLowerCase = username.toLowerCase();

            // Thực hiện chèn dữ liệu vào cơ sở dữ liệu
            await new Promise((resolve, reject) => {
                this.acc.query(
                    `INSERT INTO authme (username, realname, password,email, lastlogin, regdate) VALUES ('${usernameButLowerCase}', '${username}', '${hashedPassword}','${email}', ${lastLogin}, ${regDate})`,
                    (err, result) => {
                        if (err) {
                            reject(err);  // Nếu có lỗi, reject với lỗi
                        } else {
                            resolve(result);  // Nếu thành công, resolve với kết quả
                        }
                    }
                );
            });

            response = {
                "message": "Tạo tài khoản thành công"
            };
            return response;  // Trả về kết quả thành công

        } catch (error) {
            return { "message": "Có lỗi xảy ra" };  // Nếu có lỗi, trả về thông báo lỗi
        }
    }
    async updateAccount(id, password, email, lastLogin, roleId) {
        try {
            let response = {};
            let updates = [];
            let params = []; // Mảng chứa các tham số để truyền vào câu lệnh SQL
    
            // Kiểm tra và băm mật khẩu nếu có
            if (password) {
                const hashedPassword = await this.computeHash(password);
                updates.push("password = ?");
                params.push(hashedPassword);
            }
    
            // Kiểm tra email hợp lệ
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                // Kiểm tra tính hợp lệ của email
                if (!emailRegex.test(email)) {
                    return { "message": "Email không hợp lệ" };
                } else {
                    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
                    const emailExists = await this.checkIssetEmail(email);
                    if (emailExists.length > 0) {
                        return { "message": "Email đã tồn tại" };
                    } else {
                        // Nếu email hợp lệ và chưa tồn tại, thêm vào mảng update và params
                        updates.push("email = ?");
                        params.push(email);
                    }
                }
            }
            
    
            // Kiểm tra lastLogin là số nguyên
            if (lastLogin) {
                if (!Number.isInteger(lastLogin)) {
                    return { "message": "lastLogin phải là số nguyên" };
                } else {
                    updates.push("lastlogin = ?");
                    params.push(lastLogin);
                }
            }
    
            // Kiểm tra roleId là số nguyên
            if (roleId) {
                if (!Number.isInteger(roleId)) {
                    return { "message": "roleId phải là số nguyên" };
                } else {
                    updates.push("role_id = ?");
                    params.push(roleId);
                }
            }
    
            // Nếu không có thông tin nào để cập nhật
            if (updates.length === 0) {
                return { "message": "Không có thông tin nào được cập nhật" };
            }
    
            // Tạo câu lệnh SQL
            const sql = `UPDATE authme SET ${updates.join(', ')} WHERE id = ?`;
            params.push(id); // Thêm id vào mảng params
    
            // Thực hiện câu lệnh SQL
            await new Promise((resolve, reject) => {
                this.acc.query(sql, params, (err, result) => {
                    if (err) {
                        reject(err); // Nếu có lỗi, reject lỗi
                    } else {
                        resolve(result); // Nếu thành công, resolve với kết quả
                    }
                });
            });
    
            response = { "message": "Cập nhật tài khoản thành công" };
            return response;
        } catch (error) {
            console.log(error);
            return { "message": "Có lỗi xảy ra" }; // Nếu có lỗi, trả về thông báo lỗi
        }
    }
    deleteAccount(id){
        return new Promise((resolve,reject)=>{
            this.acc.query(`DELETE FROM authme WHERE id=${id}`,(err,result)=>{
                if (err) {
                    reject(err); // Nếu có lỗi, reject lỗi
                } else {
                    let response = {
                        "message": "XÓa tài khoản thành công"
                    }
                    resolve(response); // Nếu thành công, resolve với kết quả
                }
            })
        })
    }
    
}

export default accountModel;

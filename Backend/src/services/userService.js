const User = require("../config/models/userModel")
const CryptService = require("./crypt-service")
const cryptService = new CryptService()
const jwt = require("jsonwebtoken")

const userServices = {
    add_user_by_email: _add_user_by_email,
    login_user_by_email: _login_user_by_email,
    createUser: _create_user,
    getUserById: _get_user_by_id,
    updateUser: _update_user,
    deleteUse: _delete_user,
    get_all_users: _get_all_users,
    getCurrentUser: _get_current_user,
    logoutUser: _logout_user
}

async function _add_user_by_email(email, pass) {
    return new Promise(async (resolve, reject) => {
        let crypted_pass = await cryptService.cryptify(pass)
        // console.log(crypted_pass)

        User.create({
            email: email,
            password: crypted_pass
        }).then((info) => resolve(info)).catch(err => {
            console.log(err)
            reject(err)
        })
    })
};

async function _login_user_by_email(email, pass) {
    return new Promise(async (resolve, reject) => {
        let data = await User.find({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        let user = data[0]
        if (!user)
            return reject("Invalid credentials.")
        const match = await cryptService.verify(pass, user.password)

        if (match) {
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );
            return resolve({ user: { ...user._doc, role: user.role }, token })
        } else {
            return reject("Invalid credentials.")
        }
    })
};

async function _get_all_users() {
    let users = await User.find({ email: { $ne: 'ADMIN' } })
    return users
}

async function _create_user(userData) {
    userData.password = await cryptService.cryptify(userData.password)
    const user = new User(userData);
    return await user.save();
};

async function _get_user_by_id(id) {
    return await User.findById(id)
};

async function _update_user(id, userData) {
    if (userData.password)
        userData.password = await cryptService.cryptify(userData.password)
    return await User.findByIdAndUpdate(id, userData, { new: true });
};

async function _delete_user(id) {
    return await User.findByIdAndDelete(id);
};
async function _get_current_user(userId) {
    return await User.findById(userId)

}

async function _logout_user(userId) {
    return true;
}


module.exports = userServices
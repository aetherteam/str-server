const validation = require("../utils/validation");
const User = require("../classes/user.js");
const { encrypt, compare } = require("../utils/encryption.js");
const results = require("../utils/results.js");

module.exports = {
    registration: async function (
        email,
        password,
        passwordConfirmation,
        username,
        nickname,
        tempUser
    ) {
        console.log("[Registraion] process started");

        if (
            !validation.email(email) ||
            !validation.passwords(password, passwordConfirmation) ||
            !validation.basic(username)
        ) {
            console.log("[Registraion] one or more fields was invalid");
            return results.error("Invalid user data", 400);
        }

        const doUserExists = await User.isExists({ email, nickname });
        if (doUserExists.result) {
            if (doUserExists.user.registered == true) return results.error("User already exists", 400);
        }

        // TODO: if tempuser does not exists - create him
        if (!tempUser) {
            tempUser = await User.createTempUser();
        }

        const createdUser = await User.create(
            username,
            nickname,
            email,
            encrypt(password),
            tempUser.data
        );

        console.log(createdUser);
        if (createdUser.success) {
            console.log("[Registraion] process finished with success");
            return results.successWithData(createdUser.data);
        }
        return results.unexpectedError();
    },
    login: async function (login, password) {
        console.log("[Login] process started");

        const userCredientials = await User.findLoginCredientials(login);

        if (!userCredientials) {
            console.log("[Login] user credentials is not found");
            return results.error("Invalid login/password combination", 403);
        }

        console.log(
            "[Login] user credentials: " + JSON.stringify(userCredientials)
        );
            console.log("password: " + password)
            console.log("userCredientials.password: " + userCredientials.password)
        if (compare(password, userCredientials.password)) {
            return results.successWithData({
                id: userCredientials.id,
                key: userCredientials.key,
            });
        }
        return results.error("Invalid login/password combination", 403);
    },
    restore: async function (login) {
        // TODO: password restoration function
    },
    confirm: async function (userID, code) {},
};

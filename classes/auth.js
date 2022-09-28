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

    const errors = [];
    if (!validation.email(email)) {
        errors.push({
          type: "email",
          text: "Неправльный формат email",
        });
    }
    if (!validation.passwords(password, passwordConfirmation)) {
        errors.push({
          type: "password",
          text: "Пароли не совпадают",
        });
    }
    if (!validation.basic(username)) {
        errors.push({
          type: "username",
          text: "Недопустимая длина",
        });
    }
    if (!validation.basic(nickname)) {
        errors.push({
          type: "nickname",
          text: "Недопустимая длина",
        });
    }

    const doUserExists = await User.isExists({ email, nickname });
    if (doUserExists.result) {
      if (doUserExists.user.registered == true)
        errors.push({
          type: "general",
          text: "Пользователь с таким email/логином уже существует",
        });
      return results.error("User already exists", 400);
    }

    if (errors.length > 0) {
      console.log("[Registraion] one or more fields was invalid");
      return results.error(errors, 400);
    }
    
    if (!tempUser) {
      tempUser = await User.createTempUser();
    }
    console.log(tempUser);

    const createdUser = await User.create(
      username,
      nickname,
      email,
      encrypt(password),
      tempUser
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
    console.log("password: " + password);
    console.log("userCredientials.password: " + userCredientials.password);
    if (compare(password, userCredientials.password)) {
      const user = await User.get(userCredientials.id);
      return results.successWithData({
        id: userCredientials.id,
        key: userCredientials.key,
        ...user,
      });
    }
    return results.error("Invalid login/password combination", 400);
  },
  restore: async function (login) {
    // TODO: password restoration function
  },
  confirm: async function (userID, code) {},
};

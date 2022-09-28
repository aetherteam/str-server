const fs = require("fs");
const results = require("../utils/results");
const getImagePath = require("../utils/getImagePath.js");
const { encrypt } = require("../utils/encryption");

// TODO: create easy get function that returns everything but the statistics objects;
// TODO: user.get public and private functions
// TODO: add try/catch to all methods

module.exports = {
  create: async function (username, nickname, email, password, tempUser) {
    const usersCollection = global.mongo.collection("users");

    const userID = tempUser.id;
    const userKey = tempUser.key;
    console.log("tempUser", tempUser);

    // IDK why i wrote this if statement, but if i did so there was a reason. help.
    //
    // if (!(await compareKeyAndID(userID, userKey))) {
    //     return results.error(
    //         "You are not allowed to create user with that id",
    //         403
    //     );
    // } else {
    //     console.log("key and id is equal");
    // }

    let user = {
      username,
      nickname,
      email,
      password,
      confirmed: false,
      key: generateUserKey(32),
      registered: true,
      timestamp: Date.now(),
    };

    try {
      await usersCollection.updateOne({ id: userID }, { $set: user });
      const userForReturn = await module.exports.get(userID);
      console.log("userForReturn", userForReturn);
      createUserLikedCountDocument(userID);
      userForReturn.data.key = user.key;
      return results.successWithData(userForReturn.data);
    } catch {
      return results.error("Unexpected error", 500);
    }
  },
  isExists: async function (query) {
    const usersCollection = global.mongo.collection("users");

    try {
      const user = await usersCollection.findOne({
        $or: [{ nickname: query.nickname }, { email: query.email }],
      });

      console.log("user", user);
      if (user) {
        console.log(
          `[User] with ${query?.email} ${query?.nickname} parameters exists`
        );
        return { result: true, user: user };
      } else {
        return { result: false };
      }
    } catch {
      return results.unexpectedError();
    }
  },
  findLoginCredientials: async function (query) {
    console.log(`[User] searching ${query} credientials`);

    const usersCollection = global.mongo.collection("users");

    const user = await usersCollection.findOne({
      $or: [{ nickname: query }, { email: query }],
    });

    console.log(`[User] ${query} credientials:` + JSON.stringify(user));

    if (!user) {
      return false;
    }
    return { id: user.id, password: user.password, key: user.key };
  },
  getUserWithKey: async function (key) {
    const usersCollection = global.mongo.collection("users");

    const user = await usersCollection.findOne({ key: key });

    if (user) return user.id;
    return false;
  },
  get: async function (id, fields) {
    const usersCollection = global.mongo.collection("users");

    if (!fields) fields = ["username", "nickname", "avatar"]; // default value

    let projection = { id: 1 };

    fields.forEach((field) => {
      if (!restrictedProjectionFields.includes(field)) projection[field] = 1;
    });

    try {
      let user = await usersCollection.findOne(
        { id: parseInt(id) },
        { projection: projection }
      );

      if (user) {
        if (projection?.avatar) {
          user.avatar = getImagePath("avatar", id);
        }
        return results.successWithData(user);
      }
      return results.error("User not found", 400);
    } catch {
      return results.unexpectedError();
    }
  },
  getMultiple: async function () {
    const usersCollection = global.mongo.collection("users");

    //TODO: finish
  },
  edit: async function (userID, updatedFileds) {
    const usersCollection = global.mongo.collection("users");

    if (!userID) {
      return results.error("User not found", 400);
    }

    let updated = {
      $set: updatedFileds,
    };

    let doKeyMustBeDropped = false;
    for (let [field, value] of Object.entries(updatedFields)) {
      if (!CONSTANT_USER_FIELDS.includes(field)) {
        if (field === "password") {
          value = encrypt(password);
          doKeyMustBeDropped = true;
        }
        updated.$set[field] = value;
      }
    }

    if (doKeyMustBeDropped) {
      updated.$set["key"] = generateUserKey(32);
    }

    const result = usersCollection.updateOne({ id: userID }, updated);

    if (!result) {
      return results.error("Unexpected error", 500);
    }

    return results.success();
  },
  createTempUser: async function () {
    const usersCollection = global.mongo.collection("users");
    global.cachedIndexes["users"]++;
    const userID = global.cachedIndexes["users"];
    console.log("Temp user ID", userID);
    const user = {
      id: userID,
      key: generateUserKey(32),
      registered: false,
      timestamp: Date.now(),
    };

    const result = await usersCollection.insertOne(user);

    if (result) {
      console.log("Temp user created successfully");
      return user;
    } else return results.unexpectedError();
  },
};

function generateUserKey(count) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < count; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function compareKeyAndID(id, key) {
  console.log("Comparing ID " + id + "with key " + key);
  const userFromKey = await module.exports.getUserWithKey(key);

  return userFromKey["id"] === id;
}

const restrictedProjectionFields = [
  "password",
  "key",
  "confirmed",
  "registered",
];

const CONSTANT_USER_FIELDS = ["key", "isRegistered", "confirmed", "id"];

async function createUserLikedCountDocument(userID) {
  const userLikedCount = global.mongo.collection("userLikedCount");

  await userLikedCount.insertOne({
    userID,
    likes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // TODO: update list when user finished his registration and chosed his favorite genres
  });
}

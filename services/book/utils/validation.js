const mongo = require("./mongodb");

module.exports = {
    email: function (email) {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(String(email).toLowerCase())) {
            console.log("[Validation] email is correct");
            return true;
        }

        console.log("[Validation] email is incorrect");
        return false;
    },
    basic: function (value) {
        if (
            value != "" &&
            value != null &&
            value.length >= 2 &&
            value.length < 150
        ) {
            console.log("[Validation] field is basically correct");
            return true;
        }

        console.log("[Validation] field is basically incorrect");
        return false;
    },
    passwords: function (password, passwordConfirmation) {
        if (password.length > 6 && password === passwordConfirmation) {
            console.log("[Validation] passwords are match");
            return true;
        }

        console.log("[Validation] passwords are not match");
        return false;
    },
    bookDescription: function (description) {
        return description.length < 1000;
    },
    chapterContent: function (chapterContent) {
        return chapterContent.length > 10 && chapterContent.length < 10000;
    },
    isRegistered: async function (userID) {
        const usersCollection = await mongo.connectWithUsersCollection();

        const user = await usersCollection.findOne({ id: userID });

        return user.registered == true && user.confirmed == true;
    },
};

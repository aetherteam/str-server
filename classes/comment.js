const User = require("./user.js");
const validation = require("../utils/validation.js");
const mongo = require("../utils/mongodb.js");
// TODO: links etc in comemnt and book description text.
module.exports = {
    create: async function (userID, bookID, text) {
        if (!validation.basic) {
            return results.error("Comment cannot be empty", 403);
        }

        const commentsCollection = global.mongo.coollection("comments");

        global.cachedIndexes['comments']++;
        const comment = {
            id: global.cachedIndexes['comments'],
            owner: userID,
            book: bookID,
            text: text,
            timestamp: Date.now(),
        };

        const result = await commentsCollection.insertOne(comment);

        if (result.success) {
            reply.code(200).send({ data: result.data });
        } else {
            reply.code(result.code).send({ message: result.message });
        }
    },
    delete: async function (userID, commentID) {
        if (!checkCommentOwnership(userID, commentID)) {
            return results.error(
                "You have no rights to delete this comment",
                403
            );
        }

        const commentsCollection = global.mongo.coollection("comments");

        const result = await commentsCollection.deleteOne({ id: commentID });

        if (result) {
            return results.success();
        } else {
            return results.unexpectedError();
        }
    },
    edit: async function (userID, commentID, text) {
        if (!checkCommentOwnership(userID, commentID)) {
            return results.error(
                "You have no rights to delete this comment",
                403
            );
        }

        const commentsCollection = global.mongo.coollection("comments");

        const updated = { $set: { text } };

        const result = commentsCollection.updateOne({ id: commentID }, updated);
        
        if (result) {
            return results.success();
        } else {
            return results.unexpectedError();
        }
    },
};

async function checkCommentOwnership(userID, commentID) {
    const commentsCollection = global.mongo.coollection("comments");
    const comment = await commentsCollection.findOne({ id: commentID });
    return comment["id"] === userID;
}

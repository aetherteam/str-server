const { MongoClient } = require("mongodb");
const config = require("./config.json");

module.exports = {
    connect: async function () {
        return await connect();
    },
    getIDForNewEntry: async function (collection) {
        const db = global.mongo.collection(collection);

        let result = await db.findOne({}, { sort: ["id", "desc"] });
        console.log("new entry result", result)
        if (result) {
            return result["id"] + 1;
        }
        return 10000001;
    },
    createGlobalConnection: async function () {
        const client = new MongoClient(config.mongoConnectionString);
        await client.connect();
        console.log("[MongoDB] connection established");
        global.mongo = client.db("was");
    },
    cacheIndexes: async function () {
        const db = global.mongo;

        let booksLastIndex = await db.collection('books').findOne({}, { sort: ["id", "desc"] });
        let usersLastIndex = await db.collection('users').findOne({}, { sort: ["id", "desc"] });
        let chaptersLastIndex = await db.collection('chapters').findOne({}, { sort: ["id", "desc"] });
        let commentsLastIndex = await db.collection('comments').findOne({}, { sort: ["id", "desc"] });

        global.cachedIndexes = {
            'users': usersLastIndex ? usersLastIndex.id : 10000001,
            'books': booksLastIndex ? booksLastIndex.id : 10000001,
            'chapters': chaptersLastIndex ? chaptersLastIndex.id : 10000001,
            'comments': commentsLastIndex ? commentsLastIndex.id : 10000001,
        }
        console.log("Cached Indexes:",global.cachedIndexes)
        console.log("[MongoDB] Indexes cached");
    }
};

async function connect() {
    console.log("connecting to db...");
    const client = new MongoClient(config.mongoConnectionString);
    await client.connect();
    console.log("db connection established");
    return client.db("was");
}

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
    createGlobalConnection: async function (coll) {
        const client = new MongoClient(config.mongoConnectionString);
        await client.connect();
        console.log("[MongoDB] connection established");
        global.db = client.db("was");
    },
    cacheIndexes: async function (coll) {
        const db = global.db;
        let usersLastIndex = await db.findOne({}, { sort: ["id", "desc"] });

        global.cachedIndexes = {
            'users': usersLastIndex ? usersLastIndex.id : 10000001,
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

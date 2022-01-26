const User = require("./classes/user.js");
const mongodb = require("./utils/mongodb");
// Require the framework and instantiate it
const qs = require("qs");
const fastify = require('fastify')({
    querystringParser: str => qs.parse(str)
  })
// String parser

//initialize global DB connection
mongodb.createGlobalConnection().then(() => {
    mongodb.cacheIndexes();
})

fastify.register(require("fastify-multipart"), {
    attachFieldsToBody: true,
    limits: { fileSize: 3000000 },
});

fastify.register(require("fastify-cors"), {
    origin: "*",
});
fastify.addHook("preValidation", async (request, reply) => {
    if (!SKIP_USER_KEY_CHECKING.includes(request.routerPath)) {
        console.log("[HOOK] GETTING USER ID FROM KEY")
        if (request.headers["content-type"].match(/(multipart\/form-data;*)/g)) {
            const usersCollection = global.mongo.collection("users");
            
            const user = await usersCollection.findOne({
                key: request.body.key.value,
            });

            if (user) {
                return { userID: parseInt(user.id), ...request.body };
            } else {
                reply
                    .code(444)
                    .send("Cannot access this method without valid user key");
            }
        }
        if (request.method === "POST") {
            const usersCollection = global.mongo.collection("users");
            
            const user = await usersCollection.findOne({
                key: request.body.key,
            });
            console.log("[HOOK] User", user.id, "with key", request.body.key, "(POST)")

            if (user) {
                request.body = { userID: parseInt(user.id), ...request.body };
            } else {
                reply
                    .code(444)
                    .send("Cannot access this method without valid user key");
            }
        } else if (request.method === "GET") {
            const usersCollection = global.mongo.collection("users");

            const user = await usersCollection.findOne({
                key: request.query.key,
            });
            console.log("[HOOK] User", user.id, "with key ", request.query.key), "(GET)"

            if (user) {
                request.query = { userID: parseInt(user.id), ...request.query };
            } else {
                reply
                    .code(444)
                    .send("Cannot access this method without valid user key");
            }
        }
    }
});

fastify.register(require("./routes/user.js"));
fastify.register(require("./routes/auth.js"));
fastify.register(require("./routes/book.js"));
fastify.register(require("./routes/uploads.js"));

fastify.get("/check/", async (request, reply) => {
    reply.code(200).send("Everything is working!");
});
// Run the server!
module.exports.start = async (port) => {
    try {
        console.log("Server listening at port " + port);
        await fastify.listen(port);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

const SKIP_USER_KEY_CHECKING = [
    "/auth/registration",
    "/auth/login",
    "/user/createTempUser",
    "/book/getOne",
    "/book/get",
    "/user/get",
];
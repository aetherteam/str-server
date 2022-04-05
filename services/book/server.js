require("dotenv").config();

const mongodb = require("./utils/mongodb");

const qs = require("qs");
const {
    default: fastifyMultipart
} = require("fastify-multipart");
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
    limits: {
        fileSize: 3000000
    },
});

fastify.register(require("fastify-cors"), {
    origin: "*",
});

fastify.register(require("./gateway.js"));

fastify.get("/check/", async (request, reply) => {
    reply.code(200).send("Everything is working!");
});

try {
    console.log("Server listening at port " + port);
    await fastify.listen(port);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}


server.start(1337);
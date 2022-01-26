const Book = require("../classes/book.js");

async function routes(fastify, options) {
    fastify.post("/book/create", async (request, reply) => {
        const rp = request.body;
        console.log(rp)
        const result = await Book.create(
            rp.name,
            [],
            rp.genres,
            rp.description,
            rp.userID
        );

        if (result.success) {
            reply.code(200).send(result);
        } else {
            reply.code(result.code).send(result);
        }
    });
    fastify.get("/book/getOne", async (request, reply) => {
        const rp = request.query;

        const result = await Book.getOne(rp.bookID);

        if (result.success) {
            reply.code(200).send(result);
        } else {
            reply.code(result.code).send(result);
        }
    });
    fastify.post("/book/addChapter", async (request, reply) => {
        console.time("Book addChapter executed in");
        const rp = request.body;
        const result = await Book.addChapter(
            rp.bookID,
            rp.name,
            rp.content,
            rp.userID
        );

        if (result.success) {
            reply.code(200).send(result);
        } else {
            reply.code(result.code).send(result);
        }
        console.timeEnd("Book addChapter executed in");
    });
    fastify.get("/book/get", async (request, reply) => {
        console.time("Book get executed in");
        console.log(request.query)
        const result = await Book.get(
            request.query.arrange,
            request.query.shift,
            request.query.count
        );

        if (result.success) {
            reply.code(200).send(result);
        } else {
            reply.code(result.code).send(result);
        }
        console.timeEnd("Book get executed in");
    });
    fastify.post("/book/like", async (request, reply) => {
        const rp = request.body;

        const result = await Book.like(rp.userID, rp.bookID);
        
        if (result.success) {
            reply.code(200).send(result);
        } else {
            reply.code(result.code).send(result);
        }
    });
}

module.exports = routes;

async function routes(fastify, options) {
    fastify.all("/user/*", async (request, reply) => {
        
        // if (result.success) {
            // reply.code(200).send(123);
        // } else reply.code(result.code).send(result);
    });
}

module.exports = routes;

module.exports = {
    getByID: async function(id) {
        const genresCollection = global.mongo.collection('genres');

        return await genresCollection.findOne({"_id": id});
    },
    getAll: async function() {
        const genresCollection = global.mongo.collection('genres');
        return await genresCollection.find();
    }
}
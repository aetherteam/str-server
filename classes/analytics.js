module.exports = {
    updateUserLikes: async function (userID, bookID, action) {
        const userLikedCount = global.mongo.collection("userLikedCount");
        const booksCollection = global.mongo.collection("books");

        const k = action == "like" ? 1 : -1;

        const book = await booksCollection.findOne({ id: bookID });
        const userLiked = await userLikedCount.findOne({ userID });

        let newLikedList = userLiked.likes;

        for (let genreID in book.genres) {
            newLikedList[genreID] += 1 * k;
        }
        console.log(newLikedList);
        await userLikedCount.updateOne(
            { userID },
            {
                $set: {
                    likes: newLikedList,
                },
            }
        );
    },
};

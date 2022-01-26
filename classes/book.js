const validation = require("../utils/validation.js");
const Genres = require("./genres.js");
const User = require("./user.js");
const results = require("../utils/results.js");
const getImagePath = require("../utils/getImagePath.js");
const Analytics = require("./analytics.js");

module.exports = {
    create: async function (
        name,
        chapters = [],
        genres = [],
        description = "",
        author
    ) {
        const booksCollection = global.mongo.collection("books");

        if (!validation.bookDescription(description)) {
            console.error("[Book] Description is too long");
            return results.error("Description is too long (>1000)", 400);
        }
        if (!validation.basic(name)) {
            console.error(
                "[Book] Name cannot be blank or be more than 150 symbols"
            );

            return results.error(
                "Name cannot be blank or be more than 150 symbols",
                400
            );
        }

        global.cachedIndexes["books"]++;
        const id = global.cachedIndexes["books"];

        const book = {
            id,
            name,
            chapters,
            genres,
            description,
            author,
            timestamp: Date.now(),
            lastUpdate: Date.now(),
            likes: 0,
            status: "inProgress",
        };

        console.log("[Book] creating", book);
        const result = booksCollection.insertOne(book);

        if (result) {
            console.log("[Book] created");
            return results.successWithData(book);
        }

        return results.error("Unexpected error", 500);
    },
    changeStatus: async function (bookID, status) {
        const booksCollection = global.mongo.collection("books");
        const book = await booksCollection.findOne({ id: parseInt(bookID) });
        const statuses = require("../utils/statuses.json");
        //TODO: finish
        if (!["inProgress", "finished", "abandoned"].includes(status)) {
            return results.error("Wrong status", 400);
        } else {

        }
    },
    checkOwnership: async function (bookID, userID) {
        const booksCollection = global.mongo.collection("books");
        const book = await booksCollection.findOne({ id: parseInt(bookID) });

        console.log(book, userID);
        return book["author"] === userID;
    },
    addChapter: async function (bookID, name, content, author) {
        const booksCollection = global.mongo.collection("books");
        const chaptersCollection = global.mongo.collection("chapters");

        const doUserHaveRights = await module.exports.checkOwnership(
            bookID,
            author
        );

        if (!validation.chapterContent(content) || !validation.basic(name)) {
            console.log("[Chapter] Fields are invalid");
            return false;
        }

        if (!doUserHaveRights) {
            console.error(
                "[Book] User have no rights to create chapter for",
                bookID
            );
            return results.error("Forbidden", 403);
        }

        global.cachedIndexes["chapters"]++;
        const chapterID = global.cachedIndexes["chapters"];

        const chapter = {
            id: chapterID,
            bookID,
            name,
            content,
            author,
            timestamp: Date.now(),
            isPublished: false,
        };

        if (await chaptersCollection.insertOne(chapter)) {
            const book = await booksCollection.findOne({
                id: parseInt(bookID),
            });

            booksCollection.updateOne(
                { id: parseInt(bookID) },
                {
                    $set: {
                        chapters: [...book["chapters"], chapterID],
                        lastUpdate: Date.now(),
                    },
                }
            );
            return results.successWithData(chapter);
        }
        return results.unexpectedError();
    },
    getChapter: async function (chapterID) {
        const chaptersCollection = global.mongo.collection("chapters");
        const chapter = chaptersCollection.findOne(
            { id: parseInt(chapterID) },
            { projection: { content: 0, author: 0 } }
        );

        return chapter;
    },
    publicshChapter: async function (chapterID) {
        const booksCollection = global.mongo.collection("books");
        const chaptersCollection = global.mongo.collection("chapters");
        const doUserHaveRights = await module.exports.checkOwnership(
            bookID,
            author
        );

        if (!doUserHaveRights) {
            console.error(
                "[Chapter] User have no rights to create chapter for",
                bookID
            );
            return results.error("Forbidden", 403);
        }

        const chapter = chaptersCollection.getOne({ id: chapterID });
        if (!chapter) {
            return results.error("Chapter is not exists", 400);
        }

        const result = await chaptersCollection.updateOne(
            { id: chapterID },
            { $set: { isPublished: true } }
        );

        if (result) {
            return results.success();
        }
        return results.unexpectedError();
    },
    getOne: async function (bookID) {
        const chaptersCollection = global.mongo.collection("chapters");
        const booksCollection = global.mongo.collection("books");

        let book = await booksCollection.findOne(
            { id: parseInt(bookID) },
            { projection: { _id: 0 } }
        );

        if (!book) {
            return results.error("Book not found", 400);
        }

        let chapters = [];
        await book.chapters.forEach(async (chapterID) => {
            let k = await module.exports.getChapterInfo(chapterID);
            chapters.push(k);
        });

        let genres = [];
        await book.genres.forEach(async (genreID) => {
            let x = await Genres.getByID(genreID);
            genres.push(x);
        });

        book.cover = getImagePath("cover", bookID);

        const author = await User.get(book.author);

        book.chapters = chapters;
        book.genres = genres;
        book.author = author.data;

        return results.successWithData(book);
    },
    get: async function (arrangeType, shift = 0, count = 10) {
        // const chaptersCollection = global.mongo.collection("chapters");
        const booksCollection = global.mongo.collection("books");

        let sort;
        if (arrangeType === "newest") {
            sort = ["timestamp", "desc"];
        } else if (arrangeType === "oldest") {
            sort = ["timestamp", "asc"];
        } else if (arrangeType === "popular") {
        } else if (arrangeType === "recommended") {
        } else {
            return results.error("ArrangeType is not defined!", 400);
        }

        const cursor = await booksCollection.find({}, { sort });

        let books = [];
        let i = 1;

        await cursor.forEach((book) => {
            if (i > shift && i <= count) {
                books.push(book);
            }
            i++;
        });

        let cache = {
            genres: {},
            authors: {},
        };

        let result = [];
        for (const book of books) {
            let genres = [];
            await book.genres.forEach(async (genreID) => {
                console.log(cache);
                if (!cache.genres[genreID]) {
                    let x = await Genres.getByID(genreID);
                    genres.push(x);
                    cache.genres[toString(x.id)] = x;
                } else {
                    genres.push(genres[genreID]);
                }
            });

            book.cover = getImagePath("cover", book.id);

            let author;
            if (!cache.authors[book.author]) {
                author = await User.get(book.author);
                cache.authors[book.author] = author;
            } else {
                author = cache.authors[book.author];
            }

            book.genres = genres;
            book.author = author.data;
            result.push(book);
        }

        return results.successWithData(result);
    },
    like: async function (userID, bookID) {
        const bookLikesCollection = global.mongo.collection("bookLikes");
        const booksCollection = global.mongo.collection("books");

        const doUserLiked = await bookLikesCollection.findOne({
            userID,
            bookID,
        });
        const book = await booksCollection.findOne({ id: bookID });

        let result;
        if (!doUserLiked) {
            result = await bookLikesCollection.insertOne({ userID, bookID });
            if (result) {
                await booksCollection.updateOne(
                    { id: bookID },
                    { $inc: { likes: 1 } }
                );
                Analytics.updateUserLikes(userID, bookID, "like");
                return results.successWithData({ action: "like" });
            }
        } else {
            result = await bookLikesCollection.deleteOne({ userID, bookID });
            if (result) {
                await booksCollection.updateOne(
                    { id: bookID },
                    { $inc: { likes: -1 } }
                );
                Analytics.updateUserLikes(userID, bookID, "dislike");
                return results.successWithData({ action: "dislike" });
            }
        }
        return results.unexpectedError();
    },
};

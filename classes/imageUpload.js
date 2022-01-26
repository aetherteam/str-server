const results = require('../utils/results');
const fs = require("fs");
const jimp = require("jimp");
const User = require("../classes/user");
const Book = require("../classes/book");
const { fromBuffer } = require("file-type");

async function upload(request, reply, body, user, upload) {

    const uploadFileName = await request.body.upload.filename;

    const tempFilePath = "../" + user["id"] + uploadFileName;

    fs.writeFileSync(tempFilePath, upload);
    
    if (body.type === "avatar") {
        const newFilePath = "../public/avatars/" + user["id"] + ".png";
        jimp.read(tempFilePath, function (err, image) {
            if (err) {
                return results.unexpectedError();
            } else {
                // deleteFile(newFilePath);
                image.write(newFilePath);
                deleteFile(tempFilePath);
            }
        });
        return results.success();
    } else if (body.type === "cover") {
        const newFilePath = "../public/covers/" + body.bookID + ".png";

        jimp.read(tempFilePath, function (err, image) {
            if (err) {
                return results.unexpectedError();
            } else {
                deleteFile(newFilePath);
                image.write(newFilePath);
                deleteFile(tempFilePath);
                return results.success();
            }
        });
        return results.success();
    } else {
        return results.error("Bad data", 403);
    }
}
// TODO: create delete upload function
function deleteFile(path) {
    try {
        fs.unlinkSync(path);
    }
    catch {}
}
/* Params: 
    key
    type (avatar/cover)
    bookID (if Type==cover)
    upload
*/
async function checkArguments(request, reply) {
    const body = parseBodyToObject(request.body);
    const uploadValue = await request.body.upload.toBuffer();

    const user = await User.getUserWithKey(body.key);
    // console.log(request.body)

    if (!user) {
        return results.error("You have no access to this method", 403);
    }

    if (!uploadValue) {
        return results.error("You have not uploaded a file", 400)
    }

    const fileType = await fromBuffer(uploadValue);
    if (!/(image)/.test(fileType.mime)) {
        return results.error("File must be an image", 422);
    }

    if (body.type === "cover") {
        if (!body.bookID) {
            return results.error("You have not specified a book ID", 400)
        }

        if (!(await Book.checkOwnership(body.bookID, user["id"]))) {
            return results.error("You have no permossion to upload cover for this book", 403)
        }
    }

    const result = await upload(request, reply, body, user, uploadValue);
    
    return results.success();
}


function parseBodyToObject(_body) {
    const body = Object.fromEntries(
        Object.keys(_body).map((key) => [key, _body[key].value])
    );
    return body;
}


module.exports = checkArguments;
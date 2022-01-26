const fs = require("fs");

module.exports = function (type, id) {
    let path = "/public/";
    let searchPath = "../public/";
    switch (type) {
        case "avatar":
            path += "avatars/" + id + ".png";
            searchPath += "avatars/" + id + ".png";

            break;
        case "cover":
            path += "covers/" + id + ".png";
            searchPath += "covers/" + id + ".png";

            break;
    }
    console.log(searchPath);
    if (fs.existsSync(searchPath)) {
        return path;
    }
    else return "/public/regular.png";
};

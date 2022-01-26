var bcrypt = require('bcryptjs');

module.exports.encrypt = (value) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(value, salt);

    return hash;
}
module.exports.compare = (value1, value2) => {
    return bcrypt.compareSync(value1, value2);
}
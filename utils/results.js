module.exports = {
  error: function (text, code) {
    console.error(text);
    return {
      code,
      error: text,
      success: false
    };
  },
  unexpectedError: function () {
    console.error(text);
    return {
      code: 500,
      error: "Unexpected error",
      success: false
    };
  },
  successWithData: function (data) {
    return {
      code: 200,
      data,
      success: true
    };
  },
  success: function () {
    return {success: true, code: 200 };
  },
};

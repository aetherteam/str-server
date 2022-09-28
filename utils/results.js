module.exports = {
  error: function (data, code) {
    console.error(data);
    return {
      code,
      error: data,
      success: false
    };
  },
  unexpectedError: function () {
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

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body"
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
}

module.exports = errorHandler;

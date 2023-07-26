class CustomError extends Error {
  constructor(message, httpCode) {
    super(message)

    // assign the error class name in your custom error (as a shortcut)
    this.name = this.constructor.name

    // capturing the stack trace keeps the reference to your error class
    Error.captureStackTrace(this, this.constructor);

    this.httpCode = httpCode;
  }
}

module.exports = CustomError
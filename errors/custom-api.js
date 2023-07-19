class CustomAPIError extends Error {
  constructor(message) {
    super(message)
  }
}
// hard code status code in error classes

module.exports = CustomAPIError

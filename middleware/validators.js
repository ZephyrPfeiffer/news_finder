const { body, validationResult } = require("express-validator");

module.exports.validateBody = [
  // check for properties that shouldn't be inside body object
  body()
    .custom((body, { req }) => {
      const validProperties = [
        "gameName",
        "newsCount",
        "newsLength",
        "dateSort",
      ];
      const userProvidedProperties = Object.keys(body);
      let invalidProperties = [];
      let bodyIsValid = true;

      for (let i = 0; i < userProvidedProperties.length; i++) {
        if (!validProperties.includes(userProvidedProperties[i])) {
          bodyIsValid = false;
          invalidProperties.push(userProvidedProperties[i]);
        }
      }

      req.invalidProperties = invalidProperties;

      return bodyIsValid;
    })
    .withMessage((value, { req }) => {
      return `Body object includes properties that shouldn't exist: ${req.invalidProperties.join(
        ", "
      )}`;
    }),
  // check to make sure that all required properties are inside body object
  body()
    .custom((body, { req }) => {
      const validProperties = [
        "gameName",
        "newsCount",
        "newsLength",
        "dateSort",
      ];
      const bodyProperties = Object.keys(body);
      let missingProperties = [];
      let bodyIsValid = true;

      for (let i = 0; i < validProperties.length; i++) {
        if (!bodyProperties.includes(validProperties[i])) {
          missingProperties.push(validProperties[i]);
          bodyIsValid = false;
        }
      }

      req.missingProperties = missingProperties;

      return bodyIsValid;
    })
    .withMessage((value, { req }) => {
      return `Body object is missing the following properties: ${req.missingProperties.join(
        ", "
      )}`;
    }),
  body("gameName")
    .notEmpty()
    .withMessage("gameName cannot be empty.")
    .isString()
    .withMessage("gameName must be of type string.")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "gameName character length must be equal to or greater than 1 and less than or equal to 50."
    )
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ errors: errors.array() });
    }
    next();
  },
];

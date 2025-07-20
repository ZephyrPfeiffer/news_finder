const express = require("express");
const logger = require("morgan");
const mainRoutes = require("./routes/main");

const app = express();

// middleware
app.use(express.json());
app.use(logger("dev"));

// routes
app.use("/", mainRoutes);

// test routes
// app.get(
//   "/test",
//   body("message").isEmpty().withMessage("Message can not be empty"),
//   (req, res) => {
//     const errors = validationResult(req);

//     if (errors.isEmpty()) {
//       return res.status(200).json(req.body.userName);
//     }

//     res.status(400).json({ errors: errors.array() });
//   }
// );

app.listen(3000);

const express = require("express");
const bodyParser = require("body-parser");
const DB = require("./model/db");
var cors = require("cors");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const indexRouter = require("./routes/indexRouter");
var path = require('path');

const app = express();
const port = 3002;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const swaggerSpec = swaggerJSDoc(options);

app.use(cors());

// main router
app.use("/", indexRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api-docs", swaggerUI.serve);
app.use("/api-docs", swaggerUI.setup(swaggerSpec));

app.get("/swagger.js", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send();
});

app.listen(port, function () {
  console.log("Node app is running on port 3002");
});

module.exports = app;

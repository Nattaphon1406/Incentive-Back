var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
var morgan = require("morgan");
var fs = require("fs");
const rfs = require("rotating-file-stream");

const basicAuth = require("express-basic-auth");



const _config = require("./appSetting.js");
const databaseConnect = require("./dbconnect.js");
/**
 * Import routes
 */
var indexRouter = require("./routes/index");

var uploadRouter = require("./routes/upload");
// var sparepartRouter = require("./routes/sparepart");
var thankPointRouter = require("./routes/thankPoint");
var manageProductRouter = require("./routes/manageProduct");
var pointHistoryRouter = require("./routes/pointHistory");
var awardPointRouter = require("./routes/awardpoint");
var newsRouter = require("./routes/news");
var manageGroupProductRouter = require("./routes/manageGroupProduct");
var companyBudgetRouter = require("./routes/companyBudget");
var summaryRouter = require("./routes/summaryPoint");
var manageGroupRouter = require("./routes/manageGroup");
var summaryReport = require("./routes/summaryReport");
var givePoint = require("./routes/givepoint");

var app = express();
/**
 * Swagger generate route
 */
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require("./swagger.json");
swaggerDocument.host = _config.host + ":" + _config.port;

app.use(
  "/api-docs",
  basicAuth({
    users: { TTT: _config.passwordSwagger },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

/**
 * 
 * Log Control
 */

function log_file_name(time, index) {
  if (!time) return "access.log";

  return [formatDate(time), index, "access.log"].join("-");
}

if (app.get("env") == "production") {
  let accessLogStream = rfs.createStream(log_file_name, {
    size: "2M",
    interval: "1d",
    path: _config.logAccessPath,
  });
  app.use(morgan({ stream: accessLogStream }));
} else {
  app.use(morgan('dev')); //log to console on development
}
/** 
 * view engine setup
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** 
 * Router
 */
// enable files upload
var fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use("/", indexRouter);
app.use("/api/upload", uploadRouter);
// app.use("/api/sparepart", sparepartRouter);
app.use("/api/thankPoint", thankPointRouter);
app.use("/api/manageProduct", manageProductRouter);
app.use("/api/pointHistory", pointHistoryRouter);
app.use("/api/awardPoint", awardPointRouter);
app.use("/api/news", newsRouter);
app.use("/api/summarypoint", summaryRouter);
app.use("/api/manageGroup", manageGroupRouter);
app.use("/api/manageGroupProduct", manageGroupProductRouter);
app.use("/api/companybudget", companyBudgetRouter);
app.use("/api/summaryReport", summaryReport);
app.use("/api/givepoint", givePoint);

/** 
 * Eerror
 */
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.disable("x-powered-by");

module.exports = app;

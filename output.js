"use strict";

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    session = require("express-session"),
    expressValidator = require("express-validator"),
    campground = require("./models/campground"),
    comment = require("./models/comments"),
    //name of the model is comment
User = require("./models/user"),
    seedDB = require("./seeds");

require("dotenv").config();

// requiring routes
var campgroundRoutes = require("./routers/campground"),
    commentRoutes = require("./routers/comment"),
    authRoutes = require("./routers/auth");

// seedDB();
var url = process.env.DATABASE_URL || process.env.db;
mongoose.connect(url, { useNewUrlParser: true }).then(function () {
    return console.log("Connection Successful");
}).catch(function (err) {
    return console.log(err);
});
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

// PASSPORT CONFIGURATION
app.use(session({
    secret: "socialCamp manenos",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// APP CONFIG
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/semantic")); //__dirname is where the script is stored. Always important to include it incase the script, /home/../v1, changes.
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.locals.moment = require("moment");

// create a middleware for user which will be called on every route. AKA Global vars
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use("/campground", campgroundRoutes);
app.use("/campground/:id/comments", commentRoutes);
app.use(authRoutes);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(3000, function () {
    console.log("Social camp has started!");
});

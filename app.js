var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    localStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressValidator      = require("express-validator"),
    methodOverride        = require("method-override"),
    flash                 = require("connect-flash"),
    session               = require("express-session"),
    campground            = require("./models/campground"),
    comment               = require("./models/comments"),  //name of the model is comment
    User                  = require("./models/user"),
    seedDB                = require("./seeds");
                            


// requiring routes
var campgroundRoutes = require("./routers/campground"),
    commentRoutes    = require("./routers/comment"),
    authRoutes       = require("./routers/auth");
    
// seedDB();
var url = process.env.DATABASE_URL || "mongodb://localhost:27017/yelp_camp";
mongoose.connect(url, { useNewUrlParser: true }).then(() => console.log("Connection Successful")).catch(err => console.log(err));
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);


// APP CONFIG
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/semantic")); //__dirname is where the script is stored. Always important to include it incase the script, /home/../v1, changes.
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.locals.moment = require("moment");


// PASSPORT CONFIGURATION
app.use(session({
    secret: "YelpCamp manenos",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}))

// create a middleware for user which will be called on every route. AKA Global vars
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error     = req.flash("error");
    res.locals.success     = req.flash("success");
    next();
})
app.use("/campground", campgroundRoutes);
app.use("/campground/:id/comments", commentRoutes);
app.use(authRoutes);
passport.use(User.createStrategy());
// passport.use("login", new localStrategy({
//     passReqToCallback: true
// },
// function(req, email, password, done){
//     User.findOne({"email": email}, function(err, user){
//         if(err) {
//             return done(err, null)
//         }
//         if(!user) {
            
//             return done(null, false, {message: "Incorrect Email"});
//         } 
//         if(user.password != password) {
//             return done(null, false, {message: "Incorrect Password"});
//         }
//         if(!user && user.password != password) {
//             return done(null, false, {message: "There is no account registered with that email"})
//         }
//         return done(null, user);
//     })
// }))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.listen(process.env.PORT, process.env.IP, function (){
    console.log("Yelp camp has started!");
})



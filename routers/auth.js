var express    = require("express");
var router     = express.Router();
var passport   = require("passport");
var nodemailer = require("nodemailer");
var crypto     = require("crypto");
var User       = require("../models/user");
var Async      = require("async");
var campground = require("../models/campground");
var middleware = require("../middleware");
var multer     = require("multer");
var cloudinary = require("cloudinary");

// multer config
var storage = multer.diskStorage({
    // filename is used to determine what the file should be named inside the folder.
    // Each function gets passed both the request(req) and some info about the file (file) to aid with the decision
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function (req, file, callback) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback(new Error ("Only image files are allowed"), false)
    }
    callback(null, true)
}


var upload = multer({storage: storage, fileFilter: imageFilter}); //fileFilter controls which files should be uploaded and which should be skipped.

// cloudinary config

cloudinary.config({
    cloud_name: "ciiru",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



router.get("/", function(req, res){
    res.render("home");
    
});


// create registration form
router.get("/register", function(req, res){
    res.render("register");
});

// handling user sign ups

router.post("/register", upload.single("avatar"), function(req, res){
    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
        if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        var newUser = new User({displayname: req.body.displayname, 
       firstName: req.body.firstName, 
       lastName: req.body.lastName, 
       email: req.body.email,
       Bio: req.body.bio,
       avatar : result.secure_url
       });
       console.log(newUser);
        if(req.body.adminCode === "secretcode123"){
          newUser.isAdmin = true;
       }
   
      
      
       User.register(newUser, req.body.password, function(err, user){
         if(err){
            console.log(err); 
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        
        passport.authenticate("local")(req,res, function(){
            req.flash("success", "Welcome " + " " + user.displayname);
            res.redirect("/campground");
        })
    });
    })
    
    
});

// creating login form

router.get("/login", function(req, res){
    res.render("login");
});

// handling logins
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Login successful"
    
}), function(req, res){
    res.redirect("/user/" + req.user._id)
});

// create user profile

router.get("/user/:id", middleware.isLoggedIn, function(req, res){
    var perPage = 6;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
        
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            
            req.flash("error", err.message);
            return res.redirect("/");
        }
        
        if(req.query.search){
             const regex = new RegExp(escapeRegex(req.query.search), 'gi');
             campground.find({name: regex, "author.id": foundUser._id}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err,campgrounds) {
                 console.log(foundUser);
                 console.log(campgrounds);
                 campground.count().exec(function (err, count) {
                     if(err) {
                         console.log(err);
                         res.redirect("back")
                     } else {
                         if(campgrounds.length < 1){
                          req.flash("error", "The campground doesn't exist.")
                         return res.redirect("back");
                       }
                       res.render("user/show", {
                           user: foundUser,
                           campground: campgrounds,
                           current: pageNumber,
                           search: req.query.search,
                           pages: Math.ceil(count/ perPage) // use this to count the number of pages.
                       })
                     }
                 })
             })
             } else {
                 
                 campground.find({"author.id": foundUser._id}).skip((perPage*pageNumber) - perPage).limit(perPage).exec(function(err,campgrounds) {
                // console.log(foundUser);     
                // console.log(campgrounds);     
                 campground.count().exec(function (err, count) {
                    if(err) {
                    console.log(err);
                     } else {
                      res.render("user/show", {
                        user: foundUser,  
                        campground: campgrounds, 
                        current: pageNumber,
                        search: false,
                        pages: Math.ceil(count/ perPage) // use this to count the number of pages.
                        
                    });
                }
            });
        });
    }
        
    });
});

// handling logout
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You have successfully logged out!");
    res.redirect("/");
});

// forgot password

router.get("/forgot", function(req, res){
    res.render("forgot");
});

router.post("/forgot", function(req, res, next){
    Async.waterfall([
        function(done){
            // generate random token
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString("hex");
                done(err, token);
            });
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err, user){
                if (!user){
                    req.flash("error", "No account with that email address exists");
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000 //one hour converts to 3600000 milliseconds.
                
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "rosewanjohi24@gmail.com",
                    pass: process.env.gmailPwd
                }
            });
            var mailOptions = {
                to: user.email,
                from: "rosewanjohi24@gmail.com",
                subject: "Reset password",
                text: "You have requested to reset your password. Please visit the following link:" +
                " https://" + req.headers.host + "/reset/" + token + "\n\n" +
                "If you did not request this please ignore the message and your password will remain unchanged."
            }
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash("success", "An email has been sent to" + user.email + " with further instructions!");
                done(err, "done");
            })
        }
        ], function(err) {
            if(err) {
                return next(err)
            }
        res.redirect("/forgot")
            
        });
});

router.get("/reset/:token", function(req, res){
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
        if(!user) {
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

router.post("/reset/:token", function(req, res){
    Async.waterfall([
        function(done) {
           User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
               if(!user){
                   req.flash("error", "Password reset token is invalid or has expired");
                   return res.redirect("back");
               }
                   if(req.body.update === req.body.confirm){
                       user.setPassword(req.body.update, function(err){
                           user.resetPasswordToken = undefined;
                           user.resetPasswordExpires = undefined;
                           user.save(function(err){
                           req.logIn(user, function(){
                               done(null, user)
                           })

                           })
                       })
                   } else {
                       req.flash("error", "The passwords do not match. Please try again.");
                       return res.redirect("back");
                   }
               
           })  
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "rosewanjohi24@gmail.com",
                    pass: process.env.gmailPwd
                }
            });
            var mailOptions = {
                to: user.email,
                from: "rosewanjohi24@gmail.com",
                subject: "Password changed",
                text: "This is confirmation that the password for your account has been changed." +
                "If you did not request this please contact support."
            }
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash("success", "Your password has been changed.");
                done(err);
            })
        }
        ], function(err){
            res.redirect("/campground");
        })
   
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports =router;
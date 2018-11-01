var express    = require("express");
var router     = express.Router();
var passport   = require("passport");
var Async      = require("async");
var nodemailer = require("nodemailer");
var crypto     = require("crypto");
var User     = require("../models/user");


router.get("/", function(req, res){
    res.render("home");
    
});


// create registration form
router.get("/register", function(req, res){
    res.render("register");
});

// handling user sign ups

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, 
    firstName: req.body.firstName, 
    lastName: req.body.lastName, 
    email: req.body.email, 
    avatar: req.body.avatarUrl});
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
            req.flash("success", "Welcome " + user.firstName + " " + user.lastName);
            res.redirect("/campground");
        })
    });
    
});

// creating login form

router.get("/login", function(req, res){
    res.render("login");
});

// handling logins
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campground",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res){

});

// create user profile

router.get("/user/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(foundUser)
            req.flash("error", err.message);
            res.redirect("/");
        }
        res.render("user/show", {user:foundUser});
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


module.exports =router;
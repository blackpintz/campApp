var express  = require("express");
var router   = express.Router();
var passport = require("passport");

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
    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req,res, function(){
            req.flash("success", "Welcome " + user.username);
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

// handling logout
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You have successfully logged out!");
    res.redirect("/");
})


module.exports =router;
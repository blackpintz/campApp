var middlewareObj = {};
var campground    = require("../models/campground");
var comment       = require("../models/comments");



middlewareObj.isLoggedIn =  function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must log in first!")
    res.redirect("/login");
}

middlewareObj.checkOwnerShip = function (req, res, next){
    if(req.isAuthenticated()){
          campground.findById(req.params.id, function(err, foundCampground){
           if(err){
            console.log(err);
             } else {
                 //is the user the owner of the confirmed campground?
                 if(foundCampground.author.id.equals(req.user._id)){
                     next();
                 } else {
                     res.redirect("back");
                 }
            }
         });
      } else {
          res.redirect("back");
      }
};
    
middlewareObj.ownerOfComment = function(req, res, next){
    if(req.isAuthenticated()){
          comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
            console.log(err);
             } else {
                 //is the user the owner of the comment?
                 if(foundComment.author.id.equals(req.user._id)){
                     next();
                 } else {
                     res.redirect("back");
                 }
            }
         });
      } else {
          res.redirect("back");
      }
};


module.exports = middlewareObj;
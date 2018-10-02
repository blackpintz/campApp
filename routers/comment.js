var express    = require("express");
var router     = express.Router({mergeParams: true});
var campground = require("../models/campground");
var comment   = require("../models/comments");
var middleware = require("../middleware")


router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by Id
    campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {campground: campground});
        }
    });
    
});

router.post("/", middleware.isLoggedIn, function(req, res){
    // find campground by Id
    campground.findById(req.params.id, function(err, campInfo){
        if(err){
            console.log(err);
        } else {
            // create new comment
            
            comment.create(req.body.comment, function(err, newComment){
                if(err) {
                    console.log(err);
                } else {
                    // add the author's name in the comment and save.
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                   // add the comment to the campground found and save
                   campInfo.comments.push(newComment);
                   campInfo.save();
                   // redirect to the campground found show page
                   res.redirect("/campground/" + campInfo._id);
                }
                
                
            });
        }
    });
});

// EDIT AND UPDATE COMMENT
// comments are nested into campgrounds. Try to treat them independently and follow the rules of RESTful routing

router.get("/:comment_id/edit", middleware.ownerOfComment, function(req, res){
    // find comment by id
    comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            console.log("Comment not found");
        } else {
            
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment})
        }
    })
});

// Handling updates

router.put("/:comment_id", function(req, res){
    // find comment by id
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campground/" + req.params.id);
        }
    })
    
})

// DESTROY comment

router.delete("/:comment_id", middleware.ownerOfComment, function(req, res){
    // find comment by id
    comment.findByIdAndDelete(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else {
            res.redirect("/campground/" + req.params.id);
        }
        
    })
})


module.exports = router;
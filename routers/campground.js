var express = require("express");
var router = express.Router();
var campground = require("../models/campground");
var middleware = require("../middleware");

// campground.create({
//             name: "Rapid Camp Sagana",
//             image: "https://images.unsplash.com/photo-1529968493954-06bbf3fdacc2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=9b1e4a7957538f7c335ef1c8499d44d0&auto=format&fit=crop&w=500&q=60",
//              description: "Beautiful views at day-time and night-time. Very affordable rates"
//         },
//         {
//             name: "Malewa Bush Ventures",
//             image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d9df10d159cc11074d9a7996e8aca442&auto=format&fit=crop&w=500&q=60",
//             description: "It is located near a farm. The animals are friendly and there is horse riding too. Get 50% off the price as a new guest."
//         },
//         function(err, campground) {
//             if(err) {
//                 console.log("The file was not created");
//             } else {
//                 console.log(campground);
//             }
//         })
 
// INDEX - show all campgrounds
router.get("/", middleware.isLoggedIn, function(req, res) {
    
    campground.find({}, function(err, camp){
        if(err){
            console.log("Something is wrong");
        }else{
            res.render("campgrounds/index", {campground: camp});
        }
    });
    
    
});

// NEW - show form to create new campground.
router.get("/new", middleware.isLoggedIn, function(req, res) {
    
   
    res.render("campgrounds/new");
    
});

// CREATE - add new campground to database.
router.post("/", middleware.isLoggedIn, function(req, res) {
    
    var newItem = {};
    var data = req.body.infoItem;
    var imageData = req.body.imageUrl;
    var description = req.body.description;
    var author      = {
        id:      req.user._id,
        username: req.user.username
        
    };
    
    newItem.image = imageData;
    newItem.name = data;
    newItem.description = description;
    newItem.author = author;
    
    campground.create(newItem, function(err, newCampground){
        if(err) {
            req.flash("error", "Please try adding the campground again");
        } else {
            req.flash("success", "Campground has been successfully added");
            res.redirect("/campground");
        }
    });
    
});




// SHOW - show information about a specific campground.

router.get("/:id", function(req, res){
    // find campground with provided Id
    campground.findById(req.params.id).populate("comments").exec(function(err, campId){
        if(err){
            console.log(err);
        } else {
           res.render("campgrounds/shows", {campground: campId});
        }
    });
    
    
});

// EDIT and UPDATE campground

router.get("/:id/edit", middleware.checkOwnerShip, function(req, res){
    
          campground.findById(req.params.id, function(err, foundCampground){
           if(err){
            console.log(err);
             } else {
                     res.render("campgrounds/edit", {campground: foundCampground});
                    }
         });
     });

router.put("/:id", function(req, res){
    var newItem = {};
    var data = req.body.infoItem;
    var imageData = req.body.imageUrl;
    var description = req.body.description;
    var author      = {
        id:       req.user._id,
        username: req.user.username
        
    };
    
    newItem.image = imageData;
    newItem.name = data;
    newItem.description = description;
    newItem.author = author;
    
    campground.findByIdAndUpdate(req.params.id, newItem, {new: true}, function(err, updates){
        if(err){
            console.log(err);
        } else {
            req.flash("success", "Campground edited successfully"); 
            res.redirect("/campground/" + updates._id);
        }
    })
})

// DELETE campground

router.delete("/:id", middleware.checkOwnerShip, function(req, res){
    // find campground
    campground.findByIdAndDelete(req.params.id, function(err){
        if(err){
            console.log(err);
        } else {
            req.flash("success", "Campground deleted");
            res.redirect("/campground");
        }
    });
});


module.exports = router;
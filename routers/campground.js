var express      = require("express");
var router       = express.Router();
var campground   = require("../models/campground");
var middleware   = require("../middleware");
var NodeGeocoder = require("node-geocoder");
var multer       = require("multer");
var cloudinary   = require("cloudinary");

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

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

 
// INDEX - show all campgrounds
router.get("/", middleware.isLoggedIn, function(req, res) {
    if(req.query.search){
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      campground.find({name: regex}, function(err, camp){
        if(err){
            console.log("Something is wrong");
        }else{
            if(camp.length < 1){
                 req.flash("error", "The campground doesn't exist.")
                 return res.redirect("back");
            }
            res.render("campgrounds/index", {campground: camp});
        }
    })
    } else {
    campground.find({}, function(err, camp){
        if(err){
            console.log("Something is wrong");
        }else{
            res.render("campgrounds/index", {campground: camp});
        }
    });
    } 
    
});

// NEW - show form to create new campground.
router.get("/new", middleware.isLoggedIn, function(req, res) {
    
   
    res.render("campgrounds/new");
    
});

// CREATE - add new campground to database.
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res) {
    
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        
        geocoder.geocode(req.body.location, function (err, data){
        if(err || !data.length){
            console.log(err);
            req.flash("error", "Invalid address");
            return res.redirect("back")
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        req.body.campground.image = result.secure_url
        req.body.campground.imageId = result.public_id
         req.body.campground.author = {
        id:      req.user._id,
        username: req.user.username
        };
        
        campground.create(req.body.campground, function(err, newCampground){
        if(err) {
            req.flash("error", "Please try adding the campground again");
        } else {
            req.flash("success", "Campground has been successfully added");
            res.redirect("/campground");
        }
     });
        
    })
    });
        
})
    
  




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

router.put("/:id", upload.single("image"), function(req, res){
    
    campground.findById(req.params.id, async function(err, foundCampground){
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if(req.file) {
               try {
                   await cloudinary.v2.uploader.destroy(foundCampground.imageId);
                   var result = await cloudinary.v2.uploader.upload(req.file.path);
                   foundCampground.imageId = result.public_id;
                   foundCampground.image = result.secure_url;
               } catch(err) {
                   req.flash("error", err.message);
                   return res.redirect("back");
               }
            }
            
            geocoder.geocode(req.body.location, function(err, data) {
                if(err || !data.length){
               req.flash("error", "Invalid address");
               return res.redirect("back")
                }
                foundCampground.lat = data[0].latitude;
                foundCampground.lng = data[0].longitude;
                foundCampground.location = data[0].formattedAddress;
                foundCampground.name = req.body.name;
                foundCampground.description = req.body.description;
                foundCampground.price = req.body.price;
                foundCampground.save();
                req.flash("success", "Campground edited successfully"); 
                res.redirect("/campground/" + foundCampground._id);
                
            })
        }
    })
})

// DELETE campground

router.delete("/:id", middleware.checkOwnerShip, function(req, res){
    // find campground
    campground.findById(req.params.id, async function(err, foundCampground){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back")
        } 
        try {
            await cloudinary.v2.uploader.destroy(foundCampground.imageId);
            foundCampground.remove();
            req.flash("success", "Campground deleted");
            res.redirect("/campground");
        } catch (err) {
            req.flash("error", err.message);
            return res.redirect("back");
            
        }
        
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;
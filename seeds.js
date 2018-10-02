var mongoose   = require("mongoose"),
    campground = require("./models/campground"),
    comment    = require("./models/comments")
    
var data = [{
    name: "Rapid Camp Sagana",
    image: "https://images.unsplash.com/photo-1529968493954-06bbf3fdacc2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=9b1e4a7957538f7c335ef1c8499d44d0&auto=format&fit=crop&w=500&q=60",
    description: "Beautiful views at day-time and night-time. Very affordable rates. Convallis nec velit scelerisque ultricies sociis. Nec vestibulum sit. Erat porro pede. Eget ac justo habitasse accumsan quis. Nunc pretium curae. Eleifend sodales vivamus pellentesque feugiat tellus congue nec in nunc volutpat duis. Rutrum velit rutrum rutrum in ac tempor imperdiet odio fusce ipsum massa nec neque tellus. Volutpat etiam quis. Odio egestas ipsum. Sed sociosqu ac. Fermentum et mauris. Aut in eget."
    },
    {
    name: "Malewa Bush Ventures",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d9df10d159cc11074d9a7996e8aca442&auto=format&fit=crop&w=500&q=60",
    description: "It is located near a farm. The animals are friendly and there is horse riding too. Get 50% off the price as a new guest. Tortor pellentesque placerat erat quis posuere varius magna ullamcorper. Est officiis dolor. Consectetuer mus eu risus leo quisque in facilisis dictum scelerisque nulla aptent accumsan bibendum rutrum. Natoque varius duis egestas aliquet magna. Vehicula morbi turpis bibendum iaculis maecenas. Quisque euismod convallis nam conubia duis. Metus lacinia felis viverra sit donec. Adipiscing nunc dolor tristique felis adipiscing."
    }];
    
function seedDB() {
    // remove campgrounds.
    campground.deleteMany({}, function(err){
        if(err){
            console.log(err)
        } 
        console.log("All campgrounds have been removed!");
        comment.deleteMany({}, function(err){
               if(err){
                   console.log(err)
               }
                   console.log("Comments removed!")
                //   Add campgrounds
                //  data.forEach(function(seed) {
                //     campground.create(seed, function(err, newCamp){
                //         if(err) {
                //             console.log(err)
                //         } else {
                //             console.log("New campground has been added!");
                //             // Add comments
                //             comment.create({
                //                 text: "It is a beautiful place but I wish there was internet."
                //             }, function(err, newComment){
                //                 if(err) {
                //                     console.log(err);
                //                 } else {
                //                     newCamp.comments.push(newComment);
                //                     newCamp.save();
                //                     console.log("Comment created");
                //                 }
                //             })
                //         }
                //     })
                // }); 
            })
    })
}

module.exports = seedDB;
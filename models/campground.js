var mongoose = require("mongoose")
     //name of the model is comment


// SCHEMA/PLAN set up

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: Number,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
          {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Comment"
          }
        ]
})

// compile into a model.

module.exports = mongoose.model("Campground", campgroundSchema);
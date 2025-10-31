const mongoose = require("mongoose");

const testimonialsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
     image: {
        type: [String],
        required: false,
    },
    message:{
        type: String,
        required: true
    },
    starRating:{ type: Number, default: 1, min: 1, max: 5 },
    
});

module.exports = mongoose.model("Testimonials", testimonialsSchema);
const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    collegeName:{
        type:String,
    },
    collegeCount:{
        type:Number,
        default:0
    }
});

const College = mongoose.model('College',collegeSchema);

module.exports = College;
const mongoose = require('mongoose')

const schema = mongoose.Schema({
    street:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
        required:true
    },
    town:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    pincode:{
        type:String,
        required:true,
        min:6,
        max:6
    }
},{collection:"location"})

module.exports = mongoose.model('location',schema)
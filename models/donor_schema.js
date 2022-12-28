const mongoose = require('mongoose')

const schema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    }
}
    ,{collection:"donor"})

module.exports = mongoose.model('donor',schema)    
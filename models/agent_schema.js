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
    },
    gender:{
        type:String,
        required:false
    },
    town:{
        type:String,
        required:true
    }
}
    ,{collection:"agent"})

module.exports = mongoose.model('agent',schema)    
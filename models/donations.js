const mongoose = require('mongoose')

const schema = mongoose.Schema({
        email:{
            type:String,
            required:true
        },
        town:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        phone:{
            type:Number,
            required:true
        },
        foods:{
            type:Array,
            required:true
        },
        quantities:{
            type:Array,
            required:true
        },
        date:{
            type:String,
            required:true
        },
        isAssigned:{
            type:Boolean,
            default:false
        }//delivery agent purpose
},{collection:'donations'})

module.exports = mongoose.model('donations',schema)
const joi = require('joi')

const validation = async (data)=>{
    const schema = joi.object({
        street: joi.string().required(),
        landmark : joi.string(),
        town : joi.string().required(),
        district : joi.string(),
        state : joi.string().required(),
        pincode : joi.string().required().min(6).max(6)
    })

    return schema.validate(data)
}

module.exports.validation = validation 
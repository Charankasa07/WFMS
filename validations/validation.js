const joi = require('joi')

const donor_registervalidation = async (data)=>{
    const schema = joi.object({
        name : joi.string().required(),
        email : joi.string().required().email(),
        password : joi.string().required().min(8),
        phone : joi.number().required()
    })

    return await schema.validate(data)
}

const agent_registervalidation = async (data)=>{
    const schema = joi.object({
        name : joi.string().required(),
        email : joi.string().required().email(),
        password : joi.string().required().min(8),
        phone : joi.number().required(),
        gender : joi.string().required(),
        town: joi.string().required()
    })

    return await schema.validate(data)
}

const loginvalidation = async (data)=>{
    const schema = joi.object({
        email : joi.string().required().email(),
        password : joi.string().required().min(8)
    })

    return await schema.validate(data)
}

module.exports.donor_registervalidation = donor_registervalidation
module.exports.agent_registervalidation = agent_registervalidation
module.exports.loginvalidation = loginvalidation
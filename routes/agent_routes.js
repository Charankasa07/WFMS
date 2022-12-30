const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const agent_schema = require('../models/agent_schema')
const sendMail = require('../nodemailer')
const {agent_registervalidation,loginvalidation, donor_registervalidation} = require('../validations/validation')
const path = require('path')
const donations = require('../models/donations')
const donor_schema = require('../models/donor_schema')
const agent_verify = require('../verification/agent_verification')
const location = require("../models/location")

router.post('/register',async (req,res)=>{
    const {error,value} = agent_registervalidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const data = await agent_schema.findOne({email:req.body.email})
    if(data) return res.status(400).send("Email already exists")

    const salt = await bcrypt.genSalt(10)
    const hashedpass = await bcrypt.hash(req.body.password,salt)

    const agent = new agent_schema({
        name:req.body.name,
        email:req.body.email,
        password:hashedpass,
        phone:req.body.phone,
        gender:req.body.gender,
        town : req.body.town.toLowerCase()
    })

    try {
        await agent.save()
        const token = jwt.sign({email:agent.email},process.env.agent_token)
        res.setHeader('auth-token',token).status(200).sendFile(path.join(__dirname,'../public/main.html'))
    } catch (error) {
        res.send(error.message)
    }
})

// router.get('/register',(req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/agent_registration_page.html'))
// })

router.post('/available-donations',async (req,res)=>{
    try {
        const town1 = req.body.town.toLowerCase()
        const post = await donations.find({town:town1,isAssigned:false})
        res.render('available_donations',{
            details:post
        })
        }
     catch (error) {
        res.send(error.message)
    }
})

router.get('/available-donations/:id',async(req,res)=>{
    try {
        const data = await donations.findByIdAndUpdate(req.params.id,{$set:{isAssigned:true}},{new:true})
        res.render('accept_donation',{
            details:data
        })
    } catch (error) {
        res.render('accept_donation',{
            details:error.message
        })
    }
})

// router.post('/accept-donation/:id',agent_verify,async(req,res)=>{
//     const post = await donations.findById(req.params.id)

//     const donor = await donor_schema.findOne({email:post.email})

//     res.send(donor.address).status(200)
// })

router.post('/view-locations',async (req,res)=>{
    try {
        const town = req.body.town.toLowerCase()
        const locations = await location.find({town:town})
    
        res.render('view_locations',{
            details:locations
        })
    } catch (error) {
        res.send(error.message)
    }
})

// router.get('/view-locations',(req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/view_location.html'))
// })



module.exports = router
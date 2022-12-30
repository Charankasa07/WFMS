const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const donor_schema = require('../models/donor_schema')
const {donor_registervalidation} = require('../validations/validation')
const {sendMail} = require('../nodemailer')
const path = require('path')
const donations = require('../models/donations')
const { resolveSoa } = require('dns')
const donor_verify = require('../verification/donor_verification')
const agent_schema = require('../models/agent_schema')

router.post('/register',async (req,res)=>{
    const {error,value} = donor_registervalidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const data = await donor_schema.findOne({email:req.body.email})
    if(data) return res.status(400).send("Email already exists")

    const salt = await bcrypt.genSalt(10)
    const hashedpass = await bcrypt.hash(req.body.password,salt)

    const donor = new donor_schema({
        name:req.body.name,
        email:req.body.email,
        password:hashedpass,
        phone:req.body.phone
    })

    try {
        await donor.save()
        // const token = jwt.sign({email:donor.email},process.env.donor_token)
        res.sendFile(path.join(__dirname,'../public/main.html'))
    } catch (error) {
        res.send(error.message)
    }
})

// router.get('/register',(req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/Registration_page.html'))
// })

router.post('/donate-food',async(req,res)=>{
    const fooditems = req.body.fooditems
    const items =[]
    const quan =[]
    for (let i = 0; i < fooditems; i++){
        var x = "food"+i;
        var y = "quan"+i;
        // console.log(x);
        items.push(req.body[x])
        quan.push(req.body[y])
    }
    // console.log(items);
    // console.log(quan);
    var date = new Date()
    var x = date.toDateString()
    const post = new donations({
        email:req.body.email,
        town:req.body.town.toLowerCase(),
        address:req.body.address,
        phone:req.body.phone,
        foods:items,
        quantities:quan,
        date:x
    })
    try {
        await post.save()
        const address = post.address
        const donor = await donor_schema.findOne({email:post.email})
        const subject = "Donation of Food"
        const text = `You have Successfully Donated ${fooditems} Food Items`
        await sendMail(post.email,subject,text)
        const subject1 = "Delivery Available"
        const text1 = `A Donation is available at ${address}`
        const agents = await agent_schema.find({town:post.town},{email:1})
        await agents.forEach(item=>{
             sendMail(item.email,subject1,text1)
        })
        res.render('status_food',{
            details:"Donated Successfully"
        })
    } catch (error) {
        res.render('status_food',{
            details:error.message
        })
    }
})

// router.post('/donation-status/:id',async (req,res)=>{
//     try {
//         const data = await donations.findById(req.params.id)
//         const message = {status:data.isDonated}
//         res.render('status_food',{
//             details:message
//         })
//     } catch (error) {
//         res.send(error.message)
//     }
// })


// router.get('/donate-food',donor_verify,(req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/donate_food.html'))
// })

router.post('/get-donated',async(req,res)=>{
    try {
        const mail = req.body.email
        const post = await donations.find({email:mail})

        res.render('my_donations',{
            details:post
        })
    } catch (error) {
        res.send(error.message)
    }

    // post.forEach(key=>{
    //     console.log(key.email);
    //     console.log(key.foods);
    //     console.log(key.quantities);
    //     console.log(key.date);
    // })
})

// router.get('/get-donated',async(req,res)=>{
//     res.sendFile(path.join(__dirname,'../public/my_donations.html'))
// })

module.exports = router
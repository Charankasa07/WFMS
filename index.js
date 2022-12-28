const express = require('express')
const bodyparser = require('body-parser')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const app = express()
const donor_routes = require('./routes/donor_routes')
const agent_routes = require('./routes/agent_routes')
const location = require('./models/location')
const path = require('path')
const {validation} = require('./validations/location_validation')
const {loginvalidation} = require('./validations/validation')
const donor_schema = require('./models/donor_schema')
const agent_schema = require('./models/agent_schema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { log } = require('console')
const {sendMail} = require('./nodemailer')
dotenv.config()
const ejs = require('ejs')

app.set('view engine',"ejs");

mongoose.set({strictQuery: false});
mongoose.connect(process.env.DB_CONNECT,{useNewUrlParser : true},console.log("Connected to db"))

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))
app.use(express.static('public'))
app.use('/donor',donor_routes)
app.use('/agent',agent_routes)

app.post('/login',async (req,res)=>{
    // const {error,value} = loginvalidation(req.body)
    // if(error) return res.status(400).send(error.details[0].message)

    var data = await donor_schema.findOne({email:req.body.email})
    if(!data) {
        data = await agent_schema.findOne({email:req.body.email})
        if(!data) return res.status(400).send("Account doesn't exist")
    }

    const validpass = await bcrypt.compare(req.body.password,data.password)
    if(!validpass) return res.status(400).send("Invalid Password")

    var data1 = await donor_schema.findOne({email:data.email})
    if(!data1){
        data1 = await agent_schema.findOne({email:data.email})
        const token = jwt.sign({email:data1.email},process.env.agent_token)
        return res.setHeader('auth-token',token).status(200).sendFile(path.join(__dirname,'./public/delivery_agent.html'))
    }
    const token = jwt.sign({email:data1.email},process.env.donor_token)
    return res.setHeader('auth-token',token).status(200).sendFile(path.join(__dirname,'./public/donor.html'))
})

app.post('/reset-password',async (req,res)=>{
    const mail = req.body.email
    console.log(mail);
    try {

        var data = await donor_schema.findOne({email:mail})
        if(!data) {
            var data = await agent_schema.findOne({email:mail})
            if(!data) return res.status(400).send("Account doesn't exist")
        }
        const secret = process.env.token_secret + data.password
        const subject = "RESET PASSWORD"
        const token = jwt.sign({email:mail},secret,{expiresIn:"10m"})
        const text = `http:localhost:3000/reset-password/${mail}/${token}`
        await sendMail(mail,subject,text)
        res.sendFile(path.join(__dirname,'./public/recover.html'))
        
    } catch (error) {
        res.send(error.message)
    }
})

app.get('/reset-password/:mail/:token',async (req,res)=>{
    const {mail,token} = req.params
    try {
        var data = await donor_schema.findOne({email:req.body.email})
        if(!data) {
            var data = await agent_schema.findOne({email:req.body.email})
            if(!data) return res.status(400).send("Account doesn't exist")
        }
        const secret = proces.env.token_secret + data.password
        const verified = jwt.verify(token,secret)
        res.sendFile(path.join(__dirname,'../reset_password_mail.html'))
    } catch (error) {
        res.send(error.message)
    }
})

app.post('/reset-password/:mail/:token',async (req,res)=>{
    const {mail,token} = req.params
    try {
        var data = await donor_schema.findOne({email:req.body.email})
        if(!data) {
            var data = await agent_schema.findOne({email:req.body.email})
            if(!data) return res.status(400).send("Account doesn't exist")
        }
        const password = req.body.password
        const password1 = req.body.password1

        if(password===password1){
            const secret = process.env.token_secret + data.password
            const verified = jwt.verify(token,secret)
            const hashedpass = bcrypt.hash(password,10)
            var data = await donor_schema.findOne({email:req.body.email})
            if(data) {
                await donor_schema.findOneAndUpdate({email:mail},{$set : {password}},{new:true})
                return res.status(200).send({status:"Success",message:"Password updated successfully"})
            }
            await agent_schema.findOneAndUpdate({email:mail},{$set : {password}},{new:true})
            res.status(200).send({status:"Success",message:"Password updated successfully"})
        }
        else{
            res.status(400).send("Password didn't match")
        }
    } catch (error) {
        res.send(error.message)
    }
})


app.post('/user',async (req,res)=>{
    const {error,value  } = await validation(req.body)
    if(error) return res.status(400).send(error.details[0].message)

    const post = new location({
        street : req.body.street,
        landmark : req.body.landmark,
        town : req.body.town.toLowerCase(),
        district : req.body.district,
        state : req.body.state,
        pincode : req.body.pincode
    })

    try {
        await post.save()
        res.sendFile(path.join(__dirname,'./public/location_success.html'))
    } catch (error){
        res.send(error.message)
    }
})


app.get('/',(req,res)=>{
    res.redirect('Home_Page.html')
})

app.listen(process.env.PORT || 3000,console.log("Listening on port 3000"))

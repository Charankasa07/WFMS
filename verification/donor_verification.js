const jwt = require('jsonwebtoken')

module.exports = async(req,res,next)=>{
    const token = req.header('auth-token')
    if(!token) return res.status(400).send("Access Denied")

    try {
        const verified = jwt.verify(token,process.env.donor_token)
        next()
    } catch (error) {
        res.send(error.message)
    }
}


const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv=require('dotenv')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/UserModel')

const app = express()

// connect to mongoDB
dotenv.config();
mongoose.connect(process.env.MONGODB).then(()=>{
    console.log('connected to db');
})
.then(() => {
        app.listen(3001, () => {
            console.log('server running')
        })
    })
    
.catch((err)=>{
    console.log(err.message);
});



// middleware
app.use(bodyParser.json())
app.use(cors())


//Routes

//POST REGISTER
app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ email, username, password: hashedPassword })
        await newUser.save()
        res.status(201).json({ message: 'User created successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Error signing up' })
    }
})

//GET Registered Users
app.get('/register', async (req, res) => {
    try {
        const users = await User.find()
        res.status(201).json(users)
        
    } catch (error) {
        res.status(500).json({ error: 'Unable to get users' })
    }
})

//LOGIN

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials'})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '60hr' })
        res.json({ message: 'Login successful' })
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' })
    }
})
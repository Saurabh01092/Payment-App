const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const {User, Account} = require('../db');
const {JWT_SECRET} = require('../config');
const { authMidddleware } = require('../middleware');
const router = express.Router();

const signupBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
});

const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
});

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})


router.post('/signup', async (req, res) => {

    const success = signupBody.safeParse(req.body);

    if(!success) {
        return res.status(411).json({
            msg: 'Invalid Inputs'
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        msg:'User created successfully',
        token: token 
    })
})

router.post('/signin', async(req, res) => {
    username = req.body.username;
    password = req.body.password;

    const success = signinBody.safeParse(req.body);

    if(!success) {
        res.status(411).json({
            msg: 'Invalid Inputs'
        })
    }

    const isPresent = await User.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if(!isPresent) {
        res.status(411).json({
            msg: "User does not exist. Please signup first"
        })
        return;
    }

    const token = jwt.sign({
        userId: isPresent._id
    }, JWT_SECRET)
    res.status(200).json({
        msg: "Successfully Signed In..",
        token: token
    })

})

router.put('/', authMidddleware, async (req, res) => {
    const success = updateBody.safeParse(req.body)

    if(!success) {
        res.status(411).json({
            msg:"Error while updating information"
        })
    }

    await User.updateOne({_id:req.userId}, req.body)

    res.json({
        message: "Updated successfully"
    })
});

router.get('/bulk', async(req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username ? 'Username is already taken' : 'Email is already registred'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        })

        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign({
            id: newUser._id,
            username: newUser.username,
        }, jwtSecret, { expiresIn: '7d' });

        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Error in registering controller :', error);
        return res.status(500).json({
            error: 'Server error during registration'
        });
    }
}

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        if(!username || !password) {
            return res.status(400).json({
                error : 'Both fields are required'
            })
        }

        const user = await User.findOne({username});
        if(!user) {
            return res.status(400).json({
                error : 'Invalid username or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({
                error : 'Invalid username or password'
            })
        }

        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign({
            id : user._id,
            username : user.username,
        }, jwtSecret, {expiresIn : '7d'});

        return res.status(200).json({
            message : 'Login successful',
            token,
            user : {
                id : user._id,
                username : user.username,
                email : user.email
            }
        });
    } catch (error) {
        console.error('Error in login controller', error);
        return res.status(500).json({error : 'Server error during login'});
    }
};
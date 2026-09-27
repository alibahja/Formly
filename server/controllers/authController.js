
import {User} from '../models/user.js';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET must be set in the environment variables.")
}
const JWT_SECRET=process.env.JWT_SECRET;

const setSessionCookie=(res,payload)=>{
    const token=jwt.sign(payload,JWT_SECRET,{expiresIn:"30d"});
    res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
        sameSite:"lax",
        maxAge:30*24*60*1000,
        path:'/',
    })
}

export async function register(req,res){
    try {
        const {name,email,password}=req.body;
        if(!name || !email || !password){
           return res.status(400).json({error:"Name, email and password are required"})
        }
        if(password.length <8){
            return res.status(400).json({error:"Password must be at least 8 characters"})
        }
        const trimmedEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({ error: "Invalid email address" })
        }

        const existing=await User.findOne({email:trimmedEmail});
        if (existing){
            return res.status(400).json({error:"An account with this email already exists."})
        }
        const user=await User.create({name,email:trimmedEmail,password})

        setSessionCookie(res,{userId: user._id.toString(),email:user.email})
        res.status(201).json({
            user:{_id:user._id,name:user.name,email:user.email}
        })
    } catch (err) {
        if(err?.code===11000){
            return res.status(400).json({error:"An account with this email already exists"})
        }
        console.error("Register error: ",err);
        res.status(500).json({error:"Internal server error"})
    }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }
    const isValid = await user.comparePassword(password)  
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }
    
    setSessionCookie(res, { userId: user._id.toString(), email: user.email })
    res.status(200).json({                                  
      user: { _id: user._id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

export async function logout(_req,res){
   res.cookie("token","",{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"lax",
    maxAge:0,
    path:"/",
   })
   res.json({success:true})
}

export async function me(req,res){
    try {
        if(!req.user?.userId){
            return res.status(401).json({error:"Not authenticated"})
        }
        const user=await User.findById(req.user.userId).select("-password")
        if(!user){
            return res.status(404).json({error:"User not found."})
        }
        res.json({user})
    } catch (err) {
        console.error("Me error:",err);
        res.status(500).json({error:"Internal server error"})
    }
}
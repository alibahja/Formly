import jwt from 'jsonwebtoken'

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET must be set in the environment variables");
}
const JWT_SECRET=process.env.JWT_SECRET;

export function authMiddleware(req,res,next){
    const token=req.cookies.token;

    if(!token){
       return res.status(401).json({error:"Access denied. No session token provided"});
    }
    try{
        const decoded=jwt.verify(token,JWT_SECRET);
        if(!decoded?.userId){
            return res.status(401).json({error: "Invalid session token"});
        }
        req.user=decoded;
        next()
    }
    catch{
        return res.status(401).json({error:"Session expired or invalid. Please sign in again."});
    }
}
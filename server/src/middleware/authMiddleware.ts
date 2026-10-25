import {Request, Response, NextFunction} from 'express';
import  jwt from 'jsonwebtoken';

export interface AuthenticateRequest extends Request{
    user?: {
        id:string;
        email:string;
        name:string;
        role:string;
    };
}
export const verifyToken = (req:AuthenticateRequest, res:Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({
            success:false,
            message:"Authentication required: No JWT token provided in Authorization header."
        });
    }
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_2026';
    try{
        const decoded = jwt.verify(token, jwtSecret) as {
            id:string;
            email:string;
            name:string;
            role:string;
        }
        req.user = decoded;
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Authentication failed: Invalid or expired JWT token."
        });
    }
};

export const requireRole = (...allowedRoles: string[]) =>{
    return (req:AuthenticateRequest, res:Response, next: NextFunction) => {
        if(!req.user){
            return res.status(401).json({
                success:false,
                message:"Unauthorized: User identity not verified."
            });
        }
       if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:`Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`
            });      
        }
        next(); 
    };
};

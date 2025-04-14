import admin from "../../models/admin.js";
import bcrypt from "bcrypt"
import passport from "passport";
import generateTokens from "../../middleware/token.js";
const adminLogin=async(req,res,next)=>{
    try{
        passport.authenticate("admin",{session:false},async(err,user,info)=>{
            if (err) return res.status(500).json({isSuccess: false, message: "Something went wrong, please try again!"});
            if (!user) return res.status(404).json({ isSuccess: false, message: info.message });
              
            const { accessToken, refreshToken, payload } = generateTokens(user, "admin");
            return res.status(200).json({
                isSuccess: true,
                message: "Login Successfully.",
                refreshToken,
                accessToken,
                payload
              });
        })(req, res, next);

    }catch(error){
        
        const err=new Error("Something went wrong, Please try again!");
        next(err)
    }
}
export default adminLogin
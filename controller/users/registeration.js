import User from "../../models/user.js";
import bcrypt from "bcrypt";
import passport from "passport";
import generateTokens from "../../middleware/token.js";
const postUser=async(req,res,next)=>{
    try{
        const { fullname, email, password, mobile } = req.body;
        const existingUser = await User.findOne({ email });

        if(existingUser) return res.status(404).json({"isSuccess":false,"message":"Email is already exist"})

            const hasPassword=await bcrypt.hash(password,10)

            const newUser = new User({fullname,email,password:hasPassword,mobile:Number(mobile)});
            const savedUser = await newUser.save();
            return res.status(200).json({
                isSuccess: true,
                message: "User registerd successfully",
                data: savedUser,
              });
    
    }catch(errors){ 
        const err = new Error("Something went wrong, Please try again!");
    next(err);
    }
}


const userLogin=async(req,res,next)=>{
    try{
        passport.authenticate("user",{session:false},async(err,user,info)=>{
            if (err) return res.status(500).json({isSuccess: false, message: "Something went wrong, please try again!"});
            if (!user) return res.status(404).json({ isSuccess: false, message: info.message });
              
            const { accessToken, refreshToken, payload } = generateTokens(user, "user");
            return res.status(200).json({
                isSuccess: true,
                message: "Login Successfully.",
                accessToken,
                refreshToken,
                payload
              });
        })(req, res, next);

    }catch(error){
        
        const err=new Error("Something went wrong, Please try again!");
        next(err)
    }
}



const updateProfile = async (req, res, next) => {
    try {
        const { fullname,mobile,email } = req.body

        const userId=req.user._id 
        const profile = await User.findOne({ _id:userId });

        if (!profile) {
            return res.status(404).json({ isSuccess: false, message: "user not found " });
        }
        const result = await User.updateOne(
            { _id: userId },
            { $set: { fullname, mobile, email } }
          );

        if (result.nModified === 0) {
            return res.status(404).json({
                isSuccess: false,
                message: "profile not update"
            });
        }

        return res.status(200).json({ isSuccess: true, message: "profile updated successfully" });
    } catch (error) {
        console.log(error)
        const err = new Error("Something went wrong")
        next(err)
    }
};
export {postUser,userLogin,updateProfile}
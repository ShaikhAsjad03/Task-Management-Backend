import mongoose from "mongoose";
const adminschema=new mongoose.Schema(
    {
    fullname:{
        type:String,
        required: true,
    },
    email: {
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type:String,
    required: true,
  },
},
{timestamps: true,}
)

const admin=mongoose.model("admin",adminschema)
export default admin
import mongoose from "mongoose";
const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: { 
      type: Boolean,
      default: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } 
);

const User = mongoose.model("User", UserSchema);
export default User;

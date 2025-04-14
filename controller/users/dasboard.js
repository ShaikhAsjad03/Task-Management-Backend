
import Category from "../../models/category.js";
import Task from "../../models/task.js";

const userDashboard=async (req,res,next)=>{
    try{
const userId=req.user._id 
const totalTasks = await Task.countDocuments({ userId });
const pendingTasks = await Task.countDocuments({ userId, status: "pending" });
const completedTasks = await Task.countDocuments({ userId, status: "completed" });

const latestCategories = await Category.find({ userId })
.sort({ createdAt: -1 })
.limit(5)
.select("name");


const latestTasks = await Task.find({ userId })
.sort({ createdAt: -1 })
.limit(5)
.select("title image status");


res.status(200).json({
    isSuccess:true,
    "message":"user Dashboard get successfully",
    data: {
      totalTasks,
      pendingTasks,
      completedTasks,
      latestCategories,
      latestTasks,
    },
  });

    }catch(error){
        const err=new Error("Something went wrong!")
        next(err)
    }
}
export default userDashboard

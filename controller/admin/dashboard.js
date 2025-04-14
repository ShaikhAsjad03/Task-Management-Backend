import Category from "../../models/category.js";
import User from "../../models/user.js";
import Task from "../../models/task.js";
const adminDashboard = async (req, res, next) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const inactiveUsers = await User.countDocuments({ isActive: false });
  
      const latestUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullname email isActive createdAt");
  
  
      const latestTasks = await Task.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title image status createdAt");
  
      res.status(200).json({
        isSuccess: true,
        message: "Admin dashboard data fetched successfully",
        data: {
          cards: {
            totalUsers,
            activeUsers,
            inactiveUsers,
          },
          latestUsers,
          latestTasks,
        },
      });
    } catch (error) {
        console.log(error)
      const err = new Error("Failed to fetch dashboard data");
      next(err);
    }
  };

  
  export default adminDashboard
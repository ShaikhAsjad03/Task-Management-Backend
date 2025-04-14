import admin from "../../models/admin.js";
import Category from "../../models/category.js";
import Task from "../../models/task.js";
import User from "../../models/user.js";

const getAllUsersWithCounts = async (req, res, next) => {
  const { page = 1, limit = 10, search = "" } = req.query; 
  const skip = (page - 1) * limit; 
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "userId",
          as: "categories"
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "userId",
          as: "tasks"
        }
      },
      {
        $project: {
          fullname: 1,
          email: 1,
          mobile: 1,
          isActive: 1,
          createdAt: 1,
          categoryCount: { $size: "$categories" },
          taskCount: { $size: "$tasks" },
        }
      },
      {
        $match: {
          $or: [
            { fullname: { $regex: search, $options: "i" } }, 
            { email: { $regex: search, $options: "i" } } 
          ]
        }
      },
      {
        $skip: skip 
      },
      {
        $limit: parseInt(limit)
      },
    ]);

    const totalUsers = await User.countDocuments({
      $or: [
        { fullname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      isSuccess: true,
      message: "User list retrieved successfully",
     data:{data: users},
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: totalPages,
      }
    });
  } catch (error) {
    const err = new Error("Something went wrong");
    next(err);
  }
};




const getAllCategoriesPagination = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', userId } = req.body;

        if (!userId || typeof userId !== 'string' || userId.trim() === "") {
            return res.status(400).json({
                isSuccess: false,
                message: "User ID is required and must be valid",
                data: []
            });
        }

        const filter = {
            userId,
            ...(search && {
                name: { $regex: search, $options: 'i' }
            })
        };

        const categories = await Category.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Category.countDocuments(filter);

        const categoriesWithTaskCount = await Promise.all(
            categories.map(async (category) => {
                const taskCount = await Task.countDocuments({ categoryId: category._id });
                return {
                    ...category.toObject(),
                    taskCount
                };
            })
        );

        return res.status(200).json({
            isSuccess: true,
            message: "Categories fetched successfully",
            data: {
                data: categoriesWithTaskCount,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error(error);
        const err = new Error("Something went wrong");
        next(err);
    }
};


const getTasksByCategoryId = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" ,categoryId} = req.body;

        if (!categoryId) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid Category ID",
                data: [],
            });
        }

        const filter = {
            categoryId: categoryId,
        };

        if (search.trim()) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { status: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const tasks = await Task.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Task.countDocuments(filter);

        return res.status(200).json({
            isSuccess: true,
            message: "Tasks fetched successfully",
            data: {
                data: tasks,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit),
                },
            },
        });

    } catch (error) {
        console.error(error);
        next(new Error("Something went wrong while fetching tasks"));
    }
};



const getAllTasksByUserId = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.body;

       
        const filter = {};
        if (search.trim()) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } }, 
                { status: { $regex: search, $options: "i" } },
                { "userId.username": { $regex: search, $options: "i" } },
                { "categoryId.name": { $regex: search, $options: "i" } } 
            ];
        }

        const skip = (page - 1) * limit;
        const tasks = await Task.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("categoryId", "name") 
            .populate("userId", "fullname");

        const total = await Task.countDocuments(filter);

        return res.status(200).json({
            isSuccess: true,
            message: "Tasks fetched successfully for user",
            data: {
                data: tasks,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error(error);
        next(new Error("Something went wrong while fetching tasks for the user"));
    }
};


 const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ isSuccess: false, message: "User not found" });
        }

        const newStatus = !user.isActive;
        await User.updateOne(
            { _id: id },
            { $set: { isActive: newStatus } }
        );

        res.status(200).json({
            isSuccess: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
            data: user,
        });
    } catch (error) {
        console.log(error)
        next(new Error("Unable to update user status"));
    }
};


const updateProfile = async (req, res, next) => {
    try {
        const { fullname,email } = req.body

        const userId=req.user._id 
        const profile = await admin.findOne({ _id:userId });

        if (!profile) {
            return res.status(404).json({ isSuccess: false, message: "user not found " });
        }
        const result = await admin.updateOne(
            { _id: userId },
            { $set: { fullname, email } }
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


const getAllInActiveUsers = async (req, res, next) => {
    const { page = 1, limit = 10, search = "" } = req.query;  
    const skip = (page - 1) * limit; 
  
    try {
      const users = await User.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "userId",
            as: "categories"
          }
        },
        {
          $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "userId",
            as: "tasks"
          }
        },
        {
          $project: {
            fullname: 1,
            email: 1,
            mobile: 1,
            isActive: 1,
            createdAt: 1,
            categoryCount: { $size: "$categories" },
            taskCount: { $size: "$tasks" },
          }
        },
        {
          $match: {
            isActive: false,
            $or: [
              { fullname: { $regex: search, $options: "i" } }, 
              { email: { $regex: search, $options: "i" } } 
            ]
          }
        },
        {
          $skip: skip 
        },
        {
          $limit: parseInt(limit)
        },
      ]);
  
      const totalUsers = await User.countDocuments({
        isActive: false, 
        $or: [
          { fullname: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      });
  
      const totalPages = Math.ceil(totalUsers / limit);
  
      return res.status(200).json({
        isSuccess: true,
        message: "Inactive users retrieved successfully",
        data: { data: users },
        pagination: {
          total: totalUsers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: totalPages,
        }
      });
    } catch (error) {
      const err = new Error("Something went wrong");
      next(err);
    }
  };
  
export { getAllUsersWithCounts ,getAllCategoriesPagination,getTasksByCategoryId,getAllTasksByUserId,toggleUserStatus,updateProfile,getAllInActiveUsers};

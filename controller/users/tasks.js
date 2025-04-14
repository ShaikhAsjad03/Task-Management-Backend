import { deleteImage, formatFilePath } from "../../helper/common.js";
import Task from "../../models/task.js";
const postTasks = async (req, res, next) => {
    try { 
           const file=req.file
        const userId = req.user._id;
        if (!userId) {
            return res.status(403).json({
              isSuccess: false,
              message: "You are not authorized to update this task",
            });
          }
        

        if(!file?.filename){
            return res.status(400).json({ "isSuccess": false, "message": "image is required", }) 
        }
       let path= formatFilePath(req.file.path)
        const { title,categoryId,image,description,deadline } = req.body;
       
        
        const tasks = new Task({ title,categoryId,image:path,description,deadline, userId });
        await tasks.save();

        return res.status(200).json({ "isSuccess": true, "message": "Task created successfully", })
    } catch (error) {
        let path= formatFilePath(req.file.path)
        await deleteImage(path)
        const err = new Error("Something went wrong")
        next(err)
    }

}


const getAllTaskPagination = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            sortOrder = "desc",       
            sortColumn = "createdAt" 
        } = req.body;

        const userId = req.user._id;
        const match = { userId };
        if (search) {
            match.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                 { status: { $regex: search, $options: "i" } }
              ];
        }
        const sortFieldMap = {
            title: "title",
            status: "status",
            createdAt: "createdAt",
            category: "categoryName" 
        };

        const sortField = sortFieldMap[sortColumn] || "createdAt";

        const sortStage = {};
        sortStage[sortField] = sortOrder === "asc" ? 1 : -1;

        const tasks = await Task.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: "categories",               
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { 
                $unwind: { 
                  path: "$category", 
                  preserveNullAndEmptyArrays: true 
                } 
              },
                            
            {
                $lookup: {
                    from: "users",                   
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },                   

            {
                $addFields: {
                    categoryName: "$category.name"
                }
            },

            { $sort: sortStage },

            { $skip: (page - 1) * limit },
            { $limit: Number(limit) },

            {
                $project: {
                    title: 1,
                    description: 1,
                    status: 1,
                    deadline: 1,
                    image: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    category: { _id: "$category._id", name: "$category.name" },
                    user: { _id: "$user._id", email: "$user.email" }
                }
            }
        ]);

        const total = await Task.countDocuments(match);

        return res.status(200).json({
            isSuccess: true,
            message: "Tasks retrieved successfully",
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
        console.error("Error in getAllTaskPagination:", error);
        next(new Error("Something went wrong"));
    }
};




const updateTask = async (req, res, next) => {
  try {
    const { file, body } = req;
    const taskId = req.params.id;
    const userId = req.user._id; 
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        isSuccess: false,
        message: "Task not found",
      });
    }

  
    if (!userId) {
      return res.status(403).json({
        isSuccess: false,
        message: "You are not authorized to update this task",
      });
    }

    let updateData = { ...body };

    let path=null
    if (file?.filename) {
        if (task.image) {
            await deleteImage(task.image);
          }

          updateData.image = formatFilePath(file.path);

    }

    await Task.updateOne(
      { _id: taskId },
      { $set: updateData }
    );

    return res.status(200).json({
      isSuccess: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error(error);
    next(new Error("Something went wrong"));
  }
};



const deleteTasks = async (req, res, next) => {
    try {
        const { id } = req.params;
       const userId=req.user._id 
        const task = await Task.findOne({ _id: id, userId });

        if (!task) {
          return res.status(404).json({
            isSuccess: false,
            message: "Task not found"
          });
        }

        if (task.image) {
            await deleteImage(task.image);
          }



        const result = await Task.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                isSuccess: false,
                message: "Tasks not found"
            });
        }

        console.log("result?.image",result)
        await deleteImage(result?.image)
        return res.status(200).json({
            isSuccess: true,
            message: "Tasks deleted successfully"
        });
    } catch (error) {
        const err = new Error("Something went wrong")
        next(err)
    }
};


const updateTaskStatus = async (req, res, next) => {
    try {
        const { id,status } = req.body

        const tasks = await Task.findOne({ _id: id, userId: req.user._id });

        if (!tasks) {
            return res.status(404).json({ isSuccess: false, message: "Tasks not found " });
        }
        const result = await Task.updateOne(
            { _id: id, userId: req.user._id },
            { $set: { status: status } }
          );

        if (result.nModified === 0) {
            return res.status(404).json({
                isSuccess: false,
                message: "Tasks not found or no changes"
            });
        }

        return res.status(200).json({ isSuccess: true, message: "Tasks updated successfully" });
    } catch (error) {
        const err = new Error("Something went wrong")
        next(err)
    }
};
export {postTasks,getAllTaskPagination,updateTask,deleteTasks,updateTaskStatus}
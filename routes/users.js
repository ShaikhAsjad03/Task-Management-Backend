import express from "express"
import { deleteCategory, getAllCategories, getAllCategoriesPagination, postCategories, updateCategory } from "../controller/users/category.js"
import { categorySchema, taskSchema } from "../schema/schema.js"
import { taskImageUpload } from "../middleware/multer.js"
import { deleteTasks, getAllTaskPagination, postTasks, updateTask, updateTaskStatus } from "../controller/users/tasks.js"
import { updateProfile } from "../controller/users/registeration.js"
import userDashboard from "../controller/users/dasboard.js"
const userRouter=express.Router()

// CATEGORY ROUTE
userRouter.post("/category",categorySchema,postCategories)
userRouter.put("/category/:id",categorySchema,updateCategory)
userRouter.get("/category",getAllCategories)
userRouter.post("/category/pagination",getAllCategoriesPagination)
userRouter.delete("/category/:id",deleteCategory)


//TASK ROUTE
userRouter.post("/task",[taskImageUpload,taskSchema],postTasks)
userRouter.put("/task/:id",[taskImageUpload,taskSchema],updateTask)
userRouter.post("/task/pagination",getAllTaskPagination)
userRouter.delete("/task/:id",deleteTasks)
userRouter.post("/task/status",updateTaskStatus)
// PROFILE Ypdate
userRouter.post("/profile",updateProfile)

// USER DASHBOARD
userRouter.get("/dashboard",userDashboard)

export default userRouter


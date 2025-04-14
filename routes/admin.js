import express from "express"
import { getAllCategoriesPagination, getAllInActiveUsers, getAllTasksByUserId, getAllUsersWithCounts, getTasksByCategoryId, toggleUserStatus, updateProfile } from "../controller/admin/allUser.js"
import adminDashboard from "../controller/admin/dashboard.js"
const adminRouter=express.Router()

adminRouter.post("/users-list",getAllUsersWithCounts)
adminRouter.post("/inactive-users",getAllInActiveUsers)
adminRouter.post("/users-category",getAllCategoriesPagination)
adminRouter.post("/category/task",getTasksByCategoryId)
adminRouter.post("/all-task",getAllTasksByUserId)

adminRouter.put("/user/status/:id",toggleUserStatus)
adminRouter.post("/profile",updateProfile)

adminRouter.get("/dashboard",adminDashboard)
export default adminRouter

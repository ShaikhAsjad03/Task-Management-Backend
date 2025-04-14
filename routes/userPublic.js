import express from "express"
import { refreshAccessToken } from "../middleware/token.js"
import { postUser, userLogin } from "../controller/users/registeration.js"
import { userloginSchema, userRegisterationSchema } from "../schema/schema.js"
import adminLogin from "../controller/admin/login.js"
const userPublic=express.Router()

userPublic.post("/refresh-token",refreshAccessToken)
userPublic.post("/register",userRegisterationSchema,postUser)
userPublic.post("/login-user",userloginSchema,userLogin)
userPublic.post("/login-admin",userloginSchema,adminLogin)
export default userPublic

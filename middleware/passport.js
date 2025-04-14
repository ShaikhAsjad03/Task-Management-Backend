import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcrypt"
import admin from "../models/admin.js";
import User from "../models/user.js";
import "dotenv/config"


passport.use(
    "user",
    new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (usernameField, passwordField, done) => {
            try {

                
                const validUser = await User.findOne({ email:usernameField });
                if (!validUser) return done(null, false, { message: "Invalid email or password!" });
                if (!validUser?.isActive) return done(null, false, { message: "You are Blocked" });
                
                const comparePassword = await bcrypt.compare(passwordField, validUser.password)

                if (!comparePassword)
                    return done(null, false, { message: "email or password wrong!" });
                return done(null, validUser, { message: "LogIn successfully." });
            } catch (errors) {
                console.log(errors)
                return done(errors);
            }
        }
    )
)



passport.use(
  "admin",
  new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (usernameField, passwordField, done) => {
          try {
              
              const validUser = await admin.findOne({ email:usernameField });
              console.log(validUser)
              if (!validUser)
                  return done(null, false, { message: "Invalid email or password!" });
              
              const comparePassword = await bcrypt.compare(passwordField, validUser.password)

              if (!comparePassword)
                  return done(null, false, { message: "email or password wrong!" });
              return done(null, validUser, { message: "LogIn successfully." });
          } catch (errors) {
              console.log(errors)
              return done(errors);
          }
      }
  )
)


const jwtOptions = {
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        let user;
  
        if (payload.type === "admin") {
          user = await admin.findById(payload.id);
        } else if (payload.type === "user") {
          user = await User.findById(payload.id);
        }
  
        if (!user) {
          return done(null, false); 
        }
  
        return done(null, user); 
      } catch (error) {
        return done(error, null); 
      }
    })
  );

  

const isAuthenticated = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({
          isSuccess: false,
          message: "Something went wrong, please try again!",
          error: err,
        });
      }
      if (!user) {
        return res
          .status(401)
          .json({ isSuccess: false, message: "Unauthorized" });
      }
      req.user = user;
      next();
    })(req, res, next);
  };


  export default passport
  export {isAuthenticated}
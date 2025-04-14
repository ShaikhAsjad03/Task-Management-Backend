import jwt from "jsonwebtoken";
import "dotenv/config";

const generateTokens = (user, type) => {
  const payload = {
    id: user._id,
    name: user.fullname || "",
    email: user.email || "",
    mobile:user.mobile||"",
    type,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
    algorithm: "HS256",
  });

  const refreshToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10d",
    algorithm: "HS256",
  });


  return { accessToken, refreshToken, payload };
};




export const refreshAccessToken = (req, res,next) => {
  try {
    const {token} = req.body;
    console.log("token",token)
    if (!token) return res.status(401).json({ message: "No token found" });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err)
      if (err) return res.status(403).json({ message: "Invalid token" });

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      };

      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
        algorithm: "HS256",
      });

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    const err=new Error("Could not refresh token")
    next(err)
  }
};


export default generateTokens;

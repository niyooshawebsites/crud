import jwt from "jsonwebtoken";

const isAdmin = (req, res, next) => {
  try {
    console.log(req.cookies);
    const authToken = req.cookies.authToken;

    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid request. Authtoken missing",
      });
    }

    const userDetails = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
  } catch (err) {
    console.log(err);
  }
};

export default isAdmin;

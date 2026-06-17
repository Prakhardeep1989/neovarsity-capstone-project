const jwt = require("jsonwebtoken");

const createAuthMiddleware = (userModel) => {
  const protectRoute = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .send({ message: "Not authorized, token missing", alert: false });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("-password");

      if (!user) {
        return res
          .status(401)
          .send({ message: "User not found", alert: false });
      }

      req.user = user;
      next();
    } catch (err) {
      return res
        .status(401)
        .send({ message: "Invalid or expired token", alert: false });
    }
  };

  const adminOnly = (req, res, next) => {
    if (req.user?.role === "ADMIN") {
      next();
    } else {
      res.status(403).send({
        message: "Unauthorized: admin access required",
        alert: false,
      });
    }
  };

  return { protectRoute, adminOnly };
};

module.exports = createAuthMiddleware;

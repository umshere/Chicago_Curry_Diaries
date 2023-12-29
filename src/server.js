require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

app.get("/ping", (req, res) => {
  console.log(`pong`);
  res.status(200).send("pong");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const recipeRoutes = require("./routes/recipeRoutes");
app.use("/api/recipes", recipeRoutes);

const commentRoutes = require("./routes/commentRoutes");
app.use("/api/recipes", commentRoutes);

const blogRoutes = require('./routes/blogRoutes');
app.use('/api/blog', blogRoutes);

const userRoutes = require("./routes/userRoutes");
app.use('/api/users', userRoutes);

const User = require("./models/User");
const Recipe = require("./models/Recipe");
const Comment = require("./models/Comment");

app.get("/test-db", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({
      msg: "Database connected successfully!",
      userCount: count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

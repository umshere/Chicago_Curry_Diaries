const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const BlogPost = require("../models/BlogPost");
const upload = require('../middleware/multer');

router.post('/', authMiddleware, (req, res) => {
  upload(req, res, async (err) => {
    if(err) {
      res.status(400).json({ msg: "Error uploading image" });
    } else {
      const { title, content } = req.body;
      const image = req.file ? req.file.path : '';

      const blogPost = new BlogPost({
        title,
        content,
        author: req.user.id,
        image: image
      });

      await blogPost.save();
      res.status(201).json(blogPost);
    }
  });
});

router.get('/', async (req, res) => {
  try {
    const blogPosts = await BlogPost.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(blogPosts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;

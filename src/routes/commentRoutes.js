const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");

// @route POST api/recipes/:recipeId/comments
// @desc Post a comment to a recipe
// @access Private
router.post('/:recipeId/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const { recipeId } = req.params;

    let recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ msg: "Recipe not found" });
    }

    const newComment = new Comment({
      author: req.user.id,
      recipe: recipeId,
      text: text,
    });

    await newComment.save();

    // Adding comment to the recipe's comments array
    recipe.comments.push(newComment);
    await recipe.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route POST api/recipes/:recipeId/comments/:commentId/rate
// @desc Rate a comment (thumbs up/down)
// @access Private
router.post('/:recipeId/comments/:commentId/rate', authMiddleware, async (req, res) => {
  const { thumb } = req.body; // thumb can be 'up' or 'down'
  const { commentId } = req.params;

  try {
    let comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    if (thumb === 'up') {
      comment.thumbsUp += 1;
    } else if (thumb === 'down') {
      comment.thumbsDown += 1;
    } else {
      return res.status(400).json({ msg: "Invalid rating" });
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Recipe = require("../models/Recipe");
const upload = require('../middleware/multer');

// @route POST api/recipes
// @desc Create a recipe with image upload
// @access Private
router.post('/', authMiddleware, (req, res) => {
  upload(req, res, async (err) => {
    if(err) {
      res.status(400).json({ msg: err });
    } else {
      try {
        const { title, ingredients, instructions } = req.body;

        let images = [];
        if(req.file) {
          images.push(req.file.path); // We store the file path in the images array
        }

        const recipe = new Recipe({
          author: req.user.id,
          title,
          ingredients: ingredients.split(',').map(ingredient => ingredient.trim()),
          instructions,
          images
        });

        await recipe.save();
        res.status(201).json(recipe);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
      }
    }
  });
});

// @route GET api/recipes
// @desc Get all recipes
// @access Public
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

// @route GET api/recipes/:recipeId/comments
// @desc Get comments for a recipe
// @access Public
router.get('/:recipeId/comments', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await Recipe.findById(recipeId).populate('comments');
    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.json(recipe.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).send('Server error');
  }
});

// GET route to fetch a recipe by its ID
router.get('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if(!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.json(recipe);
  } catch(error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Add a new route for search functionality
router.post('/search', async (req, res) => {
  try {
    const { ingredient, title } = req.body;
    
    let query = {};
    if (ingredient) {
      query.ingredients = { $regex: ingredient, $options: 'i' };
    } else if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;

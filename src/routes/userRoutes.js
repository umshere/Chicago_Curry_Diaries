const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// Get the logged-in user's profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('favorites', 'title');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update the user's profile
router.put('/profile', auth, async (req, res) => {
  const { bio } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: { bio: bio } }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Handle user subscriptions
router.put('/profile/subscribe', auth, async (req, res) => {
  const { userIdToSubscribe } = req.body;
  try {
    // Get current user and the user to subscribe to
    const user = await User.findById(req.user.id);
    const userToSubscribe = await User.findById(userIdToSubscribe);

    if (!userToSubscribe || !user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if already subscribed
    if (user.subscriptions.includes(userToSubscribe._id)) {
      // Unsubscribe
      user.subscriptions.pull(userToSubscribe._id);
    } else {
      // Subscribe
      user.subscriptions.push(userToSubscribe._id);
    }

    await user.save();
    res.json(user.subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/users/favorites/:recipeId
// @desc Add or remove a recipe from the user's favorites
// @access Private
router.put('/favorites/:recipeId', auth, async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const user = await User.findById(req.user.id);

    const index = user.favorites.indexOf(recipeId);
    if (index >= 0) {
      // If the recipe is already in favorites, remove it
      user.favorites.splice(index, 1);
    } else {
      // If the recipe is not in favorites, add it
      user.favorites.push(recipeId);
    }

    await user.save();
    res.json(user.favorites);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

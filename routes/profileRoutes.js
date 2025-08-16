const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Route to get user details
router.post('/user', profileController.getUserById);

// Route to update profile image
router.post('/update-profile', profileController.upload.single('profileImage'), profileController.updateProfileImage);

// ✅ Route to update user details (this must exist)
router.post('/update-details', profileController.updateUserDetails);

router.post('/change-password', profileController.changePassword);
router.post('/remove-profile', profileController.removeProfileImage);



module.exports = router;

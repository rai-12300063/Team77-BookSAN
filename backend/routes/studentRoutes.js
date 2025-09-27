const express = require('express');
const {
    getDashboard,
    getMyCourses,
    getCourseDetails,
    updateProgress,
    addBookmark,
    removeBookmark,
    getAchievements,
    updateLearningGoals,
    getRecommendations
} = require('../controllers/studentController');
const { protect, requireAnyRole, requirePermission } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireAnyRole);

router.get('/dashboard', requirePermission('profile:read'), getDashboard);

router.route('/courses')
    .get(requirePermission('courses:read'), getMyCourses);

router.route('/courses/:id')
    .get(requirePermission('courses:read'), getCourseDetails)
    .put(requirePermission('progress:write'), updateProgress);

router.route('/courses/:id/bookmarks')
    .post(requirePermission('progress:write'), addBookmark);

router.route('/courses/:id/bookmarks/:bookmarkId')
    .delete(requirePermission('progress:write'), removeBookmark);

router.get('/achievements', requirePermission('profile:read'), getAchievements);

router.route('/learning-goals')
    .put(requirePermission('profile:write'), updateLearningGoals);

router.get('/recommendations', requirePermission('courses:read'), getRecommendations);

module.exports = router;
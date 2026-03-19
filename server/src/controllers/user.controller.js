/**
 * User Controller — Profile and skills management
 */
const User = require('../models/User.model');

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile (including skills).
 */
async function getProfile(req, res) {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: null,
    });
  }

  res.json({
    success: true,
    message: 'Profile fetched successfully',
    data: user,
  });
}

/**
 * PATCH /api/user/skills
 * Add or remove skills from the user's profile.
 * Body: { add: [string], remove: [string] }
 */
async function patchUserSkills(req, res) {
  const { add = [], remove = [] } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
      data: null,
    });
  }

  // Add new skills (deduplicate, case-insensitive check)
  add.forEach((skill) => {
    const trimmed = skill.trim();
    if (trimmed && !user.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      user.skills.push(trimmed);
    }
  });

  // Remove specified skills
  if (remove.length) {
    user.skills = user.skills.filter(
      (s) => !remove.some((r) => r.toLowerCase() === s.toLowerCase())
    );
  }

  await user.save();

  res.json({
    success: true,
    message: 'User skills updated successfully',
    data: { skills: user.skills },
  });
}

/**
 * PUT /api/user/profile
 * Update global profile sections (experience, education, summary, projects, personalInfo)
 */
async function updateProfile(req, res) {
  const { summary, experience, education, projects, personalInfo } = req.body;
  
  const updateDoc = {};
  if (summary !== undefined) updateDoc.summary = summary;
  if (experience !== undefined) updateDoc.experience = experience;
  if (education !== undefined) updateDoc.education = education;
  if (projects !== undefined) updateDoc.projects = projects;
  if (personalInfo !== undefined) updateDoc.personalInfo = personalInfo;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: updateDoc },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
}

module.exports = { getProfile, patchUserSkills, updateProfile };

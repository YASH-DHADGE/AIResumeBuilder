const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    sections: {
      personalInfo: {
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
      },
      summary: { type: String, default: '' },
      experience: [
        {
          company: { type: String, default: '' },
          role: { type: String, default: '' },
          duration: { type: String, default: '' },
          bullets: [{ type: String }],
        },
      ],
      education: [
        {
          institution: { type: String, default: '' },
          degree: { type: String, default: '' },
          year: { type: String, default: '' },
          gpa: { type: String, default: '' },
        },
      ],
      skills: [{ type: String }],
      projects: [
        {
          name: { type: String, default: '' },
          description: { type: String, default: '' },
          techStack: [{ type: String }],
          link: { type: String, default: '' },
        },
      ],
      certifications: [{ type: String }],
    },
    atsScore: {
      type: Number,
      default: null,
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    lastJobDescription: {
      type: String,
      default: '',
    },
    exportedDocxPath: {
      type: String,
      default: null,
    },
    exportedPdfPath: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);

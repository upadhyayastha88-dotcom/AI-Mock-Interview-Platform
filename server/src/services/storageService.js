const fs = require('fs');
const path = require('path');
const Interview = require('../models/Interview');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'interviews.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

function readJsonFile() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading JSON fallback storage:', err.message);
    return [];
  }
}

function writeJsonFile(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON fallback storage:', err.message);
  }
}

const isMongooseConnected = () => {
  return mongoose.connection.readyState === 1;
};

const StorageService = {
  async createInterview(interviewData) {
    if (isMongooseConnected()) {
      const interview = new Interview(interviewData);
      return await interview.save();
    } else {
      const items = readJsonFile();
      const newInterview = {
        _id: 'mock_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        ...interviewData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.unshift(newInterview);
      writeJsonFile(items);
      return newInterview;
    }
  },

  async getInterviewById(id) {
    if (isMongooseConnected()) {
      try {
        return await Interview.findById(id);
      } catch {
        return null;
      }
    } else {
      const items = readJsonFile();
      return items.find((item) => String(item._id) === String(id)) || null;
    }
  },

  async updateInterview(id, updateData) {
    if (isMongooseConnected()) {
      try {
        return await Interview.findByIdAndUpdate(id, updateData, { new: true });
      } catch {
        return null;
      }
    } else {
      const items = readJsonFile();
      const index = items.findIndex((item) => String(item._id) === String(id));
      if (index === -1) return null;

      items[index] = {
        ...items[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeJsonFile(items);
      return items[index];
    }
  },

  async getAllInterviews() {
    if (isMongooseConnected()) {
      try {
        return await Interview.find().sort({ createdAt: -1 });
      } catch {
        return [];
      }
    } else {
      const items = readJsonFile();
      return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async deleteInterview(id) {
    if (isMongooseConnected()) {
      try {
        return await Interview.findByIdAndDelete(id);
      } catch {
        return null;
      }
    } else {
      const items = readJsonFile();
      const filtered = items.filter((item) => String(item._id) !== String(id));
      writeJsonFile(filtered);
      return { success: true };
    }
  }
};

module.exports = StorageService;

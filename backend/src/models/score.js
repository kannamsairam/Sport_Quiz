const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },//
    score: { type:Number, required: true },
});

module.exports = mongoose.model("score", scoreSchema);
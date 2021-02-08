const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SongSchema = new Schema(
  {
    _id: Number,
    artist: String,
    song: String,
    links: [String],
    comments: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", SongSchema);

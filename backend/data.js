// /backend/data.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// this will be our data base's data structure
const SongSchema = new Schema(
  {
    id: Number,
    artist: String,
    song: String,
    link: String

  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("Song", SongSchema);

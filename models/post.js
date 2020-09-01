const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: String,
        postedBy: { type: ObjectId, ref: "User" },
      },
    ],
    postedBy: {
      type: ObjectId, // Recogeremos los datos del usuario registrado
      ref: "User", // Esta referencia nos permite linkear postModel a userModel via ObjectId,
    },
  },
  { timestamps: true }
);

mongoose.model("Post", postSchema); // Atribuimos a postSchema el nombre Post

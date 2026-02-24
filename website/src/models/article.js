//Article model

import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a title"],
    },
    content: {
        type: String,
        required: [true, "Please provide a content"],
    },
    author : {
        type: String,
        required: [true, "Please provide a author"],
    },

},
{
    timestamps: true,

});

export const Article = mongoose.models.Article || mongoose.model("Article", articleSchema);
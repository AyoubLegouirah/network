const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readPost = async (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get data : " + err);
  }).sort({ createdAt: -1 });
};

module.exports.createPost = async (req, res) => {
  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.updatePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const updatedRecord = {
    message: req.body.message,
  };

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: updatedRecord },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }

    res.send(updatedPost);
  } catch (error) {
    console.log("Update error : " + error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.deletePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const deletedPost = await PostModel.findOneAndDelete({
      _id: req.params.id,
    });
    if (!deletedPost) {
      return res.status(404).send("Post not found.");
    }
    res.send(deletedPost);
  } catch (error) {
    console.log("Delete error:", error);
    return res.status(500).send("Internal server error.");
  }
};

module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likers: req.body.id }},
            { new: true }
        );
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.body.id,
            { $addToSet: { likes: req.params.id }},
            { new: true }
        );

        return res.status(200).json({ updatedPost, updatedUser });
    } catch (error) {
        return res.status(400).send(error);
    }
};



module.exports.unlikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { likers: req.body.id }},
            { new: true }
        );
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.body.id,
            { $pull: { likes: req.params.id }},
            { new: true }
        );

        return res.status(200).json({ updatedPost, updatedUser });
    } catch (error) {
        return res.status(400).send(error);
    }
};


module.exports.commentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                    },
                },
            },
            { new: true }
        );

        return res.status(200).send(updatedPost);
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.editCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) 
            return res.status(404).send("Post not found");
        
        const theComment = post.comments.find((comment) =>
            comment._id.equals(req.body.commentId)
        );
        if (!theComment) 
            return res.status(404).send("Comment not found");

        theComment.text = req.body.text;

        const updatedPost = await post.save();
        return res.status(200).send(updatedPost);
    } catch (err) {
        return res.status(500).send(err);
    }    
}



module.exports.deleteCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId,
                    },
                },
            },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        return res.send(updatedPost);
    } catch (err) {
        return res.status(500).send(err);
    }
}




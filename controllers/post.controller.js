const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.readPost = async (req, res) => {
    PostModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log('Error to get data : ' + err);
    }).sort({ createdAt: -1 });
}

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
}

module.exports.updatePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

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
            return res.status(404).send('Post not found');
        }

        res.send(updatedPost);
    } catch (error) {
        console.log('Update error : ' + error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        const deletedPost = await PostModel.findOneAndDelete({_id: req.params.id});
        if (!deletedPost) {
            return res.status(404).send('Post not found.');
        }
        res.send(deletedPost);
    } catch (error) {
        console.log('Delete error:', error);
        return res.status(500).send('Internal server error.');
    }
}


module.exports.likePost = async (req, res) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id))
        return res.status(400).send('ID unknown : ' + id);

    const { id: userId } = req.body;

    try {
        // Ajouter le like au post
        const updatedPost = await PostModel.findByIdAndUpdate(
            id,
            { $addToSet: { likers: userId } },
            { new: true }
        );

        // Ajouter le like à l'utilisateur
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $addToSet: { likes: id } },
            { new: true }
        );

        res.send(updatedUser);
    } catch (error) {
        console.log('Like error:', error);
        return res.status(400).send(error);
    }
};

module.exports.unlikePost = async (req, res) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id))
        return res.status(400).send('ID unknown : ' + id);

    const { id: userId } = req.body;

    try {
        // Retirer le like du post
        const updatedPost = await PostModel.findByIdAndUpdate(
            id,
            { $pull: { likers: userId } },
            { new: true }
        );

        // Retirer le like de l'utilisateur
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { likes: id } },
            { new: true }
        );

        res.send(updatedUser);
    } catch (error) {
        console.log('Unlike error:', error);
        return res.status(400).send(error);
    }
};

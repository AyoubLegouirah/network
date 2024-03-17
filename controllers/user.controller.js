const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;


module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};



// Récupérer un utilisateur
module.exports.userInfo = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Mettre à jour un utilisateur
module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);
  console.log(req.body);

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { bio: req.body.bio } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};



// Supprimer un utilisateur
module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const result = await UserModel.deleteOne({ _id: req.params.id }).exec();
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Successfully deleted. " });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};



// follow
module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    // add to the followers list
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // add to the following list
    const userToFollow = await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found" });
    }

    res.status(201).json({ message: "Successfully followed" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};



// unfollow
module.exports.unfollow = async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToUnFollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { following: req.body.idToUnFollow } },
        { new: true, upsert: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const userToUnFollow = await UserModel.findByIdAndUpdate(
        req.body.idToUnFollow,
        { $pull: { followers: req.params.id } },
        { new: true, upsert: true }
      );
  
      if (!userToUnFollow) {
        return res.status(404).json({ message: "User to unfollow not found" });
      }
  
      res.status(200).json({ message: "Successfully unfollowed" });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
};
  

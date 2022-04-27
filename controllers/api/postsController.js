const User = require("../../models/userModel");
const Post = require("../../models/postModel");

exports.getPosts = async (req, res, next) => {
  try {
    let posts = await Post.find()
      .populate("postedBy")
      .populate("retweetData")
      .populate("replyTo")
      .sort({ createdAt: -1 });
    
    posts = await User.populate(posts, { path : "retweetData.postedBy"});
    posts = await User.populate(posts, { path : "replyTo.postedBy"});

    res.status(200).send(posts);
  } catch (err) {
    res.sendStatus(400);
  }
};

exports.getPost = async (req, res, next) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId)
      .populate("postedBy")
      .populate("retweetData");

      const results = {
          postData : post
      }
      if(results.postData.replyTo) {
          results.replyTo = results.postData.replyTo;
      }

      results.replies = await Post.find({replyTo : postId})
      .populate("postedBy")
      .populate("retweetData")
      .populate("replyTo")
      .sort({ createdAt: -1 });

      results.replies = await User.populate(results.replies, { path : "retweetData.postedBy"});
      results.replies = await User.populate(results.replies, { path : "replyTo.postedBy"});

      
      console.log(results.replies);
      res.status(200).send(results);
    } catch (err) {
        console.log(err);
      res.sendStatus(400);
    }
  };

exports.likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user._id;

    const likes = req.session.user.likes;
    const isLiked = likes && likes.includes(postId);

    const option = isLiked ? "$pull" : "$addToSet";

    // return the newly updated user with the new likes array instead of the cashed one in session user
    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { likes: postId } },
      { new: true }
    );
    // Update post
    const post = await Post.findByIdAndUpdate(
        postId,
        { [option]: { likes: userId } },
        { new: true }
      );

    res.status(200).send(post);

  } catch (err) {
    res.sendStatus(400);
  }
};

exports.retweetPost = async (req, res, next) => {
    try {

      const postId = req.params.id;
      const userId = req.session.user._id;
        

      const deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId});

      const option = deletedPost ? "$pull" : "$addToSet";
  
      let repost = deletedPost;

      if(repost == null) {
          repost = await Post.create({postedBy : userId, retweetData : postId})
      }
      
      // return the newly updated user with the new likes array instead of the cashed one in session user
      req.session.user = await User.findByIdAndUpdate(
        userId,
        { [option]: { retweets : repost._id } },
        { new: true }
      );
      // Update post
      const post = await Post.findByIdAndUpdate(
          postId,
          { [option]: { retweetUsers: userId } },
          { new: true }
        );
  
      res.status(200).send(post);
  
    } catch (err) {
        console.log(err);
      res.sendStatus(400);
    }
  };

exports.createPost = async (req, res, next) => {

  if (!req.body.content) {
    console.log("Content params wasn't sent with request");
    res.sendStatus(400);
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user._id,
  };

  if(req.body.replyTo) {
      postData.replyTo = req.body.replyTo;
  }

  try {
    let newPost = await Post.create(postData);
    console.log(newPost);
    newPost = await User.populate(newPost, { path: "postedBy" });
    res.status(201).send(newPost);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};

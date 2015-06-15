/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

function getUrlPath (host, url) {
  return url.split(host)[1];
};

module.exports = {
  new: function (req, res, next) {
    res.view();
  },

  create: function (req, res, next) {
    User.create( req.params.all(), function (err, user) {

      if (err) {
        console.log(err);

        req.session.flash = {
          err: err
        }

        return res.redirect('/signup');
      }

      req.session.authenticated = true;
      req.session.User = user;

      res.redirect('/user/show/' + user.id)
    });
  },

  show: function (req, res, next) {
    User.findOne(req.params.id, function (err, user) {
      if (err) return next(err);
      if (!user) return next();

      var currentUser = req.session.User;

      currentUser.following.forEach(function (followedUser) {
        if (followedUser.id === user.id) {
          user.isFollowed = true;
        } 
      });
      
      res.view({
        user: user
      });

    });
  },

  index: function (req, res, next) {

    User.count(function (err, count) {
    
      var limit = 10;
      var lastPage = Math.ceil(count/limit);
      var params = req.params.all();

      var page;
      if (params.page && params.page <= lastPage) {
        page = params.page;
      } else {
        page = 1;
      }

      var currentUser = req.session.User;

      User.find({ id: { '!': currentUser.id } }).paginate({page: page, limit: limit}).sort('username').exec(function (err, users) {

        users = users.filter(function (user) {
          return user.id !== currentUser.id;
        });

        // Determine if the user is being followed by the current logged in user
        users.forEach(function (user) {
          user.isFollowed = false;
        });
        users.forEach(function (user) {

          currentUser.following.forEach(function (followedUser) {
            if (followedUser.id === user.id) {
              user.isFollowed = true;
            } 
          });
        });

        res.view({
          users: users,
          page: parseInt(page),
          lastPage: parseInt(lastPage),
          limit: limit
        });

      });

    });
  },

  follow: function (req, res, next) {
    var currentUser = req.session.User;

    User.findOne(req.params.id, function (err, user) {
      if (err) return next(err);
      
      var toFollow = user;

      User.findOne(currentUser.id).exec(function (err, user) {

        user.following.push({ "id": toFollow.id, "username":  toFollow.username});
        user.save(function (err) { 
          if (err) return next(err);
          req.session.User = user;

          var pathname = getUrlPath(req.headers.host, req.headers.referer);
          res.redirect(pathname);
        });
      });
      
    });

  },

  unfollow: function (req, res, next) {
    var currentUser = req.session.User;

    User.findOne(req.params.id, function (err, user) {
      if (err) return next(err);
      
      var toUnfollow = user;

      User.findOne(currentUser.id).exec(function (err, user) {
        user.following = user.following.filter( function (el) {
          return el.id !== toUnfollow.id;
        });
        user.save(function (err) { 
          if (err) return next(err);
          req.session.User = user;

          var pathname = getUrlPath(req.headers.host, req.headers.referer);          
          res.redirect(pathname);
        });
      });
      
    });
  }
  
};


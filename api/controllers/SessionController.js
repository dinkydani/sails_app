/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  new: function (req, res) {
    res.view();
  },

  create: function(req, res, next) {

    var params = req.params.all();
    if (!params.username || !params.password) {

      var usernamePasswordRequiredError = [{
        name: 'usernamePasswordRequired',
        message: 'You must enter both a username and password.'
      }]

      req.session.flash = {
        err: usernamePasswordRequiredError
      }
      console.log(usernamePasswordRequiredError);

      res.redirect('/login');
      return;
    }

    User.findOneByUsername(params.username, function (err, user) {
      if (err) return next(err);

      if (!user) {
        var noAccountError = [{
          name: 'noAccount',
          message: 'The username ' + params.username + ' not found.'
        }]
        req.session.flash = {
          err: noAccountError
        }
        console.log(noAccountError);
        res.redirect('/login');
        return;
      }

      if (params.password === user.password) {

        req.session.authenticated = true;
        req.session.User = user;

        res.redirect('/user/show/' + user.id);
        
      } else {

        var usernamePasswordMismatchError = [{
          name: 'usernamePasswordMismatch',
          message: 'Invalid username and password combination.'
        }]
        req.session.flash = {
          err: usernamePasswordMismatchError
        }
        console.log(usernamePasswordMismatchError);
        res.redirect('/login');
        return; 

      }
    });
  },

  destroy: function(req, res, next) {
    req.session.destroy();
    res.redirect('/login')
  }
	
};


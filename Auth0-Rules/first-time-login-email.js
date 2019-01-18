function(user, context, callback) {
    user.app_metadata = user.app_metadata || {};
    if (!user.app_metadata.signedUp) {
      return callback(null, user, context);
    }
  
    request.post( {
      url: 'https://api.sendgrid.com/api/mail.send.json',
      headers: {
        'Authorization': 'Bearer ...'
      },
      form: {
        'to': 'rory.webber@arup.com',
        'subject': 'NEW SIGNUP',
        'from': 'rory.webber@arup.com',
        'text': 'We have got a new sign up from: ' + user.email + '.'
      }
    }, function(e,r,b) {
      if (e) return callback(e);
      if (r.statusCode !== 200) return callback(new Error('Invalid operation'));
  
      user.app_metadata.signedUp = true;
      auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
      .then(function(){
        callback(null, user, context);
      })
      .catch(function(err){
        callback(err);
      });
    });
  }
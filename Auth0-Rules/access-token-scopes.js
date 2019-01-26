function (user, context, callback) {
    if (context.clientName !== 'Default App') {//change default app to the application that is being used
      return callback(null, user, context);
    }
  
    var permissions = user.permissions || [];
    var requestedScopes = context.request.body.scope || context.request.query.scope;
    var filteredScopes = requestedScopes.split(' ').filter( function(x) {
      return x.indexOf(':') < 0;
    });
    Array.prototype.push.apply(filteredScopes, permissions);
    context.accessToken.scope = filteredScopes.join(' ');
  
    callback(null, user, context);
  }
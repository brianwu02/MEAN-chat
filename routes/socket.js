// keep track of which names are being used

var userNames = (function() {
  var names = [];

  var claim = function(name) {
    if (!name) {
      return false;
    } else {
      for (var i = 0; i < names.length; i++) {
        if (name == names[i]) {
          return false;
        }
      }
      names.push(name);
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it

  var getGuestName = function() {
    var name;
    var nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));
    return name;
  };

  // serialize claied names as an array
  var get = function() {
    return names;
  };
 
  var free = function(name) {
    for (var i = 0; i < names.length; i++) {
      if (name == names[i]) {
        names.splice(i,1);
        break;
      }
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

// function for listening to the socket.
module.exports = function(socket) {
  var name = userNames.getGuestName();

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });
  
  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a users message to other users
  socket.on('send:message', function(data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.message
    });
  });

  // validate a users name chamge, and broadcast it on sucess
  socket.on('change:name', function(data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function() {
    socket.broadcast.emit('user:left', {
      name: name 
    });
    userNames.free(name);
  });
};



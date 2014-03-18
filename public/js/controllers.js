/** Remember to refactor so that AppCtrl isn't in global scope
 *
 */
function AppCtrl($scope, socket) {
  // Socket Listeners
  
  $scope.messages = [];

  socket.on('init', function(data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function(data) {
    $scope.messages.push(data);
    console.log('socket:send:message called');
  });

  socket.on('change:name', function(data) {
    changeName(data.oldName, data.newName);
    console.log('socket:change:name called');
  });

  socket.on('user:join', function(data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
    console.log('socket:user:join called');
  });

  // add a message to the conversation when a user disconnects or leaves the room

  socket.on('user:left', function(data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });

    var i;

    for (i=0; i<$scope.users.length; i++) {
      if (data.name == $scope.users[i]) {
        $scope.users.splice(i, 1);
        break;
      }
    }
    console.log('socket:user:left called');
  });

  // Helper methods
  var changeName = function(oldName, newName) {
    var i;
    for (i=0; i<$scope.users.length; i++) {
      if ($scope.users[i] == oldName) {
        $scope.users[i] = newName;
        break;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + 'is now known as ' + newName + '.'
    });
  };

  // methods published to the scope

  $scope.changeName = function() {
    console.log('socket:changename: called');
    socket.emit('change:name', {
      name: $scope.newName
    }, function(result) {
      if (!result) {
        console.log('!result happened');
        alert('your name cannot be changed, sorry');
      } else {
        console.log('$scope.name: ' + $scope.name);
        console.log('$scope.newName: ' + $scope.newName);
        changeName($scope.name, $scope.newName);
        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.sendMessage = function() {
    socket.emit('send:message', { 
      message: $scope.message 
    });

    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });
    $scope.message = '';
    console.log('socket:send:message called');
  };
}









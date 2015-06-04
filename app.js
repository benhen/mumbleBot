var mumble = require('mumble');
var fs = require('fs');
// var scream = fs.createReadStream('scream.wav');
//fs.readFileSync('scream.wav');
var options = {
    key: fs.readFileSync( 'key.pem' ),
    cert: fs.readFileSync( 'crt.pem' )
}
/*

To generate certificates:
key: openssl pkcs12 -in MumbleCertificate.p12 -out key.pem -nocerts -nodes
cert: openssl pkcs12 -in MumbleCertificate.p12 -out crt.pem -clcerts -nokeys
*/

// scream.on('end', function() {
//     console.log('stream ended');
//     scream.unpipe();
// });

console.log( 'Connecting' );
mumble.connect( 'mumble://benhen.zzzz.io', options, function ( error, connection ) {
    if( error ) { throw new Error( error ); }

    console.log( 'Connected' );

    connection.authenticate( 'e' );

    // THiS CODE DOESN'T WORK FOR SOME REASON
    // for (var i = 0; i < oneWordCommands.length; i++) {

    //     var word = oneWordCommands[i][1];
    //     var identifier = oneWordCommands[i][0]

    //     console.log(word+'from ' + oneWordCommands[i][0]);

    //     var newCommand = new Object();
    //     newCommand.identifier = identifier;
    //     newCommand.minLength = 0;
    //     newCommand.action = function(connection, keyString, keyArray) {
    //         sendMessage(connection, word);
    //         console.log('index of ' + i);
    //     }
    //     // var newItem = {
    //     //     identifier: identifier,
    //     //     minLength: 0, 
    //     //     action: function(connection, keyString, keyArray) {
    //     //         sendMessage(connection, word);
    //     //     }
    //     // };

    //     commands.push(newCommand);
    // };

    connection.on( 'initialized', function() {
        //gotta add that parameter
        onInit(connection);
    });
    connection.on( 'message', function(message, actor) {
        //gotta add that parameter again
        onMessage(connection, message, actor);

    });
    connection.on('user-connect', function(user) {
        sendMessage('Hello ' + user.name + '!');
    });
    // connection.on( 'voice', onVoice );
});

var onInit = function(connection) {
    console.log( 'Connection initialized' );
    // Connection is authenticated and usable.

    //Print out a list of users (you can comment this out)
    var users = connection.users();
    console.log(JSON.stringify(users[0].name));
    for (var i = 0; i < users.length; i++) {
        console.log('Hi ' + users[i].name + '!');
    }

    //Connect to Elliptical Madness if it exists
    //I added timeouts to account for connection delays
    //There is probably a better way, but whatever
    setTimeout(function() {
        //look for channel
        var channel = connection.channelByName("Elliptical Madness");
        if (channel) {
            console.log("Autoconnect channel found.");
            channel.join();
            setTimeout(function() {
                sendMessage(connection, "Autoconnected. Hi!");
            }, 1000);
        } else {
            console.log("Autoconnected channel not found");
        }
    }, 500);
};

var playing = false;

var onMessage = function(connection, message, actor) {
    if (actor.name === 'e') {
        //don't respond to yourself
        return;
    }

    //Ignore message if it doesn't contain "!"
    if (message.indexOf("!") === -1)
        return;

    //Take away all html elements - from this:
    //http://stackoverflow.com/questions/17164335/how-to-remove-only-html-tags-in-a-string-using-javascript
    var messageText = message.replace(/<\/?(p|i|b|br)\b[^<>]*>/g, '');
    messageArray = messageText.split(' ');
    for (var i = 0; i < messageArray.length; i++) {
        //convert to lower case to make easier to parse
        messageArray[i] = messageArray[i].toLowerCase();
    };

    //ignore message if it doesn't meet certain criteria
    if (!messageArray || messageArray.length === 0 
        || messageArray[0].length === 1 || messageArray[0].substring(0, 1) !== '!') return;

    //first word is the keyword (after the '!')
    var keyWord = messageArray[0].substring(1);
    if (messageArray.length > 0) {
        //take away command from beginning to make easier to parse
        messageText = messageText.substring(messageArray[0].length+1);
    }
    messageArray.shift(); //remove first element (e.g. '!hi')

    performCommand(connection, keyWord, messageText, messageArray, actor)
    
};

var onVoice = function( event ) {
    console.log( 'Mixed voice' );

    var pcmData = voice.data;
}

var sendMessage = function(connection, message, actor) {
    //if you include a user, send it to him
    if (actor) {
        actor.sendMessage(message);
    } else {
        if (connection.user) {
            connection.user.channel.sendMessage(message);
        }
    }
}

var performCommand = function(connection, keyWord, commandText, commandArray, actor) {

    var foundCommand = false;
    for (var i = 0; i < oneWordCommands.length; i++) {
        if (oneWordCommands[i][0] === keyWord) {
            console.log('Received command: ' + oneWordCommands[i][0]);
            sendMessage(connection, oneWordCommands[i][1]);

            foundCommand = true;
            break;
        }
    }
    if (!foundCommand) {
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            //TODO: array identifiers
            //This looks for a command with a matching keyword
            if (command.identifier === keyWord) {
                console.log('Received command: ' + command.identifier);
                //execture if found
                command.action(connection, commandText, commandArray, actor);
                foundCommand = true;
                break;
            }
        }
    }

    if (!foundCommand) {
        sendMessage(connection, 'Command not found');
    }
}

var playSound = function(connection, sound) {
    if (playing) return;
    // scream.pipe(connection.inputStream());

    // scream = fs.readFileSync(sound);
    scream = fs.createReadStream(sound);
    scream.on('end', function() {
        scream.unpipe();
    });

    // if (keyArray.length >= 1) {
    //     var user = connection.userByName(keyArray[0]);
    //     if (user) {
    //         // user.inputStream()
    //         while (user.inputStream().write(scream)) { }
    //     } else {
    //         console.log('user ' + keyArray[0] + ' not found');
    //     }
    // } else {
    //     while (connection.inputStream().write(scream)) { }
    // }

    scream.pipe(connection.inputStream());
    // connection.sendVoice(scream);
}


var oneWordCommands = [
    ['hi', 'Hello!'],
    ['lenny', '( ͡° ͜ʖ ͡°)'],
    ['dong', 'ヽ༼ຈل͜ຈ༽ﾉ raise your dongers ヽ༼ຈل͜ຈ༽ﾉ'],
    ['hecomes', 'Ḫ̵͇Ẹ ̢̥̰̥̻̘̙̠C̺̙̠͠O̠̗M̺̭E̵S͖͓͜'],
    ['meh', '¯\\_(ツ)_/¯'],
    ['flipthetable', '(╯°□°）╯︵ ┻━┻'],
    ['putitdown', '┬─┬ノ( º _ ºノ) chill out bro']
];

var commands = [{
    identifier: 'doge',
    minLength: 0, //how much additional information you need 
    action: function(connection) {
        var words = ['amaze', 'wow', 'such mumble', 'so bot', 'such auto'];
        sendMessage(connection, words[Math.floor(Math.random()*words.length)]);
    }
}, {
    identifier: 'curse',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString) {
        sendMessage(connection, 'Screw you, ' + keyString + '!');
    }
}, {
    identifier: 'help',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString, keyArray, actor) {
        sendMessage(connection, 'Here is a list of all commands:', actor);

        var text = '';
        for (var i = 0; i < commands.length; i++) {
            //don't want anyone else to know
            if (commands[i].identifier === 'scream'
                || commands[i].identifier === 'blackYeah') continue; 

            text += commands[i].identifier + ', ';
        }

        for (var i = 0; i < oneWordCommands.length; i++) {
            text += oneWordCommands[i][0] + ', ';
        };

        sendMessage(connection, text);
    }
}, {
    identifier: 'move',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString) {
        //get rest of command without '!move '
        var newChannel = keyString;
        if (newChannel === 'root') {
            connection.rootChannel.join();
            console.log("Moved to Channel: root");
        } else {
            var channel = connection.channelByName(newChannel);
            if (channel) {
                channel.join();
                console.log("Moved to Channel: " + newChannel);
            } else {
                sendMessage(connection, 'Channel ' + newChannel + ' not found');
            }
        }
    }
}, {
    identifier: 'printuserlist',
    minLength: 0, //how much additional information you need 
    action: function(connection) {
        sendMessage(connection, "User List Requested");

        var users = connection.users();
        var text = "";

        for (var i = 0; i < users.length; i++) {
            text += users[i].name + ', ';
        }

        sendMessage(connection, text);
    }
}, {
    identifier: 'msg',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString, keyArray, actor) {
        console.log("sending message to " + actor.name);
        sendMessage(connection, "Thanks for your request, " + actor.name, actor);
        sendMessage(connection, keyString);
    }
}, {
    identifier: 'scream',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        

        // if (keyArray.length >= 1) {
        //     var user = connection.userByName(keyArray[0]);
        //     if (user) {
        //         // user.inputStream()
        //         while (user.inputStream().write(scream)) { }
        //     } else {
        //         console.log('user ' + keyArray[0] + ' not found');
        //     }
        // } else {
        //     while (connection.inputStream().write(scream)) { }
        // }

        playSound(connection, 'scream.wav');
    }
}, {
    identifier: 'blackyeah',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        playSound(connection, 'blackYeah.wav');
    }
}];



var mumble = require('mumble');
var fs = require('fs');

var options = {
    key: fs.readFileSync( 'key.pem' ),
    cert: fs.readFileSync( 'crt.pem' )
}
/*

To generate certificates:
key: openssl pkcs12 -in MumbleCertificate.p12 -out key.pem -nocerts -nodes
cert: openssl pkcs12 -in MumbleCertificate.p12 -out crt.pem -clcerts -nokeys
*/


console.log( 'Connecting' );
mumble.connect( 'mumble://benhen.zzzz.io', options, function ( error, connection ) {
    if( error ) { throw new Error( error ); }

    console.log( 'Connected' );

    connection.authenticate( 'e' );

    //THiS CODE DOESN"T WORK FOR SOME REASON
    // for (var i = 0; i < oneWordCommands.length; i++) {

    //     var word = oneWordCommands[i][1];
    //     var identifier = oneWordCommands[i][0]

    //     console.log(word+'from ' + oneWordCommands[i][0]);
    //     var newItem = {
    //         identifier: identifier,
    //         minLength: 0, 
    //         action: function(connection, keyString, keyArray) {
    //             sendMessage(connection, word);
    //         }
    //     };

    //     commands.push(newItem);
    // };

    connection.on( 'initialized', function() {
        //gotta add that parameter
        onInit(connection);
    });
    connection.on( 'message', function(message, actor) {
        //gotta add that parameter again
        onMessage(connection, message, actor);

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
    messageStuff = messageText.split(' ');
    for (var i = 0; i < messageStuff.length; i++) {
        //convert to lower case to make easier to parse
        messageStuff[i] = messageStuff[i].toLowerCase();
    };

    //ignore message if it doesn't meet certain criteria
    if (!messageStuff || messageStuff.length === 0 
        || messageStuff[0].length === 1 || messageStuff[0].substring(0, 1) !== '!') return;

    //first word is the keyword (after the '!')
    var keyWord = messageStuff[0].substring(1);

    if (messageStuff.length > 0) {
        //take away command from beginning to make easier to parse
        messageText = messageText.substring(messageStuff[0].length+1);
    }

    var foundCommand = false;
    for (var i = 0; i < commands.length; i++) {
        var command = commands[i];
        //TODO: array identifiers
        //This looks for a command with a matching keyword
        if (command.identifier === keyWord) {
            console.log(command.identifier);
            //execture if found
            command.action(connection, messageText, messageStuff);
            foundCommand = true;
            break;
        }
    }
    if (!foundCommand) {
        sendMessage(connection, 'Command not found');
    }
};

var onVoice = function( event ) {
    console.log( 'Mixed voice' );

    var pcmData = voice.data;
}

var sendMessage = function(connection, message) {
    connection.user.channel.sendMessage(message);
}

var oneWordCommands = [
    ['hi', 'Hello!'],
    ['lenny', '( ͡° ͜ʖ ͡°)'],
    ['dong', 'ヽ༼ຈل͜ຈ༽ﾉ raise your dongers ヽ༼ຈل͜ຈ༽ﾉ']
];

var commands = [{
    identifier: 'hi',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, 'Hello!');
    }
}, {
    identifier: 'lenny',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, '( ͡° ͜ʖ ͡°)');
    }
}, {
    identifier: 'dong',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, 'ヽ༼ຈل͜ຈ༽ﾉ raise your dongers ヽ༼ຈل͜ຈ༽ﾉ');
    }
}, {
    identifier: 'hecomes',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, 'Ḫ̵͇Ẹ ̢̥̰̥̻̘̙̠C̺̙̠͠O̠̗M̺̭E̵S͖͓͜');
    }
}, {
    identifier: 'doge',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        var words = ['amaze', 'wow', 'such mumble', 'so bot', 'such auto'];
        sendMessage(connection, words[Math.floor(Math.random()*words.length)]);
    }
}, {
    identifier: 'meh',
    minLength: 0, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, '¯\\_(ツ)_/¯');
    }
}, {
    identifier: 'curse',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, 'Screw you, ' + keyString + '!');
    }
}, {
    identifier: 'flipthetable',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, '(╯°□°）╯︵ ┻━┻');
    }
}, {
    identifier: 'putitdown',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, '┬─┬ノ( º _ ºノ) chill out bro');
    }
}, {
    identifier: 'help',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, 'Here is a list of all commands:');

        var text = '';
        for (var i = 0; i < commands.length; i++) {
            text += commands[i].identifier + ', ';
        }

        sendMessage(connection, text);
    }
}, {
    identifier: 'move',
    minLength: 1, //how much additional information you need 
    action: function(connection, keyString, keyArray) {
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
    action: function(connection, keyString, keyArray) {
        sendMessage(connection, "User List Requested");

        var users = connection.users();
        var text = "";

        for (var i = 0; i < users.length; i++) {
            text += users[i].name + ', ';
        }

        sendMessage(connection, text);
    }
}]



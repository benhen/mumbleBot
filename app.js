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

        console.log( 'Connection initialized' );
        // Connection is authenticated and usable.

        var users = connection.users();
        console.log(JSON.stringify(users[0].name));
        for (var i = 0; i < users.length; i++) {
            console.log('Hi ' + users[i].name + '!');
        }

        setTimeout(function() {
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

    });
    connection.on( 'message', function(message, actor) {
        if (actor.name === 'e') {
            //don't respond to yourself
            return;
        }

        // console.log( 'Recieved Message' );
        // console.log(message);
        if (message.indexOf("!") === -1)
            return;

        var messageText = message.replace(/<\/?(p|i|b|br)\b[^<>]*>/g, '');
        messageStuff = messageText.split(' ');
        for (var i = 0; i < messageStuff.length; i++) {
            //convert to lower case to make easier to parse
            messageStuff[i] = messageStuff[i].toLowerCase();
        };


        if (!messageStuff || messageStuff.length === 0 
            || messageStuff[0].length === 1 || messageStuff[0].substring(0, 1) !== '!') return;
        // if (messageStuff.length < 1 && messageStuff[0].length > 1) return;
        // if (messageStuff[0].substring(0, 1) !== '!') return;

        var keyWord = messageStuff[0].substring(1);

        var foundCommand = false;
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            //TODO: array identifiers
            if (command.identifier === keyWord) {
                console.log(command.identifier);
                command.action(connection, messageText, messageStuff);
                foundCommand = true;
                break;
            }
        }
        if (!foundCommand) {
            sendMessage(connection, 'Command not found');
        }

        
        // Connection is authenticated and usable.
    });
    
    // var channel = connection.channelByName('Elliptical Madness');
    // connection.connection.joinPath(channel);
    // console.log(connection.connection.channels);
    // console.log(connection.connection.users);
    // connection.on( 'voice', onVoice );


    // connection.connection.sendMessage('UserList', 'HAHAHAH IT WORKED!');
});

var onInit = function() {
    console.log( 'Connection initialized' );
    // Connection is authenticated and usable.

};

var onMessage = function(message, actor) {
    console.log( 'Recieved Message' );
    console.log(JSON.stringify(message));
    console.log(actor);
    connection.user.channel.sendMessage('OHHHHHH EYYYYYAAYAAAAAHAHHAHAHAHH')
    // Connection is authenticated and usable.
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
        sendMessage(connection, 'Screw you, ' + keyString.substring(keyArray[0].length+1) + '!');
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
        var newChannel = keyString.substring(keyArray[0].length+1);
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



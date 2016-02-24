/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
          \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
           \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit is has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    },function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(',err);
        }
    });


    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Hello ' + user.name + '!!');
        } else {
            bot.reply(message,'Hello.');
        }
    });
});

controller.hears(['call me (.*)'],'direct_message,direct_mention,mention',function(bot, message) {
    var matches = message.text.match(/call me (.*)/i);
    var name = matches[1];
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['flip (.*)'], 'direct_message,direct_mention,mention',function(bot, message) {
    var matches = message.text.match(/flip (.*)/i);
    var text_to_flip = matches[1];
    var flipped_text = flipString(text_to_flip);
    bot.reply('I flipped ' + text_to_flip + ' to ' + flipped_text + '!');
});

controller.hears(['Is Sweeky poopy?'], 'direct_message,direct_mention,mention',function(bot, message) {
    bot.reply('Of course!');
});

controller.hears(['what is my name','who am i'],'direct_message,direct_mention,mention',function(bot, message) {

    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'Your name is ' + user.name);
        } else {
            bot.reply(message,'I don\'t know yet!');
        }
    });
});


controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.startConversation(message,function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime','identify yourself','who are you','what is your name'],'direct_message,direct_mention,mention',function(bot, message) {

    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());

    bot.reply(message,':robot_face: I am a bot named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + hostname + '.');

});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}


function flipString(aString) {
  aString = aString.toLowerCase();
  var last = aString.length - 1;
  var result = "";
  for (var i = last; i >= 0; --i) {
    result += flipChar(aString.charAt(i))
  }
  return result;
}


function flipChar(c) {
  if (c == 'a') {
    return '\u0250'
  }
  else if (c == 'b') {
    return 'q'
  }
  else if (c == 'c') {
    return '\u0254'  
  }
  else if (c == 'd') {
    return 'p'
  }
  else if (c == 'e') {
    return '\u01DD'
  }
  else if (c == 'f') {
    return '\u025F' 
  }
  else if (c == 'g') {
    return 'b'
  }
  else if (c == 'h') {
    return '\u0265'
  }
  else if (c == 'i') {
    return '\u0131'//'\u0131\u0323' 
  }
  else if (c == 'j') {
    return '\u0638'
  }
  else if (c == 'k') {
    return '\u029E'
  }
  else if (c == 'l') {
    return '1'
  }
  else if (c == 'm') {
    return '\u026F'
  }
  else if (c == 'n') {
    return 'u'
  }
  else if (c == 'o') {
    return 'o'
  }
  else if (c == 'p') {
    return 'd'
  }
  else if (c == 'q') {
    return 'b'
  }
  else if (c == 'r') {
    return '\u0279'
  }
  else if (c == 's') {
    return 's'
  }
  else if (c == 't') {
    return '\u0287'
  }
  else if (c == 'u') {
    return 'n'
  }
  else if (c == 'v') {
    return '\u028C'
  }
  else if (c == 'w') {
    return '\u028D'
  }
  else if (c == 'x') {
    return 'x'
  }
  else if (c == 'y') {
    return '\u028E'
  }
  else if (c == 'z') {
    return 'z'
  }
  else if (c == '[') {
    return ']'
  }
  else if (c == ']') {
    return '['
  }
  else if (c == '(') {
    return ')'
  }
  else if (c == ')') {
    return '('
  }
  else if (c == '{') {
    return '}'
  }
  else if (c == '}') {
    return '{'
  }
  else if (c == '?') {
    return '\u00BF'  
  }
  else if (c == '\u00BF') {
    return '?'
  }
  else if (c == '!') {
    return '\u00A1'
  }
  else if (c == "\'") {
    return ','
  }
  else if (c == ',') {
    return "\'"
  }
  return c;
}

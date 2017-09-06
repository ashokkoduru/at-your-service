'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');


const app = express();
const heroku_token = process.env.VERIFICATION_TOKEN;
const fb_token = process.env.FACEBOOK_ACCESS_TOKEN;

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));

// Process application/json
app.use(bodyParser.json());

//Initial route
app.get('/', function(req, res){
	res.send("Hello world, I am a chatbot")
});

// Privacy policy - facebook is Happy :)
app.get('/privacy', function(req, res){
    res.send('<h2 style="padding:20px;text-decoration:underline">At your Service</h2><p style="font-size: 18px; padding: 10px 20px">This application is built only for learning purposes and is not intended for any kind of commercial activity. We do not collect any kind of user\'s personal information at all. We honor user\'s privacy and do not track anything at all. It is not developed in order to attract anyone under 13.</p>')
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'blooming-forest-41719-ashok-koduru') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        console.log('Sender ID:' + sender);
        if (event.message && event.message.text) {
            let text = event.message.text.toLowerCase();
            console.log('Msg text: "' + text + '"');

            if ((text.indexOf('#plot') === 0 && text.indexOf('#plot ') !== 0) ||
                (text.indexOf('#suggest') === 0 && text.indexOf('#suggest ') !== 0) ||
                (text.indexOf('#starring') === 0 && text.indexOf('#starring ') !== 0) ||
                (text.indexOf('#meta') === 0 && text.indexOf('#meta ') !== 0)) {
                sendTextMessage(sender, "Something went wrong. You mistyped something it looks like!")
            } else if (text.indexOf('#plot ') === 0) {
                sendMoviePlot(sender, text.substring(text.indexOf(' ') + 1));
            } else if (text.indexOf('#suggest ') === 0) {
                sendMovieSuggestions(sender, text.substring(text.indexOf(' ') + 1));
            } else if (text.indexOf('#starring ') === 0) {
                sendPersonMoviesData(sender, text.substring(text.indexOf(' ') + 1));
            } else if (text.indexOf('#meta ') === 0) {
                sendMovieMetadata(sender, text.substring(text.indexOf(' ') + 1));
            } else {
                sendTextMessage(sender, changeTextNatural(text.substring(0, 319)));
            }
        } else if (event.postback && event.postback.payload) {
            sendTextMessage(sender, changeTextNatural(event.postback.payload));
        }
    }
    res.sendStatus(200);
});


function sendMovieMetadata(sender, text) {
    var options = {
        method: 'GET',
        url: 'http://api.themoviedb.org/3/search/movie',
        qs: {
            query: String(text),
            include_adult: true,
            language: 'en',
            api_key: TMDb_API_KEY
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            console.log(response);
            throw new Error(error);
        }
        var jsonbody = JSON.parse(body);
        if (jsonbody.total_results > 0) {
            let moviedata = jsonbody.results[0]
            let response = moviedata.title + "\n";

            if (moviedata.vote_average) {
                response += "Vote Average: " + moviedata.vote_average + " / 10\n";
            }

            if (moviedata.genre_ids && moviedata.genre_ids.length) {
                let genre_names = genres.reduce(function (arr, obj) {
                    if (moviedata.genre_ids.indexOf(obj.id) > -1) {
                        arr.push(obj.name)
                    }
                    return arr;
                }, [])
                if (genre_names) {
                    response += "Genre: " + genre_names.join(", ") + "\n"
                }
            }

            if (moviedata.release_date) {
                response += "Release Date: " + dateFormat(new Date(moviedata.release_date), "dddd, mmmm dS, yyyy")
            }
            sendTrailerButtonWithTextAndPoster(sender, moviedata, response);
        } else {
            sendTextMessage(sender, "Duh! Nothing found..");
        }
    });

}


// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});

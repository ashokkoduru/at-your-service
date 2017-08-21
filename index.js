'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));

// Process application/json
app.use(bodyParser.json());

//Initial route
app.get('/', function(req, res){
	res.send("Hello world, I am a chatbot - Ashok")
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


// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});

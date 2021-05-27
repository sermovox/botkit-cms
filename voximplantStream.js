require('dotenv').config()
var api = require(__dirname + '/src/api.js')()

if (!process.env.USERS) {
    throw new Error('Specify at least one username:password combo in the USERS environment variable')
}

var admin_creds = api.parseAdminUsers(process.env.USERS);



// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(admin_creds);

require(__dirname + '/components/routes/admin.js')(webserver, api);
require(__dirname + '/components/routes/api.js')(webserver, api);

webserver.get('/', function(req, res) {
    res.render('instructions',{layout: null});
});

// from voximplant : 

const app = require('express')();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({
    server: http
});

// Import the Google Cloud client library
const speech = require('@google-cloud/speech');

// Create a client
const client = new speech.SpeechClient();

const config = {
    encoding: 'MULAW',
    sampleRateHertz: 8000,
    languageCode: 'en-US',
};

const request = {
    config,
    interimResults: true,
};

let audioInput = [];
let recognizeStream = null;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

app.get('/', function(req, res) {
    res.send('<h1>Hello world</h1>');
});

wss.on('connection', (ws) => {
    // Create a writable stream
    var wstream = fs.createWriteStream('myBinaryFile');
    // Clear the current audioInput
    audioInput = [];
    // Initiate stream recognizing
    recognizeStream = client
        .streamingRecognize(request)
        .on('error', err => {
            ws.close();
        })
        .on('data', data => {
            ws.send(data.results[0].alternatives[0].transcript)
            process.stdout.write(
                data.results[0] && data.results[0].alternatives[0] ?
                `Transcription: ${data.results[0].alternatives[0].transcript}\n` :
                `\n\nError occurred, press Ctrl+C\n`
            )
        });

    ws.on('close', (message) => {
        console.log('The time limit for speech recognition has been reached. Please disconnect and call again.');
        wstream.end();
    })
    // Connection is up, let's add a simple event
    ws.on('message', (message) => {
        // Put base64 audio data to recognizeStream
        try {
            let data = JSON.parse(message)
            if (data.event == "media") {
                let b64data = data.media.payload;
                let buff = new Buffer.from(b64data, 'base64');
                recognizeStream.write(buff);
                wstream.write(buff);
            }
        } catch (err) {
            console.log(message)
        }
    });
    // Send a notification  
    ws.send('Hi there, I am a WebSocket server');
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

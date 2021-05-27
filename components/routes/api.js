module.exports = function(webserver, api) {

    var allowed_tokens = process.env.TOKENS ? process.env.TOKENS.split(/\s+/) : [];

    if (!allowed_tokens.length) {
        throw new Error('Define at least one API access token in the TOKENS environment variable');
    }

    if (allowed_tokens && allowed_tokens.length) {
        // require an access token
        webserver.use(function(req, res, next) {

            if (req.url.match(/^\/api\//)) {
                if (!req.query.access_token) {
                    res.status(403);
                    res.send('Access denied');
                } else {

                    // test access_token against allowed tokens
                    if (allowed_tokens.indexOf(req.query.access_token) >= 0) {
                        next();
                    } else {
                        res.status(403);
                        res.send('Invalid access token');
                    }
                }
            } else {
                next();
            }
        })
    }


    /* define the bot-facing API  just an example to delete  */
    // receives: triggers, user
    webserver.post('/api/v1/commands/triggers', function(req, res) {
        // look for triggers
        api.evaluateTriggers(req.body.triggers).then(function(results) {
            results.id = results.command;
            res.json(results);
        }).catch(function() {
            res.json({});
        })

    });

    // receives: command, user
    webserver.post('/api/v1/commands/name', function(req, res) {
        api.getScript(req.body.command).then(function(script) {
            res.json(script);
        }).catch(function(err) {
            if (err) {
                console.error('Error in getScript',err);
            }
            res.json({});
        })
    });

    // receives: command, user
    webserver.post('/api/v1/commands/id', function(req, res) {
        api.getScriptById(req.body.id).then(function(script) {
            res.json(script);
        }).catch(function(err) {
            if (err) {
                console.error('Error in getScript',err);
            }
            res.json({});
        })
    });


    // receives: command, user
    webserver.get('/api/v1/commands/list', function(req, res) {
        api.getScripts(req.query.tag).then(function(scripts) {
            res.json(scripts);
        }).catch(function(err) {
            if (err) {
                console.error('Error in getScripts',err);
            }
            res.json({});
        })
    });


    webserver.get('/api/v2/bots/identify', function(req, res) {
        res.json({
            name: process.env.BOT_NAME || 'Botkit Bot',
            platforms: [{type:(process.env.PLATFORM || 'web')}]
        })
    });


    // receives: command, user
    webserver.post('/api/v1/stats', function(req, res) {

        res.json({});

    });
// /* define the bot-facing API 

// start here :
    // receives: datefrom,dateto,serviceId,performerId,qty
    
    webserver.post('/api/getstarttimematrix', function(req, res) {
        api.poststarttimematrix(req.body.datefrom,req.body.dateto,req.body.serviceId,req.body.performerId,req.body.qty).then(function(script) {
            res.json(script);
         // res.json({data:'ciao'});
        }).catch(function(err) {
            if (err) {
                console.error('Error in getScript',err);
            }
            res.json({});
        })
    });
    webserver.get('/api/getstarttimematrix', function(req, res) {
        api.poststarttimematrix(req.query.datefrom,req.query.dateto,req.query.serviceId,req.query.performerId,req.query.qty).then(function(script) {
            res.json(script);
         // res.json({data:'ciao'});
        }).catch(function(err) {
            if (err) {
                console.error('Error in getScript',err);
            }
            res.json({});
        })
    });
    webserver.get('/api/geteventlist', function(req, res) {
        api.geteventlist().then(function(script) {
            res.json(script);
         // res.json({data:'ciao'});
        }).catch(function(err) {
            if (err) {
                console.error('Error in getScript',err);
            }
            res.json({});
        })
    });
    webserver.get('/api/getunitlist', function(req, res) {
        api.getunitlist().then(function(script) {
            res.json(script);
         // res.json({data:'ciao'});
        }).catch(function(err) {
            if (err) {
                console.error('Error in getScript',err);
            }
            res.json({});
        })
    });

}

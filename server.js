/*********************************************************************************
*  WEB422 – Assignment 3
*
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Aidan Tarachan Student ID: 102673233 Date: 2026-04-06
*
*  Vercel API (Deployed) Link: _____________________________________________________
*
********************************************************************************/ 

const express = require('express');
const path = require('path');
const app = express();
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');
dotenv.config();

const HTTP_PORT = process.env.PORT || 8080;

const cors = require('cors');

app.use(express.json());
app.use(cors());

const dataService = require("./data-service.js"); 

app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, "index.html"));

    res.json({message: 'A3 - Secured API Listening', 
        term: 'Winter 2026', 
        student: 'Aidan Tarachan',
        learnID: 'atarachan'
    });
});

app.post('/api/sites', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const site = await dataService.addNewSite(req.body);
        res.status(201).json(site);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});

app.get('/api/sites', async (req, res) => {
    try {
        const sites = await dataService.getAllSites(Number(req.query.page), 
            Number(req.query.perPage), req.query.name, 
            req.query.description, Number(req.query.year), 
            req.query.town, req.query.provinceOrTerritoryCode);
        
        res.status(200).json(sites);
    }
    catch(err){
        res.status(400).json({message: err.message});
    }
});

app.get('/api/sites/:id', async (req, res) => {
    try {
        const site = await dataService.getSiteById(req.params.id);
        res.status(200).json(site);
    }
    catch(err){
        res.status(404).json({message: 'Site not found.'});
    }
});

app.put('/api/sites/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const site = await dataService.updateSiteById(req.body, req.params.id);

        res.status(204).json(site);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});

app.delete('/api/sites/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const site = await dataService.deleteSiteById(req.params.id);
        res.status(200).json({message: `deleted item with identifier ${req.params.id}`});
    }
    catch(err){
        res.status(404).json({message: "Site not found."});
    }
});

app.post("/api/user/register", (req, res) => {
    dataService.registerUser(req.body)
    .then((msg) => {
        res.json({ "message": msg });
    }).catch((msg) => {
        res.status(422).json({ "message": msg });
    });
});

app.post("/api/user/login", (req, res) => {
    dataService.checkUser(req.body)
    .then((user) => {
        const payload = {
            _id  : user._id,
            userName: user.userName,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.json({
            message: 'login successful',
            token: token, 
        });
    }).catch(msg => {
        res.status(422).json({ "message": msg });
    });
});

app.get("/api/user/favourites", passport.authenticate('jwt', { session: false }), (req, res) => {
    dataService.getFavourites(req.user._id)
    .then(data => {
        res.json(data);
    }).catch(msg => {
        res.status(422).json({ error: msg });
    })

});

app.put("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    dataService.addFavourite(req.user._id, req.params.id)
    .then(data => {
        res.json(data)
    }).catch(msg => {
        res.status(422).json({ error: msg });
    })
});

app.delete("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    dataService.removeFavourite(req.user._id, req.params.id)
    .then(data => {
        res.json(data)
    }).catch(msg => {
        res.status(422).json({ error: msg });
    })
});

// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

// Configure its options
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: process.env.JWT_SECRET,
};

// IMPORTANT - this secret should be a long, unguessable string
// (ideally stored in a "protected storage" area on the web server).
// We suggest that you generate a random 50-character string
// using the following online tool:
// https://lastpass.com/generatepassword.php

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log('payload received', jwt_payload);

  if (jwt_payload) {
    // The following will ensure that all routes using
    // passport.authenticate have a req.user._id, req.user.userName, req.user.fullName & req.user.role values
    // that matches the request payload data
    next(null, {
      _id: jwt_payload._id,
      userName: jwt_payload.userName,
    });
  } else {
    next(null, false);
  }
});

// tell passport to use our "strategy"
passport.use(strategy);

// add passport as application-level middleware
app.use(passport.initialize());

app.use((req, res) => {
    res.status(404).send('Route not found.');
});

dataService.initialize().then(()=>{
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});
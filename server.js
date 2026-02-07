const express = require('express');
const path = require('path');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const cors = require('cors');
require('dotenv').config();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({message: 'API Listening', 
        term: 'Winter 2026', 
        student: 'Aidan Tarachan',
        learnID: 'atarachan'
    });
});

app.listen(HTTP_PORT, () => {
    console.log('Ready to handle requests on port ' + HTTP_PORT);
});
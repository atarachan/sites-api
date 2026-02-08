const express = require('express');
const path = require('path');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const cors = require('cors');
require('dotenv').config();

app.use(express.json());
app.use(cors());

const dataService = require("./data-service.js"); 

app.get('/', (req, res) => {
    res.json({message: 'API Listening', 
        term: 'Winter 2026', 
        student: 'Aidan Tarachan',
        learnID: 'atarachan'
    });
});

app.post('/api/sites', async (req, res) => {
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

app.put('/api/sites/:id', async (req, res) => {
    try {
        const site = await dataService.updateSiteById(req.body, req.params.id);

        res.status(204).json(site);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
});

app.delete('/api/sites/:id', async (req, res) => {
    try {
        const site = await dataService.deleteSiteById(req.params.id);
        res.status(200).json({message: `deleted item with identifier ${req.params.id}`});
    }
    catch(err){
        res.status(404).json({message: "Site not found."});
    }
});

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
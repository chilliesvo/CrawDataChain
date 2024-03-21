const express = require('express');
const hbs = require('hbs');
const path = require('path');
const fs = require('fs');
const config = require('./config/index');
const logger = require('./utils/logger/index');
const app = express();
const logger_request_middleware = require('./middlewares/logger_request');
const bodyparser = require('body-parser');
//Setup middleware
hbs.registerPartials(__dirname + '/views/partials') // partials view
app.set('view engine', 'hbs'); // engine view

app.use(logger_request_middleware);
app.use(bodyparser.urlencoded());
app.use(bodyparser.json());

app.use(express.static(__dirname + '/public')); // public

hbs.registerHelper('getCurrentYear', () => { //ViewHelper
    return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => { //ViewHelper
    return text.toUpperCase();
});
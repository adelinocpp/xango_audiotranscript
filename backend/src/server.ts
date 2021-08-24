import express from "express";
import { Request, Response } from "express";
import { urlencoded } from "body-parser";
import cors from "cors";
import path from "path";
require("dotenv").config();
//import { serve } from "swagger-ui-express";

var http = require('http');
// DONE: implementar o HTTPS
// TODO: registrar TODAS AS REQUISIÇÕES DE ROUTES do usuário na tabela de LOG 
// TODO: ajustar diretorio para salvamento de arquivos

// --- SEQUENCIA PARA HTTPS ---------------------------------------------------
var fs = require('fs');
var https = require('https');

var privateKey = fs.readFileSync(path.resolve(__dirname, "./sslcert/server.key"),'utf8');
var certificate = fs.readFileSync(path.resolve(__dirname, "./sslcert/server.crt"),'utf8');
var credentials = {key: privateKey, cert: certificate};
// ----------------------------------------------------------------------------

var app = express();
// app.all('*', ensureSecure); // Redireciona HTTP -> HTTPS 
app.use(urlencoded({ extended: true, limit: '200mb' }));
app.use(express.json({limit: '200mb'}));
app.use(cors({ credentials: true, origin: true }));
app.use(require("./routes"));
app.set('trust proxy', true);

console.log("Listen http port:",process.env.HTTP_PORT);
console.log("Listen https port:",process.env.HTTPS_PORT);
// var httpServer = http.createServer(app).listen(process.env.HTTP_PORT);
// var httpsServer = https.createServer(credentials, app).listen(process.env.HTTPS_PORT);
http.createServer(app).listen(process.env.HTTP_PORT);
// https.createServer(credentials, app).listen(process.env.HTTPS_PORT);

// --- Redireciona HTTP -> HTTPS ----------------------------------------------
function ensureSecure(req: Request, res: Response, next: () => any){
    if(req.secure)
      return next(); // OK, continue
    console.log("ensureSecure: ",req.hostname, req.url);
    // res.redirect('https://' + req.hostname + req.url); // express 4.x
    res.redirect('https://' + req.hostname + ":" + process.env.HTTPS_PORT + req.url);
}

// ----------------------------------------------------------------------------
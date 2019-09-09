const fs = require("fs");
const pdf = require('pdf-parse');
const XPSinacor = require('./XPSinacor');

let dataBuffer = fs.readFileSync('./fixtures/corretagem.pdf');

pdf(dataBuffer).then(function(data) {
 
    let nota = new XPSinacor(data.text);
    let negotiations = nota.negotiations();
    
    negotiations.forEach(line => {
        console.log(nota.negotiation(line));
    });   
});




# SINACOR-client-reader

Interpretador do padrão SINACOR com leitura através do PDF contendo todas as notas de corretagem.

# Utilização

Listar as negociações de uma nota de corretagem:

```
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
```

const fs = require('fs');
const XPSinacor = require('./XPSinacor');
const fixtureDerivatives = fs.readFileSync('./fixtures/sinacor-op-derivativos.txt', "utf8" );
const fixtureStocks = fs.readFileSync('./fixtures/sinacor-stocks.txt', "utf8" );
const fullClientFile = fs.readFileSync('./fixtures/client-full-sinacor-file.txt', "utf8" );

describe('#constructor', () => {
  const lineExample = "first line\nsecond line";

  it('coverts content into data array', () => {
    expect(typeof new XPSinacor(lineExample).data).toEqual('object');
  });

  it('expect to have raw string', () => {
    expect(typeof new XPSinacor(lineExample).raw).toEqual('string');
  });

  it('coverts content into data array of lines', () => {
    expect(new XPSinacor(lineExample).data[0]).toEqual('first line');
    expect(new XPSinacor(lineExample).data[1]).toEqual('second line');
  });
});

describe('#clearingTotal', () => {
  const sinacorFileDerivatives = new XPSinacor(fixtureDerivatives);
  const sinacorFileStocks = new XPSinacor(fixtureStocks);

  it('expect to be a number', () => {
    expect(typeof sinacorFileDerivatives.clearingTotal()).toEqual('number');
  })

  it('expect to return 308.53~ using fixture file', () => {
    expect(sinacorFileDerivatives.clearingTotal()).toEqual(308.53999999999996);
  })

  it('expect to be a number', () => {
    expect(typeof sinacorFileStocks.clearingTotal()).toEqual('number');
  })

  it('expect to return 18.9 using different fixture file', () => {
    expect(sinacorFileStocks.clearingTotal()).toEqual(18.9);
  })
})

describe('#totalOrders', () => {
  it('expect to return the amount or orders in the file', () => {
    const sinacorFile = new XPSinacor(fullClientFile);
    expect(sinacorFile.totalOrders()).toEqual(29);

    let lessOne = `${fullClientFile}`.split('\n')
    lessOne.shift();
    const content = lessOne.reduce((acc, line) => `${acc}\n${line}`, '');

    const sinacorFile2 = new XPSinacor(content);
    expect(sinacorFile2.totalOrders()).toEqual(28);
  })
});

describe('#clientCPF', () => {
  it('expect to return the first cpf in file', () => {
    const sinacorFile = new XPSinacor(fullClientFile);
    expect(sinacorFile.clientCPF()).toEqual('884.465.220-04');
  })
});

describe('#clientId', () => {
  it('expect to return the first Client XP id', () => {
    const sinacorFile = new XPSinacor(fullClientFile);
    expect(sinacorFile.clientId()).toEqual('7865435');
  })
});

describe('#negotiations', () => {
  it('expect to return the total negotiations', () => {
    const sinacorFile = new XPSinacor(fullClientFile);
    expect(sinacorFile.negotiations().length).toEqual(141);
  })
});

describe('#negotiation', () => {
  it('expect to return the object of a negotiation', () => {
    const sinacorFile = new XPSinacor(fullClientFile);

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA06/18BBASR68          ON 26,99      BBASE FM1.2001,111.332,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '06/18',
      product: 'BBASR68',
      strikeAt: '26,99',
      quantity: '1.200',
      totalPerUnit: '1,11',
      total: '1.332,00',
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA06/18CSNAR82          ON 8,20      CSNAE FM4.0000,351.400,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '06/18',
      product: 'CSNAR82',
      strikeAt: '8,20',
      quantity: '4.000',
      totalPerUnit: '0,35',
      total: '1.400,00',
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA06/18PETRR96          PN 15,46      PETRE FM2.0000,731.460,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '06/18',
      product: 'PETRR96',
      strikeAt: '15,46',
      quantity: '2.000',
      totalPerUnit: '0,73',
      total: '1.460,00',
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA06/18PETRR96          PN 15,46      PETRE FM1000,7373,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '06/18',
      product: 'PETRR96',
      strikeAt: '15,46',
      quantity: '100',
      totalPerUnit: '0,73',
      total: '73,00',
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA10/18BBASV11          ON 29,48      BBASE3.0002,266.780,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '10/18',
      product: 'BBASV11',
      strikeAt: '29,48',
      quantity: '3.000',
      totalPerUnit: '2,26',
      total: '6.780,00',
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA10/18PETRV197          PN 19,67      PETRE4.4001,586.952,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '10/18',
      product: 'PETRV197',
      strikeAt: '19,67',
      quantity: '4.400',
      totalPerUnit: '1,58',
      total: '6.952,00',
      debitCredit: 'C',
    });


    // EXERC OPC VENDA
    expect(sinacorFile.negotiation('1-BOVESPACEXERC OPC VENDA06/18BBASE /EJ          ON 26,921.20026,9232.304,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'EXERC OPC VENDA',
      dueDate: '06/18',
      product: 'BBASE',
      strikeAt: '26,92',
      quantity: '1.200',
      totalPerUnit: '26,92',
      total: '32.304,00',
      debitCredit: 'D',
    });

    expect(sinacorFile.negotiation('1-BOVESPACEXERC OPC VENDA06/18CSNAE          ON 8,20#4.0008,2032.800,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'EXERC OPC VENDA',
      dueDate: '06/18',
      product: 'CSNAE',
      strikeAt: '8,20',
      quantity: '4.000',
      totalPerUnit: '8,20',
      total: '32.800,00',
      debitCredit: 'D',
    });

    expect(sinacorFile.negotiation('1-BOVESPACEXERC OPC VENDA06/18PETRE          PN 15,462.10015,4632.466,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'EXERC OPC VENDA',
      dueDate: '06/18',
      product: 'PETRE',
      strikeAt: '15,46',
      quantity: '2.100',
      totalPerUnit: '15,46',
      total: '32.466,00',
      debitCredit: 'D',
    });
  })
});

describe("#getNegotiationNumbers", () => {
  it('should return the correct amounts',() => {
    const sinacorFile = new XPSinacor(fullClientFile);

    // OPCAO DE VENDA
    expect(sinacorFile.negotiationNumbers('1.2001,111.332,00')).toEqual({
      totalPerUnit: '1,11',
      quantity: '1.200',
      total: '1.332,00',
    });

    expect(sinacorFile.negotiationNumbers('2.7007,6520.655,00')).toEqual({
      totalPerUnit: '7,65',
      quantity: '2.700',
      total: '20.655,00',
    });

    expect(sinacorFile.negotiationNumbers('4.0000,351.400,00')).toEqual({
      totalPerUnit: '0,35',
      quantity: '4.000',
      total: '1.400,00',
    });

    expect(sinacorFile.negotiationNumbers('6.00017,73106.380,00')).toEqual({
      totalPerUnit: '17,73',
      quantity: '6.000',
      total: '106.380,00',
    });

    expect(sinacorFile.negotiationNumbers('1.20027,4832.976,00')).toEqual({
      totalPerUnit: '27,48',
      quantity: '1.200',
      total: '32.976,00',
    });

    expect(sinacorFile.negotiationNumbers('10.0000,242.400,00')).toEqual({
      totalPerUnit: '0,24',
      quantity: '10.000',
      total: '2.400,00',
    });
  });
})

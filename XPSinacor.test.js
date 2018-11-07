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
      quantity: 1200,
      totalPerUnit: 1.11,
      total: 1332,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA06/18CSNAR82          ON 8,20      CSNAE FM4.0000,351.400,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '06/18',
      product: 'CSNAR82',
      strikeAt: '8,20',
      quantity: 4000,
      totalPerUnit: 0.35,
      total: 1400,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA06/18PETRR96          PN 15,46      PETRE FM2.0000,731.460,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '06/18',
      product: 'PETRR96',
      strikeAt: '15,46',
      quantity: 2000,
      totalPerUnit: 0.73,
      total: 1460,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA06/18PETRR96          PN 15,46      PETRE FM1000,7373,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '06/18',
      product: 'PETRR96',
      strikeAt: '15,46',
      quantity: 100,
      totalPerUnit: 0.73,
      total: 73,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA10/18BBASV11          ON 29,48      BBASE3.0002,266.780,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '10/18',
      product: 'BBASV11',
      strikeAt: '29,48',
      quantity: 3000,
      totalPerUnit: 2.26,
      total: 6780,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE VENDA10/18PETRV197          PN 19,67      PETRE4.4001,586.952,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE VENDA',
      dueDate: '10/18',
      product: 'PETRV197',
      strikeAt: '19,67',
      quantity: 4400,
      totalPerUnit: 1.58,
      total: 6952,
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
      quantity: 1200,
      totalPerUnit: 26.92,
      total: 32304,
      debitCredit: 'D',
    });

    expect(sinacorFile.negotiation('1-BOVESPACEXERC OPC VENDA06/18CSNAE          ON 8,20#4.0008,2032.800,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'EXERC OPC VENDA',
      dueDate: '06/18',
      product: 'CSNAE',
      strikeAt: '8,20',
      quantity: 4000,
      totalPerUnit: 8.20,
      total: 32800,
      debitCredit: 'D',
    });

    expect(sinacorFile.negotiation('1-BOVESPACEXERC OPC VENDA06/18PETRE          PN 15,462.10015,4632.466,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'EXERC OPC VENDA',
      dueDate: '06/18',
      product: 'PETRE',
      strikeAt: '15,46',
      quantity: 2100,
      totalPerUnit: 15.46,
      total: 32466,
      debitCredit: 'D',
    });

    // VISTA - ACOES
    expect(sinacorFile.negotiation('1-BOVESPAVVISTASID NACIONAL          ON1.9007,8614.934,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'VISTA',
      dueDate: null,
      product: 'SID NACIONAL',
      strikeAt: null,
      quantity: 1900,
      totalPerUnit: 7.86,
      total: 14934,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVVISTASID NACIONAL          ON1007,86786,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'VISTA',
      dueDate: null,
      product: 'SID NACIONAL',
      strikeAt: null,
      quantity: 100,
      totalPerUnit: 7.86,
      total: 786,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVVISTAPETROBRAS          PN N26.00018,30109.800,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'VISTA',
      dueDate: null,
      product: 'PETROBRAS',
      strikeAt: null,
      quantity: 6000,
      totalPerUnit: 18.30,
      total: 109800,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVVISTAPETROBRAS          PN N22.10015,9233.432,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'VISTA',
      dueDate: null,
      product: 'PETROBRAS',
      strikeAt: null,
      quantity: 2100,
      totalPerUnit: 15.92,
      total: 33432,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPACVISTAUSIMINAS          PNA N117.5008,00140.000,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'VISTA',
      dueDate: null,
      product: 'USIMINAS',
      strikeAt: null,
      quantity: 17500,
      totalPerUnit: 8,
      total: 140000,
      debitCredit: 'D',
    });

    expect(sinacorFile.negotiation('1-BOVESPACVISTASID NACIONAL          ON ED5.9008,3849.442,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'VISTA',
      dueDate: null,
      product: 'SID NACIONAL',
      strikeAt: null,
      quantity: 5900,
      totalPerUnit: 8.38,
      total: 49442,
      debitCredit: 'D',
    });

    expect(sinacorFile.negotiation('1-BOVESPACVISTASID NACIONAL          ON ED1008,38838,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'VISTA',
      dueDate: null,
      product: 'SID NACIONAL',
      strikeAt: null,
      quantity: 100,
      totalPerUnit: 8.38,
      total: 838,
      debitCredit: 'D',
    });

    expect(sinacorFile.negotiation('1-BOVESPACVISTASID NACIONAL          ON#3.2007,6524.480,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'VISTA',
      dueDate: null,
      product: 'SID NACIONAL',
      strikeAt: null,
      quantity: 3200,
      totalPerUnit: 7.65,
      total: 24480,
      debitCredit: 'D',
    });

    // OPCAO DE COMPRA
    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE COMPRA07/18BBASG275          ON 27,48      BBAS FM1.2001,151.380,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE COMPRA',
      dueDate: '07/18',
      product: 'BBASG275',
      strikeAt: '27,48',
      quantity: 1200,
      totalPerUnit: 1.15,
      total: 1380,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE COMPRA08/18CSNAH82          ON 8,20      CSNA FM22.5000,409.000,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE COMPRA',
      dueDate: '08/18',
      product: 'CSNAH82',
      strikeAt: '8,20',
      quantity: 22500,
      totalPerUnit: 0.40,
      total: 9000,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVOPCAO DE COMPRA09/18CSNAI98          ON 9,80      CSNA30.0000,267.800,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'OPCAO DE COMPRA',
      dueDate: '09/18',
      product: 'CSNAI98',
      strikeAt: '9,80',
      quantity: 30000,
      totalPerUnit: 0.26,
      total: 7800,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPACOPCAO DE COMPRA08/18VALEH586          ON 58,22      VALEE6.2000,281.736,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'OPCAO DE COMPRA',
      dueDate: '08/18',
      product: 'VALEH586',
      strikeAt: '58,22',
      quantity: 6200,
      totalPerUnit: 0.28,
      total: 1736,
      debitCredit: 'D',
    });

    // VISTA PLUS
    expect(sinacorFile.negotiation('1-BOVESPAVVISTAUSIMINAS          PNA N1D4008,003.200,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'VISTA',
      dueDate: null,
      product: 'USIMINAS',
      strikeAt: null,
      quantity: 400,
      totalPerUnit: 8,
      total: 3200,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPAVVISTAUSIMINAS          PNA N1#2.6008,2521.450,00C')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'sell',
      marketType: 'VISTA',
      dueDate: null,
      product: 'USIMINAS',
      strikeAt: null,
      quantity: 2600,
      totalPerUnit: 8.25,
      total: 21450,
      debitCredit: 'C',
    });

    expect(sinacorFile.negotiation('1-BOVESPACVISTAUSIMINAS          PNA N1D12.8007,7599.200,00D')).toEqual({
      negotiation: '1-BOVESPA',
      type: 'buy',
      marketType: 'VISTA',
      dueDate: null,
      product: 'USIMINAS',
      strikeAt: null,
      quantity: 12800,
      totalPerUnit: 7.75,
      total: 99200,
      debitCredit: 'D',
    });
  });
});

describe("#getNegotiationNumbers", () => {
  it('should return the correct amounts',() => {
    const sinacorFile = new XPSinacor(fullClientFile);

    // OPCAO DE VENDA
    expect(sinacorFile.negotiationNumbers('1.2001,111.332,00')).toEqual({
      totalPerUnit: 1.11,
      quantity: 1200,
      total: 1332,
    });

    expect(sinacorFile.negotiationNumbers('2.7007,6520.655,00')).toEqual({
      totalPerUnit: 7.65,
      quantity: 2700,
      total: 20655,
    });

    expect(sinacorFile.negotiationNumbers('4.0000,351.400,00')).toEqual({
      totalPerUnit: 0.35,
      quantity: 4000,
      total: 1400,
    });

    expect(sinacorFile.negotiationNumbers('6.00017,73106.380,00')).toEqual({
      totalPerUnit: 17.73,
      quantity: 6000,
      total: 106380,
    });

    expect(sinacorFile.negotiationNumbers('1.20027,4832.976,00')).toEqual({
      totalPerUnit: 27.48,
      quantity: 1200,
      total: 32976,
    });

    expect(sinacorFile.negotiationNumbers('10.0000,242.400,00')).toEqual({
      totalPerUnit: 0.24,
      quantity: 10000,
      total: 2400,
    });

    expect(sinacorFile.negotiationNumbers('1.8607,7014.322,00')).toEqual({
      totalPerUnit: 7.7,
      quantity: 1860,
      total: 14322,
    });

    // Crazy
    /*
      BBASE FM1.2001,111.332,00
      CSNAE FM4.0000,351.400,00
      PETRE FM2.0000,731.460,00
      PETRE FM1000,7373,00
      BBASE3.0002,266.780,00
      PETRE4.4001,586.952,00
      1.20026,9232.304,00
      #4.0008,2032.800,00
      2.10015,4632.466,00
      1007,86786,00
    */

    expect(sinacorFile.negotiationNumbers('5108,45542,25')).toEqual({
      totalPerUnit: 108.45,
      quantity: 5,
      total: 542.25,
    });

    expect(sinacorFile.negotiationNumbers('N6.00018,30109.800,00')).toEqual({
      totalPerUnit: 18.30,
      quantity: 6000,
      total: 109800,
    });

    expect(sinacorFile.negotiationNumbers('N26.00018,30109.800,00')).toEqual({
      totalPerUnit: 18.30,
      quantity: 6000,
      total: 109800,
    });

    expect(sinacorFile.negotiationNumbers('1.9007,8614.934,00')).toEqual({
      totalPerUnit: 7.86,
      quantity: 1900,
      total: 14934,
    });

    expect(sinacorFile.negotiationNumbers('1007,86786,00')).toEqual({
      totalPerUnit: 7.86,
      quantity: 100,
      total: 786,
    });

    expect(sinacorFile.negotiationNumbers('#1007,86786,00')).toEqual({
      totalPerUnit: 7.86,
      quantity: 100,
      total: 786,
    });

    expect(sinacorFile.negotiationNumbers('##########$$$$$$$2221007,86786,00')).toEqual({
      totalPerUnit: 7.86,
      quantity: 100,
      total: 786,
    });

    expect(sinacorFile.negotiationNumbers('N1D4008,003.200,00')).toEqual({
      totalPerUnit: 8.00,
      quantity: 400,
      total: 3200,
    });

    expect(sinacorFile.negotiationNumbers('N1D12.8007,7599.200,00')).toEqual({
      totalPerUnit: 7.75,
      quantity: 12800,
      total: 99200,
    });

    expect(sinacorFile.negotiationNumbers('PNA N1D1007,86786,00')).toEqual({
      totalPerUnit: 7.86,
      quantity: 100,
      total: 786,
    });
  });
})

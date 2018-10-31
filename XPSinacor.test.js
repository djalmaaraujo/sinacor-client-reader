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

describe('#getClientCPF', () => {
  it('expect to return the first cpf in file', () => {
    const sinacorFile = new XPSinacor(fullClientFile);
    expect(sinacorFile.getClientCPF()).toEqual('884.465.220-04');
  })
});

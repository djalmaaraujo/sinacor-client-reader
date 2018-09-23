const fs = require('fs');
const XPSinacor = require('./XPSinacor');
const fixtureDerivatives = fs.readFileSync('./fixtures/sinacor-op-derivativos.txt', "utf8" );
const fixtureStocks = fs.readFileSync('./fixtures/sinacor-stocks.txt', "utf8" );


describe('#constructor', () => {
  const lineExample = "first line\nsecond line";

  it('coverts content into data array', () => {
    expect(typeof new XPSinacor(lineExample).data).toEqual('object');
  });

  it('coverts content into data array of lines', () => {
    expect(new XPSinacor(lineExample).data[0]).toEqual('first line');
    expect(new XPSinacor(lineExample).data[1]).toEqual('second line');
  });
});

describe('#corretagemTotal', () => {
  const sinacorFileDerivatives = new XPSinacor(fixtureDerivatives);
  const sinacorFileStocks = new XPSinacor(fixtureStocks);

  it('expect to be a number', () => {
    expect(typeof sinacorFileDerivatives.corretagemTotal()).toEqual('number');
  })

  it('expect to return 308.53~ using fixture file', () => {
    expect(sinacorFileDerivatives.corretagemTotal()).toEqual(308.53999999999996);
  })

  it('expect to be a number', () => {
    expect(typeof sinacorFileStocks.corretagemTotal()).toEqual('number');
  })

  it('expect to return 308.53~ using fixture file', () => {
    expect(sinacorFileStocks.corretagemTotal()).toEqual(18.9);
  })
})
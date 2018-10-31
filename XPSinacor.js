module.exports = class XPSinacor {
  constructor(fileString) {
    this.data = fileString.split("\n");
    this.raw = fileString;
  }

  clearingTotal() {
    const str = 'ClearingD';
    const lines = [ ...this.data.filter((line) => line.indexOf(str) > -1) ];
    const amount = lines.reduce((acc, item) => {
      return acc + parseFloat(item.replace(str, '').replace(',','.'))
    }, 0);

    return amount;
  }

  totalOrders() {
    return this.raw.match(/Negócios realizados/g).length;
  }
}

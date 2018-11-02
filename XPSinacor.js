const MARKET_TYPES = [
  'OPCAO DE VENDA',
  'EXERC OPC VENDA',
  'VISTA',
  'OPCAO DE COMPRA',
  'TERMO',
];

const MARKET_TYPES_REGEX = [
  /([A-Z]{1})OPCAO DE VENDA(\d{2}\/\d{2})(\w+)(.*)([A-Z]{2}) (\d+,+[0-9]{2})(.*)([A-Z]{1})/,
  /([A-Z]{1})EXERC OPC VENDA(\d{2}\/\d{2})(\w+)(.*)([A-Z]{2}) (\d+,+[0-9]{2})(.*)([A-Z]{1})/,
  /([A-Z]{1})VISTA([\w ]*)([A-Z]{2})(.*)([A-Z]{1})/, // https://regex101.com/r/1KwBWJ/1
  /([A-Z]{1})OPCAO DE COMPRA(\d{2}\/\d{2})(\w+)(.*)([A-Z]{2}) (\d+,+[0-9]{2})(.*)([A-Z]{1})/,
  '222323232'
]

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

  clientCPF() {
    const CPF_REGEX = /\d{3}\.\d{3}\.\d{3}-\d{2}/gm;

    return this.raw.match(CPF_REGEX)[0];
  }

  clientId() {
    const CLIENT_ID_REGEX = /^Cliente([0-9]+)/gm;

    return this.raw.match(CLIENT_ID_REGEX)[0].replace('Cliente', '');
  }

  negotiations() {
    return this.data.filter(line => line.startsWith('1-BOVESPA'))
  }

  negotiation(line) {
    const negotiation = '1-BOVESPA';
    const rawLine = line.substring(negotiation.length);
    const marketType = MARKET_TYPES.find((mkt) => rawLine.includes(mkt));
    const indexOfMarketType = MARKET_TYPES.indexOf(marketType);
    const values = rawLine.match(MARKET_TYPES_REGEX[indexOfMarketType]);

    // Cleanup array
    values.shift();
    delete values.index;
    delete values.input;

    const negotiationNumbers = this.negotiationNumbers(values[values.length - 2].trim());
    const quantity = Math.round(negotiationNumbers.total / negotiationNumbers.totalPerUnit);
    const type = (values[0] === 'V') ? 'sell' : 'buy';
    let result = {};

    switch (marketType) {
      case 'VISTA':
        result = this.negotiationVista(values, negotiationNumbers);
        break;

      default:
        result = this.negotiationDefault(values, negotiationNumbers);
    }

    const defaultParams = {
      negotiation,
      quantity,
      type,
      marketType
    };

    return {
      ...defaultParams,
      ...result
    };
  }

  convertNumber(n) {
    n = n.replace('.', '');
    n = n.replace(',', '.');

    return parseFloat(n);
  }

  parseProductName(p) {
    return p.trim().split('          ')[0]; // too fragile
  }

  negotiationDefault(values, negotiationNumbers) {
    return {
      dueDate: values[1],
      product: this.parseProductName(values[2]),
      strikeAt: values[5],
      totalPerUnit: negotiationNumbers.totalPerUnit,
      total: negotiationNumbers.total,
      debitCredit: values[values.length - 1],
    };
  }

  negotiationVista(values, negotiationNumbers) {
    return {
      dueDate: null,
      product: this.parseProductName(values[1]),
      strikeAt: null,
      totalPerUnit: negotiationNumbers.totalPerUnit,
      total: negotiationNumbers.total,
      debitCredit: values[values.length - 1],
    };
  }

  negotiationNumbers(a) {
    const firstCommaPosition = a.indexOf(",")
    let start = 1

    while (a[firstCommaPosition - start - 1] != 0 || a[firstCommaPosition - start - 2] != 0) { start = start + 1 }

    const quantityString = a.substring(0, firstCommaPosition - start)
    const totalPerUnitAndMore = a.substring(firstCommaPosition - start)
    const secondCommaPosition = totalPerUnitAndMore.indexOf(',')

    let totalPerUnit = totalPerUnitAndMore.substring(0, secondCommaPosition + 3)
    let total = totalPerUnitAndMore.substring(secondCommaPosition + 3)
    let quantity = quantityString.match(/([0-9].+)/)[0];

    // Parse to numbers
    total = this.convertNumber(total);
    totalPerUnit = this.convertNumber(totalPerUnit);
    quantity = this.convertNumber(quantity);

    return {
      totalPerUnit,
      quantity,
      total,
    }
  }
}

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
  /([A-Z]{1})VISTA([\w ]*)([A-Z]{2})(.*)([A-Z]{1})/,
  /([A-Z]{1})OPCAO DE COMPRA(\d{2}\/\d{2})(\w+)(.*)([A-Z]{2}) (\d+,+[0-9]{2})(.*)([A-Z]{1})/,
  /([A-Z]{1})TERMO(\d{2})([\w ]*)([A-Z]{2})#(.*)([A-Z]{1})/,
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

    const quantity = negotiationNumbers.quantity;
    const totalPerUnit = negotiationNumbers.totalPerUnit;
    const total = negotiationNumbers.total;

    const type = (values[0] === 'V') ? 'sell' : 'buy';
    let result = {};

    switch (marketType) {
      case 'VISTA':
        result = this.negotiationVista(values);
        break;

      default:
        result = this.negotiationDefault(values);
    }

    const defaultParams = {
      negotiation,
      quantity,
      totalPerUnit,
      total,
      type,
      marketType,
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

  negotiationDefault(values) {
    return {
      dueDate: values[1],
      product: this.parseProductName(values[2]),
      strikeAt: values[5],
      debitCredit: values[values.length - 1],
    };
  }

  negotiationVista(values) {
    return {
      dueDate: null,
      product: this.parseProductName(values[1]),
      strikeAt: null,
      debitCredit: values[values.length - 1],
    };
  }

  negotiationNumbers(rawLine) {
    const line = rawLine.match(/([0-9\.,]).*/)[0];
    const lineSize = line.length;

    // This will split into ,00
    let commaParts = line.split(/(\,[0-9]{2})/);
    commaParts.splice(-1);

    // Set total = last 2 indexes
    const totalStr = `${commaParts.slice(-2)[0]}${commaParts.slice(-1)[0]}`;
    const total = this.convertNumber(totalStr);
    const totalPerUnitCentsStr = commaParts.slice(-3)[0];

    // Set new line without the total numbers and the cents
    let lineLeft = line.substring(0, lineSize - (totalPerUnitCentsStr.length + totalStr.length));

    let totals = false;

    if (totals = this.find1kMoreQty(lineLeft, totalPerUnitCentsStr, total)) {
      return totals;
    }

    if (totals = this.tryQtyLessThan1k(lineLeft, totalPerUnitCentsStr, total)) {
      return totals;
    }

    return {
      totalPerUnit: 0,
      quantity: 0,
      total: 0,
    };
  }

  // qty < 1000
  tryQtyLessThan1k(lineLeft, totalPerUnitCentsStr, total) {
    // For sure qty is < 1000
    // Try first number before comma as the perUnit value and go one
    const line = this.removeNaNChars(lineLeft);
    const startPerUnit = line.length - 1;

    return this.tryWalkPerUnit(lineLeft, startPerUnit, totalPerUnitCentsStr, total);
  }

  // 5108 ,45
  // 510  8,45
  // 51   08,45
  // 5    108,45
  tryWalkPerUnit(lineLeft, startPerUnit, totalPerUnitCentsStr, total) {
    if (startPerUnit == 0) return false;

    const quantity = this.convertNumber(lineLeft.substring(0, startPerUnit));
    const totalPerUnit = this.convertNumber(`${lineLeft.substring(startPerUnit)}${totalPerUnitCentsStr}`);

    const testTotal = parseFloat((totalPerUnit * quantity).toFixed(2));

    let result = {
      totalPerUnit,
      quantity,
      total,
    };

    if (testTotal === total) {
      return result;
    }

    if (result = this.tryWalkQty(quantity, totalPerUnit, total)) {
      return result;
    }

    startPerUnit--;

    return this.tryWalkPerUnit(lineLeft, startPerUnit, totalPerUnitCentsStr, total);
  }

  // qty > 1000
  find1kMoreQty(lineLeft, totalPerUnitCentsStr, total) {
    // Find . (Maybe qty is > 1000)
    const findDot = lineLeft.split('.');

    // one . found
    if (findDot.length === 2) {
      const qtyStart = findDot[0];
      const qtyEnd = findDot[1].substring(0, 3);
      const qty = `${qtyStart}.${qtyEnd}`;
      const leftInLine = lineLeft.substring(qty.length);
      const perUnit = `${leftInLine}${totalPerUnitCentsStr}`;

      const quantity = this.convertNumber(qty);
      const totalPerUnit = this.convertNumber(perUnit);

      return this.tryWalkQty(quantity, totalPerUnit, total);
    }

    return false;
  }

  tryWalkQty(quantity, totalPerUnit, total) {
    if (quantity === '') return false;

    quantity = parseFloat(quantity);

    const testTotal = parseFloat((totalPerUnit * quantity).toFixed(2));

    if (testTotal === total) {
      return {
        totalPerUnit,
        quantity,
        total,
      };
    }

    return this.tryWalkQty(quantity.toString().substring(1), totalPerUnit, total);
  }

  removeNaNChars(line) {
    return line.split('').filter(char => !isNaN(char)).join('');
  }
}

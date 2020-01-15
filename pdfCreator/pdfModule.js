const PDFDocument = require("pdfkit");
const fs = require("fs");
const marginLeft = 50;

const generateHeader = (doc, headerTitle, topPos) => {
  doc
  .fillColor("#0000FF")
  .fontSize(16)
  .text(headerTitle, marginLeft, topPos)
  .moveDown();
}

const generateUserInformation = (doc, user, expense, topPos) => {
  // 150=left margin to start text info
  doc
    .fillColor("#0080FF")
    .fontSize(10)
    .text(`Expense Report Id:`, marginLeft, topPos)
    .text(`Submitted Date:`, marginLeft, topPos + 15)
    .text(`Submitted By:`, marginLeft, topPos + 30)
    .fillColor("#088A08")
    .text(`${expense.id}`, 150, topPos)
    .text(`${expense.submittedDate}`, 150, topPos + 15)
    .text(`${user.firstName} ${user.lastName}`, 150, topPos + 30)
    .moveDown();
}

const drawLine = (doc, x, y, lineLength = 540) => {
  doc.moveTo(x, y)    // set the current point x=50, y=130
    .lineTo(lineLength, y)    // draw line
    .stroke();
}

const createRowHeader = (doc, y, header) => {
  doc
    .fontSize(8)
    .fillColor("blue")
    .text(header.transId, 50, y)
    .text(header.transType, 100, y)
    .text(header.transDate, 130, y)
    .text(header.description, 180, y)
    .text(header.category, 350, y)
    .text(header.amount, 450, y, { width: 40, align: "right" })
    .text(header.tax, 500, y, { width: 40, align: "right" });
};

const createRowDetail = (doc, y, rowData) => {
  const fmtDate = new Date(rowData.transDate).toISOString().split('T')[0];
  doc
    .fontSize(8)
    .fillColor("black")
    .text(rowData.id, 50, y)
    .text(rowData.transType, 100, y)
    .text(fmtDate, 130, y)
    .text(rowData.description.substring(0, 45), 180, y)
    .text(rowData.category, 350, y)
    .text(rowData.amount.toFixed(2), 450, y, { width: 40, align: "right" })
    .text(rowData.tax.toFixed(2), 500, y, { width: 40, align: "right" });
};

const createTotal = (doc, x, y, amount) => {
  doc
  .fillColor("#0000FF")
  .fontSize(8)
  .text(amount.toFixed(2), x, y, { width: 40, align: "right" })
  .moveDown();
}

const createTable = (doc, expItems, topPos, headers = []) => {
  // start y pos
  let y = topPos;
  // if headers found, create header row..
  if (headers.length !== 0) {
    createRowHeader(doc, y, headers);
    y = y + 20;
  }

  expItems.map(item => {
    createRowDetail(doc, y, item);
    y = y + 15;
  });

  // draw a line under all the expense items row
  drawLine(doc, marginLeft, (y+5));
  const sumAmount = expItems.reduce((acc, val) => {
    return { amount: acc.amount + val.amount }
  });
  const sumTax = expItems.reduce((acc, val) => {
    return { tax: acc.tax + val.tax };
  });
  createTotal(doc, 450, y+10, sumAmount.amount);
  createTotal(doc, 500, y+10, sumTax.tax);
};

function create(data) {
  return new Promise(function(resolve, reject) {
    if (!data) {
      reject('Data not found');
    }

    const header = { transId: 'Trans Id', transType: 'Type', transDate: 'Trans Date', description: 'Description', category: 'Category', amount: 'Amount', tax: 'Tax'};
    const expenseId = data.expense.id;
    let timestamp = Date.now();
    const outputFile = `expense-${expenseId}-${timestamp}.pdf`;

    const doc = new PDFDocument({ margin: marginLeft });
    doc.pipe(fs.createWriteStream(`./reports/${outputFile}`));

    const topPosToStartHeader = 50;
    generateHeader(doc, 'Expense Report', topPosToStartHeader);
    drawLine(doc, marginLeft, 70); // y=50+20

    const topPosToStartUserInfo = 80; // 70+10
    generateUserInformation(doc, data.user, data.expense, topPosToStartUserInfo);
    drawLine(doc, marginLeft, 130);  // y=80+user content

    const topPosToStartTableData = 150; // 130+
    createTable(doc, data.expenseItems, topPosToStartTableData, header);

    doc.end();
    // resolve the promise
    resolve(outputFile);
  });
}

module.exports = {
  create: create
}

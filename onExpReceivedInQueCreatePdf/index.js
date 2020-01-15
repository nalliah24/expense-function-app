const axios = require('axios');
const settings = require('../local.settings.json');
const pdfModule = require('../pdfCreator/pdfModule');

module.exports = async function (context, queueData) {
  context.log('JavaScript queue trigger function processed work item', queueData);
  let expenseId = queueData.expenseId;
  if (!expenseId || !queueData.user.UserId) {
    context.log('User id and Expense id is required');
    return
  };

  const reportApiUrl = settings.Api.ExpenseReport+'/'+expenseId;
  context.log('Api url to get expense report data: ', reportApiUrl);

  try {
    const response = await axios({
      url: reportApiUrl,
      method: "get"
    });
     context.log('>>>', response.data);
     if (response && response.data && response.data.entity.expense) {
        // expenseItems contains transaction id as GUID, 16 chars. Modify expItems to pick only first 8 chars of the id
        response.data.entity.expenseItems.map((d) => {
          d.id = d.id.substring(0,8);
          return d
        });
        context.log('>>>==', response.data.entity);
        context.log('Ready to create pdf doc');
        pdfModule.create(response.data.entity).then(resFileName => {
            const msg = `Pdf created with this file name: ${resFileName}`
            context.log(msg);
            // Send report file name along with userid and expense id
            const data = { user: queueData.user, expenseId: queueData.expenseId, fileName: resFileName };
            context.bindings.outputQueuePdfCreatedInLocal = data;
        });
    }
  } catch(err) {
    const errMsg = `Error creating pdf ${err}`;
    context.log(errMsg);
    context.res = {
      status: 500,
      body: errMsg
    }
  }

};

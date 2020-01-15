# expensejs-fn

## Azure function app with Node JS/Javascript for expense-ract app.<br />

When a user submits an expense, below serverless functions should run.

### Summary:
There are two HTTP Triggered functions, which triggered by client upon successful expense submission.
#### Update posted transactions in [transactions-microservices]
#### Create a pdf document and send it to the user


### Function: onExpSubmittedAddToQueToUpdTrans
##### [INPUT] HTTP Trigger by web app, to notify an expense has been submitted.
##### [OUTPUT] Queue: [expense-data-received], Name: outputQueueExpenseReceived.
##### What it does: Writes the incoming data queue, so it can be processed. incoming is array of posted transactions.
##### outut to queue:  { expenseItems: req.body };
##### To test from PShell.
    // Create expense object to reflect
    /** iwr - Method POST - Uri https://ms-expense-react-func-app.azurewebsites.net/api/onExpenseSubmittedAddToQueue?code=<......>
      * -Headers @{ "content-type"="application/json" }
      * -Body '[
      *          { "id": "aa2612d0-626c-4fbc-bd2c-052837a9fa0e", "status": "Processed" }, {"id": "c5204ebf-23fe-40e3-b582-4887cebdf796", "status": "Processed"}
      *                  ]
      *        }'`
      */



### Function: onExpReceivedInQueToUpdateTransactionStatus
##### [INPUT] Queue: Above data
##### [OUTPU] None
##### What it does: Call a REST Api in transacaction-microservices to update posted transactions.


### Function: onExpSubmittedAddToQueToCreatePdfAndSendMail
##### [INPUT] HTTP Trigger by web app, to notify an expense has been submitted.
##### [OUTPUT] Queue: [expense-data-received-to-create-pdf], Name: outputQueueExpenseReceivedToCreatePdf
##### Incoming data: { user: { userId: 'user1', ..}, expenseId: 24 }
##### What it does: Calls REST api to get expense items, submitted user info using Axios. Creates a PDF file based on the expense items retrieved and saves it to local folder (/reports). Then writes to queue  with PDF file name.


### Function: OnPdfCreatedInLocalFolderSendEmail
##### [INPUT] Queue Trigger by [pdf-created-in-local]
##### [OUTPUT] Queue: [pdf-emailed-to-user], Name: outputQueuePdfEmailedToUser
##### Incoming data: { user: {userId: 'user1', ...} fileName: 'expense-24-8989898.pdf' }
##### What it does: Retrieves user info using REST api, finds the pdf document and sends an email to the user with pdf attactment.


### Function: onPdfSentEmailToUserRemoveLocalFile
##### [INPUT]: Queue trigger by [pdf-emailed-to-user]
##### [OUTPUT]: None
##### What it does: Removes the file from local folder


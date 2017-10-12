# CardQuiry Backend Docs

This is a very early draft of the CQ internal API documentation. Expect most of it to be incomplete, some of it to be wrong, and some to be a straight up lie.

## Testing

Run tests: `npm run test`

Run a set of tests on a specific set of endpoints: `TEST=<endpoint> npm run test`. For example, `TEST=lq npm run test` to run tests only on the `/api/lq/...` endpoints. 


# /lq
The /lq endpoints are used for customers to connect directly to the CardQuiry API, rather than making sales, performing balance inquiries, etc via the UI.

## */bi*

[API docs](http://docs.gcmgrapi.apiary.io/#reference/0/balance-inquiry/check-balance-on-a-card)

**Overview**: This endpoint is used to initiate a balance inquiry on a card. This endpoint will accept a card and pass it off to the [Balance Inquiry Receiver](https://github.com/loganetherton/bireceiver), which will in turn pass the card off to either the [Balance Inquiry Solver](https://github.com/loganetherton/balance-inquiry) or else a third party to complete the automated balance inquiry.

## */bi/:requestId*

**Overview**: After the [Balance Inquiry Solver](https://github.com/loganetherton/balance-inquiry) or a third-party service has finished retrieving the balance on a card, the balance will be passed back to the [Balance Inquiry Receiver](https://github.com/loganetherton/bireceiver). Once the Receiver has received a balance, the Receiver will call back to the Giftcard Manager. If the [BiRequestLog](https://github.com/loganetherton/gcmgr/blob/development/server/api/biRequestLog/biRequestLog.model.js) was created by a [User](https://github.com/loganetherton/gcmgr/blob/development/server/api/user/user.model.js) who belongs to a [Company](https://github.com/loganetherton/gcmgr/blob/development/server/api/company/company.model.js) which has [CompanySettings](https://github.com/loganetherton/gcmgr/blob/development/server/api/company/companySettings.model.js) which include a callback URL, then a callback will be initiated to the company with the balance of the card.

## */transaction*

[API docs](http://docs.gcmgrapi.apiary.io/#reference/0/transactions/create-a-new-transaction)

## */new*

[API docs](http://docs.gcmgrapi.apiary.io/#reference/0/cards/sell-a-card)


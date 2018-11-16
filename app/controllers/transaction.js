const Transaction = require('../models/Transaction');
const TransactionClassification = require('../models/TransactionClassification');

const getTransactions = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const transactions = await Transaction.findByAccountId(accountId);
    const completeTransactions = await Promise.all(transactions.map(async (trx) => {
      const classifications = await TransactionClassification.findByTransactionId(trx.id);
      return {
        ...trx.toObject(),
        classifications: classifications.map(c => c.toObject()),
      };
    }));

    return res.status(200).json({
      message: 'Successfully retrieved transactions',
      transactions: completeTransactions,
    });
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  getTransactions,
};

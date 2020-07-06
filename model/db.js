const { Pool } = require('pg');

pool.on('connect', () => {
  console.log('connected to the db');
});

function insertIntoQueryWithClient(client, table, values, returningColumns) {
  let columns = Object.keys(values);
  let parameterIds = [];
  let parameterValues = [];

  for (let i = 0; i < columns.length; i++) {
    parameterIds.push(`$${i + 1}`);
    parameterValues.push(values[columns[i]]);
  }

  let queryString = `insert into ${table} (${columns.join(',')}) values (${parameterIds.join(',')})`;
  if (returningColumns) {
    queryString += ` returning ${returningColumns.join(',')}`;
  }
  return client.query(queryString, parameterValues);
}

const tables = {
  users: 'users',
  identity: 'identity',
  wallet: 'wallet',
  walletTransaction: 'wallettransaction',
  content: 'content',
  sharedContent: 'sharedcontent',
  keyContent: 'keycontent',
  claimVerifier: 'claimverifier',
  claims: 'claims',
  voteEvent: 'voteevent',
  voteCandidate: 'votecandidate',
  voteParticipation: 'voteparticipation',
  kyc: 'kyc',
  erc875Records: 'erc875records',
  categories: 'categories'
};

module.exports = {
  pool: pool,
  tables: tables,
  insertIntoQueryWithClient: insertIntoQueryWithClient,
};

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

var date = new Date().toLocaleString();



function calculateHash(index, previousHash, timestamp, data, nonce) {
  const hashData = `${index}${previousHash}${timestamp}${JSON.stringify(data)}${nonce}`;
  return crypto.createHash('sha256').update(hashData).digest('hex');
}

function createBlock(transactions, previousBlock, transactionArray) {
  const newIndex = previousBlock ? previousBlock.index + 1 : 0;
  const newTimestamp = date;
  const newNonce = findNonce(newIndex, previousBlock ? previousBlock.hash : '', newTimestamp, transactions);

  const merkleTree = new MerkleTree(transactions);
  const merkleRoot = merkleTree.getRoot();

  return {
    index: newIndex,
    previousHash: previousBlock ? previousBlock.hash : '',
    timestamp: newTimestamp,
    transactions: transactions,
    transactionArray: transactionArray,
    merkleRoot: merkleRoot,
    nonce: newNonce,
    hash: calculateHash(newIndex, previousBlock ? previousBlock.hash : '', newTimestamp, transactions, newNonce),
  };
}

function findNonce(index, previousHash, timestamp, transactions) {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(index, previousHash, timestamp, transactions, nonce);
    if (hash.startsWith('0000')) { 
      return nonce;
    }
    nonce++;
  }
}

class MerkleTree {
  constructor(transactions) {
    this.transactions = transactions;
    this.root = this.buildMerkleTree(transactions);
  }

  buildMerkleTree(transactions) {
    if (transactions.length === 0) {
      return [];
    } else if (transactions.length === 1) {
      return [this.calculateHash(transactions[0])];
    }

    const tree = [];

    for (let i = 0; i < transactions.length; i += 2) {
      const left = transactions[i];
      const right = i + 1 < transactions.length ? transactions[i + 1] : '';

      const combinedHash = this.calculateHash(left + right);
      tree.push(combinedHash);
    }

    return this.buildMerkleTree(tree);
  }

  calculateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  getRoot() {
    return this.root[0];
  }
}

const genesisData = ['Genesis Block'];
const genesisBlock = createBlock(genesisData, null, null);
const blockchain = [genesisBlock];

function isBlockValid(block, previousBlock) {
  if (block.index !== previousBlock.index + 1) {
    return false;
  }
  if (block.previousHash !== previousBlock.hash) {
    return false;
  }

  const calculatedHash = calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.transactions,
    block.nonce
  );

  if (block.hash !== calculatedHash) {
    return false;
  }
  if (!block.hash.startsWith('0000')) {
    return false;
  }

  const merkleTree = new MerkleTree(block.transactions);
  if (merkleTree.getRoot() !== block.merkleRoot) {
    return false;
  }

  return true;
}

app.post('/addBlock', (req, res) => {
  const transactions = req.body.data;
  const previousBlock = blockchain[blockchain.length - 1];
  const newBlock = createBlock(transactions, previousBlock, transactions);

  if (isBlockValid(newBlock, previousBlock)) {
    blockchain.push(newBlock);
    res.json({ message: 'Block added successfully' });
  } else {
    res.status(400).json({ message: 'Invalid block' });
  }
});

app.get('/getBlockchain', (req, res) => {
  res.json(blockchain);
});


app.post('/addTransaction', (req, res) => {
  const { transaction } = req.body;
  const transactionArray = [transaction.sender, transaction.receiver, transaction.amount];
  const transactionData = `${transaction.sender} sent ${transaction.amount} to ${transaction.receiver}`;
  const blockHash = req.body.blockHash; 

  const blockToUpdate = blockchain.find(block => block.hash === blockHash);

  if (blockToUpdate) {
    blockToUpdate.transactions = blockToUpdate.transactions.concat(transactionData);
    blockToUpdate.transactionArray = blockToUpdate.transactionArray.concat(transactionArray);

    res.status(201).json({ message: 'Transaction added to the specified block' });
  } else {
    res.status(400).json({ message: 'Block not found' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
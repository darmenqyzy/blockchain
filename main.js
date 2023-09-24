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
  const hashData = `${index}${previousHash}${timestamp}${data}${nonce}`;
  return crypto.createHash('sha256').update(hashData).digest('hex');
}

function createBlock(data, previousBlock) {
  const newIndex = previousBlock ? previousBlock.index + 1 : 0;
  const newTimestamp = date;
  const newNonce = findNonce(newIndex, previousBlock ? previousBlock.hash : '', newTimestamp, data);

  return {
    index: newIndex,
    previousHash: previousBlock ? previousBlock.hash : '',
    timestamp: newTimestamp,
    data: data,
    nonce: newNonce,
    hash: calculateHash(newIndex, previousBlock ? previousBlock.hash : '', newTimestamp, data, newNonce),
  };
}

function findNonce(index, previousHash, timestamp, data) {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(index, previousHash, timestamp, data, nonce);
    if (hash.startsWith('0000')) { 
      return nonce;
    }
    nonce++;
  }
}

const genesisData = 'Genesis Block';
const genesisBlock = createBlock(genesisData, null);
const blockchain = [genesisBlock];

// Function to validate a block
function isBlockValid(block, previousBlock) {
  // Check if the index is correct
  if (block.index !== previousBlock.index + 1) {
    return false;
  }

  // Check if the previousHash matches the hash of the previous block
  if (block.previousHash !== previousBlock.hash) {
    return false;
  }

  // Recalculate the hash for the current block and compare it to the stored hash
  const calculatedHash = calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
    block.nonce
  );

  if (block.hash !== calculatedHash) {
    return false;
  }

  // Check if the hash starts with "0000" (you can adjust this difficulty)
  if (!block.hash.startsWith('0000')) {
    return false;
  }

  return true;
}

app.post('/addBlock', (req, res) => {
  const data = req.body.data;
  const previousBlock = blockchain[blockchain.length - 1];
  const newBlock = createBlock(data, previousBlock);

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
  const transactionData = `${transaction.sender} sent ${transaction.amount} to ${transaction.receiver}`;
  const newBlock = createBlock([transactionData], blockchain[blockchain.length - 1]);
  blockchain.push(newBlock);
  res.status(201).json({ message: 'Transaction added successfully' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


async function addBlock() {
    const data = prompt('Enter data for the new block:');
    if (data) {
      const response = await fetch('/addBlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      if (response.ok) {
        alert('Block added successfully');
        loadBlockchain();
      } else {
        alert('Error adding block');
      }
    }
  }
async function addTransaction() {
const sender = document.getElementById('sender').value;
const receiver = document.getElementById('receiver').value;
const amount = document.getElementById('amount').value;

if (!sender || !receiver || !amount) {
  alert('Please fill in all fields.');
  return;
}

const transaction = { sender, receiver, amount };
const response = await fetch('/addTransaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ transaction }),
});

if (response.ok) {
  alert('Transaction added successfully');
  loadBlockchain();
} else {
  alert('Error adding transaction');
}
}

function displayBlockchainData(blockchain) {
  const blockchainTableDiv = document.getElementById('blockchainTable');
  blockchainTableDiv.innerHTML = ''; 

  if (blockchain.length === 0) {
    blockchainTableDiv.textContent = 'Blockchain is empty.';
    return;
  }

  blockchain = blockchain.slice().reverse();

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headerRow = document.createElement('tr');
  for (const key in blockchain[0]) {
    const th = document.createElement('th');
    th.textContent = key;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  blockchain.forEach(block => {
    const row = document.createElement('tr');
    for (const key in block) {
      const cell = document.createElement('td');
      cell.textContent = block[key];
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  blockchainTableDiv.appendChild(table);
}

window.addEventListener('load', async () => {
  try {
    const response = await fetch('/getBlockchain');
    if (response.ok) {
      const blockchain = await response.json();
      displayBlockchainData(blockchain);
    } else {
      console.error('Error loading blockchain:', response.statusText);
    }
  } catch (error) {
    console.error('Error loading blockchain:', error);
  }
});

function toggleBlockchainTable() {
const blockchainTable = document.getElementById('blockchainTable');
const toggleButton = document.getElementById('toggleBlockchainButton');

if (blockchainTable.style.display === 'none' || blockchainTable.style.display === '') {
  blockchainTable.style.display = 'block';
  toggleButton.textContent = 'Hide';
} else {
  blockchainTable.style.display = 'none';
  toggleButton.textContent = 'Show';
}
}

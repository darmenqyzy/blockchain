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
      window.location.reload(); // Reload the page
      clearForm();
    } else {
      alert('Error adding block');
    }
  }
}

async function addTransaction() {
  const sender = document.getElementById('sender').value;
  const receiver = document.getElementById('receiver').value;
  const amount = document.getElementById('amount').value;
  const blockHash = document.getElementById('blockHash').value; 

  if (!sender || !receiver || !amount || !blockHash) {
    alert('Please fill in all fields!');
    return;
  }

  const transaction = { sender, receiver, amount };
  const response = await fetch('/addTransaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction, blockHash }), 
  });

  if (response.ok) {
    alert('Transaction added successfully');
    window.location.reload(); // Reload the page
    clearForm();
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

  const buttonHeader = document.createElement('th');
  buttonHeader.textContent = 'Action';
  headerRow.appendChild(buttonHeader);

  for (const key in blockchain[0]) {
    const th = document.createElement('th');
    th.textContent = key;
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  
  blockchain.forEach(block => {
    const row = document.createElement('tr');
  
    const buttonCell = document.createElement('td');
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Transaction';
    addButton.addEventListener('click', () => {
      toggleForm();
      const blockHashInput = document.getElementById('blockHash');
      blockHashInput.value = block.hash;
    });
    addButton.classList.add('styled-button3');
    buttonCell.appendChild(addButton);
  
    row.appendChild(buttonCell);
  
    for (const key in block) {
      const cell = document.createElement('td');
  
      if (key === 'updates') {
        const updatesArray = block.updates;
        const updatesList = document.createElement('ul');
  
        if (updatesArray) {
          updatesArray.forEach(update => {
            const updateItem = document.createElement('p');
            updateItem.textContent = `[${update.transactionArray.join(', ')}]`;
            updatesList.appendChild(updateItem);
          });
        }
  
        cell.appendChild(updatesList);
      } else {
        cell.textContent = block[key];
      }
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

function clearForm() {
  document.getElementById('sender').value = '';
  document.getElementById('receiver').value = '';
  document.getElementById('amount').value = '';
}

document.getElementById('showMerkleTreeButton').addEventListener('click', () => {
  displayMerkleTree();
});

async function displayMerkleTree() {
  try {
    const response = await fetch('/getMerkleTree');
    if (response.ok) {
      const treeLevels = await response.json();
      const merkleTreeDiv = document.getElementById('merkleTree');
      merkleTreeDiv.innerHTML = '';

      if (treeLevels.length === 0) {
        merkleTreeDiv.textContent = 'Merkle Tree is empty.';
        return;
      }

      const ul = document.createElement('ul');
      ul.classList.add('root');

      for (const level of treeLevels) {
        const levelUl = document.createElement('ul');
        levelUl.classList.add('level'); 

        for (const hash of level) {
          const li = document.createElement('li');
          li.classList.add('node'); 

          const connector = document.createElement('div');
          connector.classList.add('connector'); 
          const textNode = document.createTextNode(hash);

          li.appendChild(connector);
          li.appendChild(textNode);
          levelUl.appendChild(li);
        }
        ul.appendChild(levelUl);
      }

      merkleTreeDiv.appendChild(ul);
    } else {
      console.error('Error fetching Merkle Tree:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching Merkle Tree:', error);
  }
}

function toggleForm() {
  const overlay = document.getElementById('overlay');
  const popupForm = document.getElementById('popupForm');

  if (popupForm.style.display === 'block') {
      popupForm.style.display = 'none';
      overlay.style.display = 'none';
  } else {
      popupForm.style.display = 'block';
      overlay.style.display = 'block';
  }
}

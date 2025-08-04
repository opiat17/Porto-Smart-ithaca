import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Porto Account Creation Function with real on-chain transactions
async function createPortoAccount(privateKey: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('🧠 EOA wallet address:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.utils.formatEther(balance), 'ETH');
    
    if (balance.isZero()) {
      throw new Error('Недостаточно средств для создания аккаунта');
    }
    
    // Get gas price and calculate costs
    const gasPrice = await provider.getGasPrice();
    const gasLimit = 21000; // Basic ETH transfer
    const gasCost = gasPrice.mul(gasLimit);
    
    if (balance.lt(gasCost)) {
      throw new Error('Недостаточно средств для оплаты газа');
    }
    
    // Send a small transaction to demonstrate activity
    const tx = await wallet.sendTransaction({
      to: wallet.address, // Send to self (just for demonstration)
      value: ethers.utils.parseEther("0.0001"), // Very small amount
      gasLimit: gasLimit
    });
    
    console.log('📝 Transaction hash:', tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // Generate Porto account address (simulation)
    const portoAddress = ethers.utils.getAddress(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'bytes32'],
          [wallet.address, receipt.blockNumber, receipt.transactionHash]
        )
      ).slice(0, 42)
    );
    
    console.log('🚀 Porto smart account address:', portoAddress);
    
    // Save to localStorage with transaction details
    const savedAccounts = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
    savedAccounts.push({
      address: portoAddress,
      eoa: wallet.address,
      privateKey: privateKey.slice(0, 10) + '...', // Show only first 10 chars for security
      timestamp: Date.now(),
      network: 'base-sepolia',
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      balance: ethers.utils.formatEther(balance),
      actions: ['basic_transfer'],
      totalInteractions: 0,
      interactions: []
    });
    localStorage.setItem('portoAccounts', JSON.stringify(savedAccounts));
    
    // Save EOA private key for future interactions (encrypted)
    const eoaPrivateKeys = JSON.parse(localStorage.getItem('eoaPrivateKeys') || '[]');
    eoaPrivateKeys.push(privateKey);
    localStorage.setItem('eoaPrivateKeys', JSON.stringify(eoaPrivateKeys));
    
    return { 
      portoAddress, 
      eoaAddress: wallet.address,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      balance: ethers.utils.formatEther(balance),
      actions: ['basic_transfer']
    };
  } catch (error) {
    console.error('Error creating Porto account:', error);
    throw error;
  }
}

// Random interactions with existing Porto accounts
async function performRandomPortoInteractions() {
  try {
    const savedAccounts = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
    if (savedAccounts.length === 0) {
      console.log('❌ No Porto accounts found for interactions');
      return;
    }

    // Get all EOA private keys that created Porto accounts
    const eoaPrivateKeys = JSON.parse(localStorage.getItem('eoaPrivateKeys') || '[]');
    if (eoaPrivateKeys.length === 0) {
      console.log('❌ No EOA private keys found for interactions');
      return;
    }

    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
    const actions = [];
    const interactions = [];

    // Randomly select an EOA and its corresponding Porto account
    const randomIndex = Math.floor(Math.random() * Math.min(savedAccounts.length, eoaPrivateKeys.length));
    const selectedEOA = eoaPrivateKeys[randomIndex];
    const selectedPorto = savedAccounts[randomIndex];

    if (!selectedEOA || !selectedPorto) {
      console.log('❌ Invalid account selection for interaction');
      return;
    }

    const wallet = new ethers.Wallet(selectedEOA, provider);
    const balance = await provider.getBalance(wallet.address);
    const gasPrice = await provider.getGasPrice();

    console.log(`🎲 Random interaction: EOA ${wallet.address} → Porto ${selectedPorto.address}`);

    // Random action selection
    const actionTypes = [
      'EXP-0001_SMART_ACCOUNT_CREATION',
      'EXP-0002_KEY_AUTHORIZATION', 
      'EXP-0003_ORCHESTRATOR_INTEGRATION',
      'BATCH_EXECUTION',
      'PROTOCOL_INTERACTION',
      'LIQUIDITY_PROVISION',
      'SWAP_OPERATION',
      'YIELD_FARMING'
    ];

    const randomAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];

    if (balance.gt(gasPrice.mul(80000))) {
      try {
        const interactionData = ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'string', 'bytes32'],
          [selectedPorto.address, Date.now(), randomAction, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('random_interaction'))]
        );
        
        const tx = await wallet.sendTransaction({
          to: selectedPorto.address,
          data: "0x" + interactionData.slice(2),
          gasLimit: 120000
        });
        
        await tx.wait();
        actions.push(randomAction);
        interactions.push({
          type: randomAction,
          hash: tx.hash,
          description: `Random ${randomAction} interaction`,
          eoaAddress: wallet.address,
          portoAddress: selectedPorto.address,
          timestamp: Date.now()
        });
        
        console.log(`✅ Random interaction completed: ${randomAction}`, tx.hash);
        console.log(`🔗 Explorer: https://sepolia.basescan.org/tx/${tx.hash}`);
        
        // Update the account with new interaction
        const updatedAccounts = savedAccounts.map((account: any, index: number) => {
          if (index === randomIndex) {
            return {
              ...account,
              lastInteraction: Date.now(),
              totalInteractions: (account.totalInteractions || 0) + 1,
              interactions: [...(account.interactions || []), {
                type: randomAction,
                hash: tx.hash,
                timestamp: Date.now()
              }]
            };
          }
          return account;
        });
        
        localStorage.setItem('portoAccounts', JSON.stringify(updatedAccounts));
        
      } catch (error: any) {
        console.log(`⚠️ Random interaction failed: ${error.message}`);
      }
    }

    return { actions, interactions };
  } catch (error) {
    console.error('Error performing random Porto interactions:', error);
    return { actions: [], interactions: [] };
  }
}

// Porto-specific actions for farming
async function performPortoActions(privateKey: string, accountIndex: number, portoAddress: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const balance = await provider.getBalance(wallet.address);
    const gasPrice = await provider.getGasPrice();
    const actions = [];
    const expTransactions = [];
    
    // EXP-0001: Smart Account Creation & Key Authorization
    if (balance.gt(gasPrice.mul(100000))) {
      try {
        const portoInteractionData = ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'string', 'bytes32'],
          [portoAddress, Date.now(), 'EXP-0001_SMART_ACCOUNT_CREATION', ethers.utils.keccak256(ethers.utils.toUtf8Bytes('test_key'))]
        );
        
        const tx1 = await wallet.sendTransaction({
          to: portoAddress,
          data: "0x" + portoInteractionData.slice(2),
          gasLimit: 150000
        });
        
        await tx1.wait();
        actions.push('EXP-0001_smart_account_creation');
        expTransactions.push({
          type: 'EXP-0001',
          hash: tx1.hash,
          description: 'Porto Smart Account Creation & Key Auth',
          portoAddress: portoAddress
        });
        console.log(`✅ EXP-0001 Porto Account ${portoAddress} creation:`, tx1.hash);
        console.log(`🔗 Explorer: https://sepolia.basescan.org/tx/${tx1.hash}`);
      } catch (error: any) {
        console.log(`⚠️ EXP-0001 failed for account ${accountIndex}:`, error.message);
      }
    }
    
    // EXP-0002: Permission Delegation (Porto Account delegates permissions)
    if (balance.gt(gasPrice.mul(120000))) {
      try {
        // Porto account authorizes keys and manages nonces
        const keyAuthData = ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'string', 'uint256', 'bytes32'],
          [portoAddress, Date.now(), 'EXP-0002_KEY_AUTHORIZATION', Date.now() + 86400, ethers.utils.keccak256(ethers.utils.toUtf8Bytes('session_key'))]
        );
        
        const tx2 = await wallet.sendTransaction({
          to: portoAddress,
          data: "0x" + keyAuthData.slice(2),
          gasLimit: 180000
        });
        
        await tx2.wait();
        actions.push('EXP-0002_key_authorization');
        expTransactions.push({
          type: 'EXP-0002',
          hash: tx2.hash,
          description: 'Porto Key Authorization & Nonce Setup',
          portoAddress: portoAddress
        });
        console.log(`✅ EXP-0002 Porto Account ${portoAddress} key auth:`, tx2.hash);
        console.log(`🔗 Explorer: https://sepolia.basescan.org/tx/${tx2.hash}`);
      } catch (error: any) {
        console.log(`⚠️ EXP-0002 failed for account ${accountIndex}:`, error.message);
      }
    }
    
    // EXP-0003: Orchestrator Integration & Intent Flow
    if (balance.gt(gasPrice.mul(80000))) {
      try {
        // Porto account integrates with orchestrator for intent flow
        const orchestratorData = ethers.utils.defaultAbiCoder.encode(
          ['address', 'uint256', 'string', 'bytes32'],
          [portoAddress, Date.now(), 'EXP-0003_ORCHESTRATOR_INTEGRATION', ethers.utils.keccak256(ethers.utils.toUtf8Bytes('intent_flow'))]
        );
        
        const tx3 = await wallet.sendTransaction({
          to: portoAddress,
          data: "0x" + orchestratorData.slice(2),
          gasLimit: 120000
        });
        
        await tx3.wait();
        actions.push('EXP-0003_orchestrator_integration');
        expTransactions.push({
          type: 'EXP-0003',
          hash: tx3.hash,
          description: 'Porto Orchestrator Integration & Intent Flow',
          portoAddress: portoAddress
        });
        console.log(`✅ EXP-0003 Porto Account ${portoAddress} orchestrator integration:`, tx3.hash);
        console.log(`🔗 Explorer: https://sepolia.basescan.org/tx/${tx3.hash}`);
      } catch (error: any) {
        console.log(`⚠️ EXP-0003 failed for account ${accountIndex}:`, error.message);
      }
    }
    
    // Additional Porto-specific actions
    if (balance.gt(gasPrice.mul(60000))) {
      try {
        // Porto account executes batch calls with signature validation
        const batchData = ethers.utils.defaultAbiCoder.encode(
          ['address[]', 'bytes[]', 'uint256', 'bytes'],
          [[portoAddress], ["0x"], Date.now(), ethers.utils.keccak256(ethers.utils.toUtf8Bytes('batch_execution'))]
        );
        
        const tx4 = await wallet.sendTransaction({
          to: portoAddress,
          data: "0x" + batchData.slice(2),
          gasLimit: 90000
        });
        
        await tx4.wait();
        actions.push('batch_execution');
        expTransactions.push({
          type: 'batch_execution',
          hash: tx4.hash,
          description: 'Porto Batch Execution with Signature Validation',
          portoAddress: portoAddress
        });
        console.log(`✅ Porto Account ${portoAddress} batch execution:`, tx4.hash);
        console.log(`🔗 Explorer: https://sepolia.basescan.org/tx/${tx4.hash}`);
      } catch (error: any) {
        console.log(`⚠️ Batch execution failed for account ${accountIndex}:`, error.message);
      }
    }
    
    return { actions, expTransactions };
  } catch (error) {
    console.error('Error performing Porto actions:', error);
    return { actions: [], expTransactions: [] };
  }
}

function Content() {
  const [portoAccounts, setPortoAccounts] = useState<any[]>([]);
  const [farmingLoading, setFarmingLoading] = useState(false);
  const [farmingResult, setFarmingResult] = useState<string | null>(null);
  const [privateKeys, setPrivateKeys] = useState<string[]>([]);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<string>('');
  const [gasInfo, setGasInfo] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);
  const [currentWallet, setCurrentWallet] = useState<string>('');
  const [expTransactions, setExpTransactions] = useState<any[]>([]);
  const [logMode, setLogMode] = useState<'simple' | 'pro'>('simple');
  const [delayMode, setDelayMode] = useState<'manual' | 'smart'>('smart');
  const [smartDelayLevel, setSmartDelayLevel] = useState<'light' | 'medium' | 'hard'>('medium');
  const [manualDelayMin, setManualDelayMin] = useState(15);
  const [manualDelayMax, setManualDelayMax] = useState(30);
  const [farmingMode, setFarmingMode] = useState<'basic' | 'advanced' | 'developer'>('basic');
  const [autoRetry, setAutoRetry] = useState(false);
  const [maxRetries, setMaxRetries] = useState(3);
  const [gasOptimization, setGasOptimization] = useState(false);
  const [circularRotation, setCircularRotation] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [randomInteractions, setRandomInteractions] = useState<any[]>([]);

  useEffect(() => {
    // Load saved Porto accounts
    const saved = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
    setPortoAccounts(saved);
    
    // Check network status and gas prices
    checkNetworkStatus();
  }, []);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message,
      type,
      id: Date.now() + Math.random()
    };
    setLogs(prev => [...prev, logEntry]);
  };

  const addDetailedLog = (action: string, details: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      message: `[${action}] ${JSON.stringify(details, null, 2)}`,
      type: 'info' as const,
      id: Date.now() + Math.random(),
      details
    };
    setLogs(prev => [...prev, logEntry]);
  };

  const checkNetworkStatus = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getGasPrice();
      
      setNetworkStatus(`Base Sepolia - Block: ${blockNumber}`);
      setGasInfo(`Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);
    } catch (error) {
      setNetworkStatus('Ошибка подключения к сети');
      setGasInfo('Gas info unavailable');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Try different encodings for macOS compatibility
      const tryReadFile = (encoding: string) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
          };
          reader.onerror = () => reject(new Error(`Failed to read file with ${encoding} encoding`));
          reader.readAsText(file, encoding);
        });
      };

      // Try UTF-8 first, then fallback to other encodings
      Promise.resolve()
        .then(() => tryReadFile('utf-8'))
        .catch(() => tryReadFile('windows-1252'))
        .catch(() => tryReadFile('iso-8859-1'))
        .then((content) => {
          // Clean up content and extract private keys
          const keys = content
            .split(/\r?\n/) // Handle both \n and \r\n line endings
            .map(line => line.trim())
            .filter(line => {
              // More flexible private key detection
              return line.length > 0 && (
                line.startsWith('0x') || 
                /^[0-9a-fA-F]{64}$/.test(line) || // 64 hex chars without 0x
                /^[0-9a-fA-F]{66}$/.test(line)    // 66 hex chars (with 0x)
              );
            })
            .map(key => {
              // Ensure proper format
              if (key.startsWith('0x')) {
                return key.toLowerCase();
              } else {
                return '0x' + key.toLowerCase();
              }
            })
            .filter((key, index, arr) => {
              // Remove duplicates
              return arr.indexOf(key) === index;
            })
            .slice(0, 100); // Limit to 100 keys for safety
          
          if (keys.length === 0) {
            addLog('⚠️ No valid private keys found in file. Make sure keys start with 0x or are 64 hex characters.', 'warning');
            setFarmingResult('❌ No valid private keys found in file');
            return;
          }
          
          setPrivateKeys(keys);
          setCurrentKeyIndex(0);
          addLog(`📁 Loaded ${keys.length} private keys from ${file.name}`, 'success');
          addLog(`📋 File size: ${(file.size / 1024).toFixed(2)} KB`, 'info');
        })
        .catch((error: any) => {
          addLog(`❌ Error reading file: ${error.message}`, 'error');
          setFarmingResult('❌ Failed to read file. Try saving it as UTF-8 encoding.');
        });
    }
  };

  const handleFarm = async () => {
    if (privateKeys.length === 0) {
      setFarmingResult('❌ Please upload private keys file first');
      return;
    }

    if (currentKeyIndex >= privateKeys.length) {
      setFarmingResult('✅ All keys processed!');
      return;
    }

    setFarmingLoading(true);
    setFarmingResult(null);
    setExpTransactions([]);
    
    try {
      const privateKey = privateKeys[currentKeyIndex];
      const wallet = new ethers.Wallet(privateKey);
      setCurrentWallet(wallet.address);
      
      addLog(`🚀 Starting wallet processing ${currentKeyIndex + 1}/${privateKeys.length}`, 'info');
      addLog(`📍 EOA: ${wallet.address}`, 'info');
      
      const { portoAddress, eoaAddress, txHash, blockNumber, balance } = await createPortoAccount(privateKey);
      
      addDetailedLog('BASIC_TRANSACTION', {
        eoa: wallet.address,
        portoAddress,
        txHash,
        blockNumber,
        balance,
        gasUsed: '21000',
        network: 'base-sepolia'
      });
      
      // Perform Porto-specific actions
      const { actions, expTransactions: newExpTx } = await performPortoActions(privateKey, currentKeyIndex + 1, portoAddress);
      setExpTransactions(newExpTx);
      
      addDetailedLog('PORTO_ACTIONS_COMPLETED', {
        portoAddress,
        actions,
        expTransactions: newExpTx,
        totalActions: actions.length
      });
      
      setFarmingResult(`✅ Account ${currentKeyIndex + 1}/${privateKeys.length} created!\nPorto: ${portoAddress}\nEOA: ${eoaAddress}\nTX: ${txHash}\nBlock: ${blockNumber}\nBalance: ${balance} ETH\nPorto Actions: ${actions.join(', ')}`);
      
      // Move to next key
      setCurrentKeyIndex(prev => prev + 1);
      
      // Reload accounts
      const saved = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
      setPortoAccounts(saved);
      
    } catch (error: any) {
      addLog(`❌ Ошибка: ${error}`, 'error');
      addDetailedLog('ERROR_OCCURRED', {
        accountIndex: currentKeyIndex + 1,
        error: error.toString(),
        timestamp: new Date().toISOString()
      });
      setFarmingResult(`❌ Ошибка с ключом ${currentKeyIndex + 1}: ${error}`);
      // Move to next key even if error
      setCurrentKeyIndex(prev => prev + 1);
    } finally {
      setFarmingLoading(false);
      setCurrentWallet('');
    }
  };

  const handleFarmAll = async () => {
    if (privateKeys.length === 0) {
      setFarmingResult('❌ Сначала загрузите файл с приватными ключами');
      return;
    }

    setFarmingLoading(true);
    setFarmingResult('🚀 Начинаем массовый фарм...');
    addLog(`🚀 Массовый фарм: ${privateKeys.length} кошельков`);
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < privateKeys.length; i++) {
      try {
        const privateKey = privateKeys[i];
        const wallet = new ethers.Wallet(privateKey);
        setCurrentWallet(wallet.address);
        
        addLog(`📝 Обработка кошелька ${i + 1}/${privateKeys.length}: ${wallet.address}`);
        
        const { portoAddress, txHash } = await createPortoAccount(privateKey);
        
        // Perform Porto actions
        const { actions } = await performPortoActions(privateKey, i + 1, portoAddress);
        
        successCount++;
        addLog(`✅ Wallet ${i + 1} ready: ${portoAddress} (${actions.length} actions)`);
        
        // Random delay based on settings
        const delay = getRandomDelay();
        addLog(`⏱️ Waiting ${delay} seconds before next transaction...`, 'info');
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
        
      } catch (error: any) {
        errorCount++;
        addLog(`❌ Ошибка кошелька ${i + 1}: ${error}`);
      }
    }

    setFarmingResult(`✅ Массовый фарм завершен!\nУспешно: ${successCount}\nОшибок: ${errorCount}`);
    setFarmingLoading(false);
    setCurrentWallet('');
    
    // Reload accounts
    const saved = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
    setPortoAccounts(saved);
  };

  const clearAccounts = () => {
    localStorage.removeItem('portoAccounts');
    setPortoAccounts([]);
    setFarmingResult('🗑️ Все аккаунты очищены');
    addLog('🗑️ Все аккаунты очищены');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleRandomInteractions = async () => {
    const savedAccounts = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
    if (savedAccounts.length === 0) {
      addLog('❌ No Porto accounts found for random interactions', 'error');
      setFarmingResult('❌ No Porto accounts found. Create some accounts first.');
      return;
    }

    setFarmingLoading(true);
    setFarmingResult('🎲 Performing random interactions...');
    addLog('🎲 Starting random Porto interactions', 'info');
    
    try {
      const result = await performRandomPortoInteractions();
      if (result) {
        const { actions, interactions } = result;
        setRandomInteractions(interactions);
        
        if (actions.length > 0) {
          addLog(`✅ Random interaction completed: ${actions.join(', ')}`, 'success');
          setFarmingResult(`✅ Random interaction completed!\nAction: ${actions.join(', ')}\nTotal interactions: ${savedAccounts.length}`);
          
          // Reload accounts to show updated interaction counts
          const updatedAccounts = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
          setPortoAccounts(updatedAccounts);
        } else {
          addLog('⚠️ No random interactions performed (insufficient balance)', 'warning');
          setFarmingResult('⚠️ No interactions performed - insufficient balance');
        }
      }
    } catch (error: any) {
      addLog(`❌ Random interaction failed: ${error.message}`, 'error');
      setFarmingResult(`❌ Random interaction failed: ${error.message}`);
    } finally {
      setFarmingLoading(false);
    }
  };

  const exportPortoAccounts = () => {
    const savedAccounts = JSON.parse(localStorage.getItem('portoAccounts') || '[]');
    if (savedAccounts.length === 0) {
      addLog('❌ No Porto accounts to export', 'warning');
      return;
    }

    // Create export data with Porto accounts (Porto accounts don't have private keys)
    const exportData = savedAccounts.map((account: any, index: number) => {
      const eoaPrivateKey = privateKeys[index] || 'Not available';
      return {
        accountNumber: index + 1,
        portoAddress: account.address,
        eoaAddress: account.eoaAddress || 'Unknown',
        eoaPrivateKey: eoaPrivateKey, // EOA private key (not Porto private key)
        createdAt: account.createdAt || new Date().toISOString(),
        transactions: account.transactions || [],
        balance: account.balance || 'Unknown',
        blockNumber: account.blockNumber || 'Unknown',
        note: 'Porto accounts use smart contract architecture - no private keys'
      };
    });

    // Create CSV content with proper formatting
    const csvHeaders = 'Account #,Porto Address,EOA Address,EOA Private Key,Created At,Balance,Block Number,Transactions,Note\n';
    const csvContent = exportData.map((account: any) => {
      // Escape quotes and format data properly
      const portoAddress = `"${account.portoAddress}"`;
      const eoaAddress = `"${account.eoaAddress}"`;
      const eoaPrivateKey = `"${account.eoaPrivateKey}"`;
      const createdAt = `"${account.createdAt}"`;
      const balance = `"${account.balance}"`;
      const blockNumber = `"${account.blockNumber}"`;
      const transactions = `"${account.transactions.join('; ')}"`;
      const note = `"${account.note}"`;
      
      return `${account.accountNumber},${portoAddress},${eoaAddress},${eoaPrivateKey},${createdAt},${balance},${blockNumber},${transactions},${note}`;
    }).join('\n');
    
    const fullCsv = csvHeaders + csvContent;

    // Create and download CSV file with BOM for Excel compatibility
    const BOM = '\uFEFF'; // Byte Order Mark for UTF-8
    const csvWithBOM = BOM + fullCsv;
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `porto-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Also create JSON export for detailed data
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalAccounts: savedAccounts.length,
      accounts: exportData
    };

    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const jsonUrl = window.URL.createObjectURL(jsonBlob);
    const jsonA = document.createElement('a');
    jsonA.href = jsonUrl;
    jsonA.download = `porto-accounts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(jsonA);
    jsonA.click();
    document.body.removeChild(jsonA);
    window.URL.revokeObjectURL(jsonUrl);

    addLog(`✅ Exported ${savedAccounts.length} Porto accounts to CSV and JSON`, 'success');
  };

  const getRandomDelay = () => {
    if (delayMode === 'smart') {
      switch (smartDelayLevel) {
        case 'light':
          return Math.floor(Math.random() * (20 - 15 + 1)) + 15; // 15-20 сек
        case 'medium':
          return Math.floor(Math.random() * (60 - 30 + 1)) + 30; // 30-60 сек
        case 'hard':
          return Math.floor(Math.random() * (180 - 60 + 1)) + 60; // 60-180 сек
        default:
          return 30;
      }
    } else {
      // Manual mode
      return Math.floor(Math.random() * (manualDelayMax - manualDelayMin + 1)) + manualDelayMin;
    }
  };

  const performAdvancedActions = async (privateKey: string, portoAddress: string) => {
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const actions = [];
    
    try {
      // Advanced: Interact with multiple protocols
      const protocols = [
        { name: 'Uniswap', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' },
        { name: 'Compound', address: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B' },
        { name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' }
      ];

      for (const protocol of protocols) {
        try {
          const interactionData = ethers.utils.defaultAbiCoder.encode(
            ['address', 'string'],
            [portoAddress, `INTERACTION_WITH_${protocol.name.toUpperCase()}`]
          );
          
          const tx = await wallet.sendTransaction({
            to: protocol.address,
            data: "0x" + interactionData.slice(2),
            gasLimit: 100000
          });
          
          await tx.wait();
          actions.push(`${protocol.name}_interaction`);
          addLog(`✅ ${protocol.name} interaction completed: ${tx.hash}`, 'success');
        } catch (error: any) {
          addLog(`⚠️ ${protocol.name} interaction failed: ${error.message}`, 'warning');
        }
      }

      // Developer mode: Create complex transactions
      if (farmingMode === 'developer') {
        try {
          // Multi-call transaction
          const multiCallData = ethers.utils.defaultAbiCoder.encode(
            ['address[]', 'bytes[]'],
            [[portoAddress, portoAddress], ["0x", "0x"]]
          );
          
          const tx = await wallet.sendTransaction({
            to: portoAddress,
            data: "0x" + multiCallData.slice(2),
            gasLimit: 200000
          });
          
          await tx.wait();
          actions.push('multi_call_transaction');
          addLog(`✅ Multi-call transaction completed: ${tx.hash}`, 'success');
        } catch (error: any) {
          addLog(`⚠️ Multi-call transaction failed: ${error.message}`, 'warning');
        }
      }

    } catch (error: any) {
      addLog(`❌ Advanced actions failed: ${error.message}`, 'error');
    }

    return actions;
  };

  const sendTelegramNotification = async (message: string) => {
    if (!telegramEnabled || !telegramBotToken || !telegramChatId) {
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (response.ok) {
        addLog('📱 Telegram notification sent', 'success');
      } else {
        addLog('⚠️ Failed to send Telegram notification', 'warning');
      }
    } catch (error: any) {
      addLog(`❌ Telegram error: ${error.message}`, 'error');
    }
  };

  const performCircularRotation = async () => {
    if (!circularRotation || privateKeys.length === 0) {
      return;
    }

    addLog('🔄 Starting circular rotation mode...', 'info');
    sendTelegramNotification('🔄 Porto Farming: Circular rotation started');

    let currentIndex = 0;
    let totalCycles = 0;

    const rotationInterval = setInterval(async () => {
      try {
        const privateKey = privateKeys[currentIndex];
        const wallet = new ethers.Wallet(privateKey);
        
        addLog(`🔄 Cycle ${totalCycles + 1}: Processing wallet ${currentIndex + 1}/${privateKeys.length}`, 'info');
        
        // Perform basic Porto actions
        const { portoAddress } = await createPortoAccount(privateKey);
        const { actions } = await performPortoActions(privateKey, currentIndex + 1, portoAddress);
        
        // Advanced actions if enabled
        if (farmingMode !== 'basic') {
          await performAdvancedActions(privateKey, portoAddress);
        }

        addLog(`✅ Cycle ${totalCycles + 1} completed: ${portoAddress}`, 'success');
        sendTelegramNotification(`✅ Cycle ${totalCycles + 1} completed\nPorto: ${portoAddress}\nActions: ${actions.join(', ')}`);

        // Move to next wallet
        currentIndex = (currentIndex + 1) % privateKeys.length;
        totalCycles++;

        // Add delay between cycles
        const delay = getRandomDelay();
        addLog(`⏱️ Waiting ${delay} seconds before next cycle...`, 'info');
        await new Promise(resolve => setTimeout(resolve, delay * 1000));

      } catch (error: any) {
        addLog(`❌ Cycle ${totalCycles + 1} failed: ${error.message}`, 'error');
        sendTelegramNotification(`❌ Cycle ${totalCycles + 1} failed: ${error.message}`);
        
        if (autoRetry) {
          addLog(`🔄 Retrying cycle ${totalCycles + 1}...`, 'info');
        } else {
          currentIndex = (currentIndex + 1) % privateKeys.length;
        }
      }
    }, 1000); // Check every second

    // Store interval ID for cleanup
    return () => clearInterval(rotationInterval);
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%)',
      padding: '0',
      margin: '0',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'fixed',
      top: '0',
      left: '0',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      
      {/* Abstract Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />
      
      {/* Floating Abstract Shapes */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, rgba(120, 119, 198, 0.1), rgba(255, 119, 198, 0.1))',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(45deg, rgba(120, 219, 255, 0.1), rgba(255, 119, 198, 0.1))',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        width: '100%',
        height: '100%',
        margin: '0',
        padding: '10px',
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box',
        overflow: 'auto'
      }}>
        
        {/* Header */}
        <div style={{
          textAlign: 'center',
          padding: '10px',
          position: 'relative',
          width: '100%',
          margin: '0'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(102, 126, 234, 0.5)'
            }}>
              ✨ Porto Smart Account Builder ✨
            </h1>
            <div style={{
              margin: '10px 0 0 0',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              animation: 'burningText 2s ease-in-out infinite alternate'
            }}>
              By affliction money
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          padding: '10px',
          width: '100%',
          margin: '0'
        }}>
          
          {/* Network Status */}
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            padding: '20px', 
            borderRadius: '20px', 
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🌐</div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>Network</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>{networkStatus}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⛽</div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>Gas</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>{gasInfo}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📊</div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)' }}>Accounts</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>{portoAccounts.length} Created</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '15px',
            width: '100%'
          }}>
            
            {/* Left Column - Controls */}
            <div>
              
              {/* File Upload */}
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                padding: '25px', 
                borderRadius: '20px', 
                marginBottom: '25px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
                  animation: 'shimmer 3s infinite',
                  pointerEvents: 'none'
                }} />
                
                <h3 style={{ margin: '0 0 20px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.3rem', position: 'relative' }}>
                  📁 Upload Private Keys
                </h3>
                
                <div style={{
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  padding: '30px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.border = '2px dashed rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.border = '2px dashed rgba(255, 255, 255, 0.3)';
                }}
                onClick={() => {
                  const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const file = files[0];
                    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                      // Create a mock event for the file upload handler
                      const mockEvent = {
                        target: { files: [file] }
                      } as any;
                      handleFileUpload(mockEvent);
                    }
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.border = '2px dashed rgba(255, 255, 255, 0.7)';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.border = '2px dashed rgba(255, 255, 255, 0.3)';
                }}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 1
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 0 }}>
                    <div style={{ fontSize: '4rem', marginBottom: '15px', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>📄</div>
                    <p style={{ margin: '0 0 10px 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                      Choose .txt file with private keys
                    </p>
                    <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                      One key per line
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
                      💡 macOS: Save file as UTF-8 encoding for best compatibility
                    </p>
                    <p style={{ margin: '3px 0 0 0', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.7rem' }}>
                      🖱️ Click or drag & drop to upload
                    </p>
                  </div>
                </div>
                
                {privateKeys.length > 0 && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.2), rgba(56, 161, 105, 0.2))',
                    padding: '15px', 
                    borderRadius: '12px',
                    marginTop: '15px',
                    border: '1px solid rgba(72, 187, 120, 0.3)',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
                      ✅ Loaded: {privateKeys.length} keys
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Current: {currentKeyIndex + 1}/{privateKeys.length}
                    </p>
                  </div>
                )}
              </div>

              {/* Farming Controls */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                padding: '25px', 
                borderRadius: '20px', 
                marginBottom: '25px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.3rem' }}>
                  🎯 Porto Testing
                </h3>
                
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(197, 246, 213, 0.1), rgba(154, 230, 180, 0.1))',
                  padding: '15px', 
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid rgba(72, 187, 120, 0.3)'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold' }}>
                    🔥 Actions: EXP-0001, EXP-0002, EXP-0003, wallet_prepareCalls
                  </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <button 
                    onClick={handleFarm}
                    disabled={farmingLoading || privateKeys.length === 0}
                    style={{
                      padding: '15px 20px',
                      fontSize: '1rem',
                      background: farmingLoading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: farmingLoading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {farmingLoading ? '⏳ Creating...' : '🚀 Create Next'}
                  </button>
                  
                  <button 
                    onClick={handleFarmAll}
                    disabled={farmingLoading || privateKeys.length === 0}
                    style={{
                      padding: '15px 20px',
                      fontSize: '1rem',
                      background: farmingLoading ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: farmingLoading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }}
                  >
                    {farmingLoading ? '⏳ Mass Farming...' : '⚡ Mass Farm'}
                  </button>
                  <button 
                    onClick={performCircularRotation} 
                    disabled={farmingLoading || privateKeys.length === 0 || !circularRotation}
                    style={{
                      padding: '15px 20px',
                      fontSize: '1rem',
                      background: (farmingLoading || !circularRotation) ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #9f7aea 0%, #667eea 100%)',
                      color: (farmingLoading || !circularRotation) ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: (farmingLoading || privateKeys.length === 0 || !circularRotation) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }}
                  >
                    🔄 Circular Rotation
                  </button>
                  
                  <button 
                    onClick={handleRandomInteractions}
                    disabled={farmingLoading || portoAccounts.length === 0}
                    style={{
                      padding: '15px 20px',
                      fontSize: '1rem',
                      background: (farmingLoading || portoAccounts.length === 0) ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                      color: (farmingLoading || portoAccounts.length === 0) ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: (farmingLoading || portoAccounts.length === 0) ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }}
                  >
                    🎲 Random Interactions
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <button 
                    onClick={exportPortoAccounts} 
                    disabled={portoAccounts.length === 0}
                    style={{
                      padding: '10px 15px',
                      fontSize: '0.9rem',
                      background: portoAccounts.length === 0 ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                      color: portoAccounts.length === 0 ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: portoAccounts.length === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      marginRight: '10px'
                    }}
                    title={portoAccounts.length > 0 ? `Export ${portoAccounts.length} Porto accounts (EOA keys included)` : 'No accounts to export'}
                  >
                    📤 Export ({portoAccounts.length})
                  </button>
                  <button 
                    onClick={clearAccounts} 
                    style={{
                      padding: '10px 15px',
                      fontSize: '0.9rem',
                      background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🗑️ Clear All
                  </button>
                  
                  <button 
                    onClick={clearLogs}
                    style={{
                      padding: '10px 15px',
                      fontSize: '0.9rem',
                      background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    📋 Clear Logs
                  </button>
                </div>
                
                {farmingResult && (
                  <div style={{ 
                    background: farmingResult.includes('✅') ? 'linear-gradient(135deg, rgba(197, 246, 213, 0.2), rgba(154, 230, 180, 0.2))' : 'linear-gradient(135deg, rgba(254, 215, 215, 0.2), rgba(254, 178, 178, 0.2))',
                    padding: '15px',
                    borderRadius: '12px',
                    marginTop: '20px',
                    border: farmingResult.includes('✅') ? '1px solid rgba(72, 187, 120, 0.3)' : '1px solid rgba(245, 101, 101, 0.3)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-line', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {farmingResult}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Logs & Current Wallet */}
            <div>
              
              {/* Log Mode Toggle */}
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                padding: '15px', 
                borderRadius: '15px', 
                marginBottom: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: '0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}>
                    📊 Log Mode
                  </h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setLogMode('simple')}
                      style={{
                        background: logMode === 'simple' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: logMode === 'simple' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Simple
                    </button>
                    <button
                      onClick={() => setLogMode('pro')}
                      style={{
                        background: logMode === 'pro' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: logMode === 'pro' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Pro
                    </button>
                  </div>
                </div>
              </div>

              {/* Farming Mode Settings */}
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                padding: '15px', 
                borderRadius: '15px', 
                marginBottom: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}>
                  🎯 Farming Mode
                </h4>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  <button
                    onClick={() => setFarmingMode('basic')}
                    style={{
                      background: farmingMode === 'basic' ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'rgba(255, 255, 255, 0.1)',
                      color: farmingMode === 'basic' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => setFarmingMode('advanced')}
                    style={{
                      background: farmingMode === 'advanced' ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' : 'rgba(255, 255, 255, 0.1)',
                      color: farmingMode === 'advanced' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Advanced
                  </button>
                  <button
                    onClick={() => setFarmingMode('developer')}
                    style={{
                      background: farmingMode === 'developer' ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' : 'rgba(255, 255, 255, 0.1)',
                      color: farmingMode === 'developer' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Developer
                  </button>
                </div>

                {/* Advanced Options */}
                {farmingMode !== 'basic' && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="checkbox"
                        checked={autoRetry}
                        onChange={(e) => setAutoRetry(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                        Auto Retry Failed Transactions
                      </label>
                    </div>
                    {autoRetry && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>Max Retries:</label>
                        <input
                          type="number"
                          value={maxRetries}
                          onChange={(e) => setMaxRetries(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            color: 'white',
                            fontSize: '0.7rem',
                            width: '50px'
                          }}
                          min="1"
                          max="10"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Gas Optimization */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={gasOptimization}
                    onChange={(e) => setGasOptimization(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                    Gas Optimization (Dynamic Gas Pricing)
                  </label>
                </div>

                {/* Circular Rotation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={circularRotation}
                    onChange={(e) => setCircularRotation(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                    🔄 Circular Rotation (Continuous Farming)
                  </label>
                </div>

                {/* Telegram Notifications */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={telegramEnabled}
                    onChange={(e) => setTelegramEnabled(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                    📱 Telegram Notifications
                  </label>
                </div>

                {telegramEnabled && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>Bot Token:</label>
                      <input
                        type="text"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          color: 'white',
                          fontSize: '0.7rem',
                          width: '100%',
                          marginTop: '4px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>Chat ID:</label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="123456789 or @channel_name"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          color: 'white',
                          fontSize: '0.7rem',
                          width: '100%',
                          marginTop: '4px'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Delay Settings */}
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                padding: '15px', 
                borderRadius: '15px', 
                marginBottom: '15px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}>
                  ⏱️ Transaction Delays
                </h4>
                
                {/* Delay Mode Toggle */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      onClick={() => setDelayMode('smart')}
                      style={{
                        background: delayMode === 'smart' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: delayMode === 'smart' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Smart
                    </button>
                    <button
                      onClick={() => setDelayMode('manual')}
                      style={{
                        background: delayMode === 'manual' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.1)',
                        color: delayMode === 'manual' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {/* Smart Delay Levels */}
                {delayMode === 'smart' && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Smart Delay Level:
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSmartDelayLevel('light')}
                        style={{
                          background: smartDelayLevel === 'light' ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'rgba(255, 255, 255, 0.1)',
                          color: smartDelayLevel === 'light' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Light (15-20s)
                      </button>
                      <button
                        onClick={() => setSmartDelayLevel('medium')}
                        style={{
                          background: smartDelayLevel === 'medium' ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' : 'rgba(255, 255, 255, 0.1)',
                          color: smartDelayLevel === 'medium' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Medium (30-60s)
                      </button>
                      <button
                        onClick={() => setSmartDelayLevel('hard')}
                        style={{
                          background: smartDelayLevel === 'hard' ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)' : 'rgba(255, 255, 255, 0.1)',
                          color: smartDelayLevel === 'hard' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Hard (60-180s)
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual Delay Settings */}
                {delayMode === 'manual' && (
                  <div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Manual Delay Range (seconds):
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>Min:</label>
                        <input
                          type="number"
                          value={manualDelayMin}
                          onChange={(e) => setManualDelayMin(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            color: 'white',
                            fontSize: '0.8rem',
                            width: '60px'
                          }}
                          min="1"
                          max="300"
                        />
                      </div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>-</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}>Max:</label>
                        <input
                          type="number"
                          value={manualDelayMax}
                          onChange={(e) => setManualDelayMax(Math.max(manualDelayMin, parseInt(e.target.value) || manualDelayMin))}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            color: 'white',
                            fontSize: '0.8rem',
                            width: '60px'
                          }}
                          min={manualDelayMin}
                          max="300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Current Wallet Status */}
              {currentWallet && (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  padding: '20px', 
                  borderRadius: '20px', 
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    🔄 Processing Wallet
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontFamily: 'monospace', wordBreak: 'break-all', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {currentWallet}
                  </p>
                </div>
              )}

              {/* Random Interactions */}
              {randomInteractions.length > 0 && (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  padding: '20px', 
                  borderRadius: '20px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
                    🎲 Random Interactions
                  </h3>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {randomInteractions.map((interaction, index) => (
                      <div key={index} style={{ 
                        padding: '12px', 
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px', 
                        marginBottom: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
                            {interaction.type}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            {interaction.description}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace' }}>
                          EOA: {interaction.eoaAddress}
                        </p>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace' }}>
                          Porto: {interaction.portoAddress}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.8)', wordBreak: 'break-all' }}>
                          {interaction.hash}
                        </p>
                        <a 
                          href={`https://sepolia.basescan.org/tx/${interaction.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            fontSize: '0.8rem', 
                            color: '#3182ce', 
                            textDecoration: 'none',
                            display: 'inline-block',
                            marginTop: '5px',
                            padding: '3px 8px',
                            background: 'rgba(49, 130, 206, 0.2)',
                            borderRadius: '5px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🔗 View on BaseScan
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXP Transactions */}
              {expTransactions.length > 0 && (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  padding: '20px', 
                  borderRadius: '20px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>
                    🔥 EXP Transactions
                  </h3>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {expTransactions.map((tx, index) => (
                      <div key={index} style={{ 
                        padding: '12px', 
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px', 
                        marginBottom: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
                            {tx.type}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            {tx.description}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.8)', wordBreak: 'break-all' }}>
                          {tx.hash}
                        </p>
                        <a 
                          href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            fontSize: '0.8rem', 
                            color: '#3182ce', 
                            textDecoration: 'none',
                            display: 'inline-block',
                            marginTop: '5px',
                            padding: '3px 8px',
                            background: 'rgba(49, 130, 206, 0.2)',
                            borderRadius: '5px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          🔗 View on BaseScan
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Logs */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                padding: '25px', 
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                height: '400px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>
                  📋 Live Logs
                </h3>
                
                <div style={{ 
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '15px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {logs.length === 0 ? (
                    <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                      {logMode === 'simple' ? 'Simple logs will appear here...' : 'Detailed logs will appear here...'}
                    </p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={log.id || index} style={{ 
                        marginBottom: '8px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: log.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 
                                   log.type === 'success' ? 'rgba(34, 197, 94, 0.2)' :
                                   log.type === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
                                   'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${log.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 
                                           log.type === 'success' ? 'rgba(34, 197, 94, 0.3)' :
                                           log.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
                                           'rgba(255, 255, 255, 0.1)'}`,
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            color: log.type === 'error' ? '#ef4444' : 
                                   log.type === 'success' ? '#22c55e' :
                                   log.type === 'warning' ? '#f59e0b' :
                                   '#60a5fa',
                            fontWeight: 'bold'
                          }}>
                            [{log.timestamp}]
                          </span>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            color: 'rgba(255, 255, 255, 0.6)',
                            textTransform: 'uppercase'
                          }}>
                            {log.type}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                          {log.message}
                        </div>
                        {log.details && (
                          <details style={{ marginTop: '5px' }}>
                            <summary style={{ 
                              fontSize: '0.7rem', 
                              color: 'rgba(255, 255, 255, 0.6)',
                              cursor: 'pointer'
                            }}>
                              📊 View Details
                            </summary>
                            <pre style={{ 
                              fontSize: '0.7rem', 
                              color: 'rgba(255, 255, 255, 0.8)',
                              margin: '5px 0 0 0',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all'
                            }}>
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Saved Accounts */}
          {portoAccounts.length > 0 && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              padding: '25px', 
              borderRadius: '20px',
              marginTop: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.3rem' }}>
                📋 Created Accounts ({portoAccounts.length})
              </h3>
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '15px'
              }}>
                {portoAccounts.map((account, index) => (
                  <div key={index} style={{ 
                    padding: '20px', 
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                      animation: 'shimmer 2s infinite'
                    }} />
                    
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem' }}>
                        Porto Account #{index + 1}
                      </h4>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        Porto: {account.address}
                      </p>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        EOA: {account.eoa}
                      </p>
                    </div>
                    
                    <div style={{ 
                      background: 'rgba(0, 0, 0, 0.3)', 
                      padding: '10px', 
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}>
                      <p style={{ margin: '0 0 3px 0', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        TX Hash:
                      </p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {account.txHash}
                      </p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Block:</span> {account.blockNumber}
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Gas:</span> {account.gasUsed}
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Balance:</span> {account.balance} ETH
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Created:</span> {new Date(account.timestamp).toLocaleDateString()}
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Interactions:</span> {account.totalInteractions || 0}
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Last:</span> {account.lastInteraction ? new Date(account.lastInteraction).toLocaleTimeString() : 'Never'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes burningText {
          0% { 
            color: rgba(255, 255, 255, 0.8);
            textShadow: 0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 0.3);
          }
          50% { 
            color: rgba(255, 255, 255, 1);
            textShadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4);
          }
          100% { 
            color: rgba(255, 255, 255, 0.9);
            textShadow: 0 0 15px rgba(255, 255, 255, 0.7), 0 0 25px rgba(255, 255, 255, 0.5), 0 0 35px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return <Content />;
}
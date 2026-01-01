import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { sepolia, polygonAmoy } from 'wagmi/chains';
import { parseEther, parseUnits, erc20Abi, Address } from 'viem';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { ArrowLeft, Wallet, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { POPULAR_TOKENS, TokenConfig } from '../lib/popularTokens';
import QRCode from 'qrcode';

type Blockchain = 'ethereum' | 'polygon' | 'solana' | 'bitcoin';

interface UniversalCryptoTipProps {
  onBack: () => void;
}

export default function UniversalCryptoTip({ onBack }: UniversalCryptoTipProps) {
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btcQrCode, setBtcQrCode] = useState('');

  // get receiving addresses from env
  const receivingAddresses = useMemo(() => ({
    ethereum: import.meta.env.VITE_ETH_ADDRESS || '',
    polygon: import.meta.env.VITE_ETH_ADDRESS || '', // same address for polygon
    solana: import.meta.env.VITE_SOL_ADDRESS || '',
    bitcoin: import.meta.env.VITE_BTC_ADDRESS || '',
  }), []);

  // ethereum wallet hooks
  const { address: ethAddress, isConnected: isEthConnected, chain, chainId } = useAccount();
  const { connectors, connect: connectEth } = useConnect();
  const { disconnect: disconnectEth } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  // map blockchain selection to expected chain
  const expectedChain = useMemo(() => {
    if (selectedBlockchain === 'ethereum') return sepolia;
    if (selectedBlockchain === 'polygon') return polygonAmoy;
    return null;
  }, [selectedBlockchain]);
  const { data: ethHash, sendTransaction: sendEthTransaction, isPending: isEthSending, error: ethSendError, reset: resetEthTransaction } = useSendTransaction();
  const { isLoading: isEthConfirming, isSuccess: isEthSuccess } = useWaitForTransactionReceipt({ hash: ethHash });
  const { writeContract, data: contractHash, isPending: isContractSending, error: contractError, reset: resetContract } = useWriteContract();
  const { isLoading: isContractConfirming, isSuccess: isContractSuccess } = useWaitForTransactionReceipt({ hash: contractHash });

  // solana wallet hooks
  const { publicKey: solAddress, connected: isSolConnected, connect: connectSol, disconnect: disconnectSol, wallet, wallets, select } = useWallet();
  const { connection } = useConnection();
  const [isSolSending, setIsSolSending] = useState(false);
  const [solHash, setSolHash] = useState<string | null>(null);
  const [isSolSuccess, setIsSolSuccess] = useState(false);

  const isEVM = selectedBlockchain === 'ethereum' || selectedBlockchain === 'polygon';
  const isSol = selectedBlockchain === 'solana';
  const isBtc = selectedBlockchain === 'bitcoin';
  const isConnected = isEVM ? isEthConnected : isSolConnected;
   
  // detect solana network from endpoint
  const solanaNetwork = useMemo(() => {
    const endpoint = import.meta.env.VITE_SOLANA_ENDPOINT || 'https://api.devnet.solana.com';
    if (endpoint.includes('devnet')) return 'Devnet (Testnet)';
    if (endpoint.includes('testnet')) return 'Testnet';
    if (endpoint.includes('mainnet')) return 'Mainnet';
    return 'Unknown';
  }, []);
  
  // format network name for display
  const currentNetwork = useMemo(() => {
    if (isEVM && chain) {
      const name = chain.name || 'Unknown';
      // check if it's a testnet (common testnet indicators)
      const isTestnet = name.toLowerCase().includes('testnet') || 
                       name.toLowerCase().includes('sepolia') || 
                       name.toLowerCase().includes('amoy') ||
                       name.toLowerCase().includes('fuji');
      return `${name}${isTestnet ? ' (Testnet)' : ' (Mainnet)'}`;
    }
    if (isSol) {
      return `Solana ${solanaNetwork}`;
    }
    return null;
  }, [isEVM, isSol, chain, solanaNetwork]);
  
  // check if wallet network matches expected network
  const networkMismatch = useMemo(() => {
    if (!isEVM || !isConnected || !expectedChain) return false;
    
    // if chain is undefined, check chainId directly
    // mainnet chainId is 1, sepolia is 11155111
    if (!chain && chainId) {
      // if we have a chainId but no chain object, it's likely an unsupported network
      // mainnet = 1, sepolia = 11155111, polygon amoy = 80002
      const isSepolia = chainId === 11155111;
      const isPolygonAmoy = chainId === 80002;
      
      if (selectedBlockchain === 'ethereum' && !isSepolia) return true;
      if (selectedBlockchain === 'polygon' && !isPolygonAmoy) return true;
      return false;
    }
    
    if (!chain) return false; // no chain info available
    return chain.id !== expectedChain.id;
  }, [isEVM, isConnected, chain, chainId, expectedChain, selectedBlockchain]);
  const isSending = isEVM ? (isEthSending || isContractSending) : isSolSending;
  const isConfirming = isEVM ? (isEthConfirming || isContractConfirming) : false;
  const isSuccess = isEVM ? (isEthSuccess || isContractSuccess) : isSolSuccess;
  const hash = isEVM ? (ethHash || contractHash) : solHash;
  const sendError = isEVM ? (ethSendError || contractError) : null;
  
  // format error message for better user experience
  const formattedError = useMemo(() => {
    if (error) return error;
    if (!sendError) return null;
    
    const errorMessage = sendError.message || sendError.toString();
    const errorCode = 'code' in sendError ? (sendError as { code?: number }).code : undefined;
    
    // parse common error patterns
    if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
      return 'Insufficient balance. Please ensure you have enough tokens to cover the transaction amount and gas fees.';
    }
    if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
      return 'Transaction was rejected. Please try again if you want to proceed.';
    }
    if (errorMessage.includes('Internal JSON-RPC error') || errorCode === -32603) {
      // check if sending to yourself (same from/to address)
      if (errorMessage.includes('from:') && errorMessage.includes('to:') && 
          errorMessage.match(/from:\s*0x[\da-fA-F]+/)?.[0] === errorMessage.match(/to:\s*0x[\da-fA-F]+/)?.[0]) {
        return 'Cannot send to yourself. The receiving address matches your wallet address. Please update VITE_ETH_ADDRESS in your .env file with a different address.';
      }
      return 'Transaction failed. This usually means insufficient balance, network issues, or trying to send to yourself. Please check your wallet balance and receiving address.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (errorMessage.includes('nonce') || errorMessage.includes('Nonce')) {
      return 'Transaction nonce error. Please try again in a moment.';
    }
    
    // return original message if no pattern matches
    return errorMessage;
  }, [error, sendError]);
  
  // generate explorer URL for transaction
  const explorerUrl = useMemo(() => {
    if (!hash) return null;
    
    if (isSol) {
      // solana explorer
      const endpoint = import.meta.env.VITE_SOLANA_ENDPOINT || 'https://api.devnet.solana.com';
      if (endpoint.includes('devnet')) {
        return `https://explorer.solana.com/tx/${hash}?cluster=devnet`;
      }
      if (endpoint.includes('testnet')) {
        return `https://explorer.solana.com/tx/${hash}?cluster=testnet`;
      }
      return `https://explorer.solana.com/tx/${hash}`;
    }
    
    if (isEVM && chain) {
      // evm chain explorers
      const chainId = chain.id;
      const txHash = hash as string;
      
      // ethereum sepolia
      if (chainId === 11155111) {
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      }
      // ethereum mainnet
      if (chainId === 1) {
        return `https://etherscan.io/tx/${txHash}`;
      }
      // polygon amoy
      if (chainId === 80002) {
        return `https://amoy.polygonscan.com/tx/${txHash}`;
      }
      // polygon mainnet
      if (chainId === 137) {
        return `https://polygonscan.com/tx/${txHash}`;
      }
      // base sepolia
      if (chainId === 84532) {
        return `https://sepolia.basescan.org/tx/${txHash}`;
      }
      // base mainnet
      if (chainId === 8453) {
        return `https://basescan.org/tx/${txHash}`;
      }
      // arbitrum sepolia
      if (chainId === 421614) {
        return `https://sepolia.arbiscan.io/tx/${txHash}`;
      }
      // arbitrum mainnet
      if (chainId === 42161) {
        return `https://arbiscan.io/tx/${txHash}`;
      }
      // optimism sepolia
      if (chainId === 11155420) {
        return `https://sepolia-optimistic.etherscan.io/tx/${txHash}`;
      }
      // optimism mainnet
      if (chainId === 10) {
        return `https://optimistic.etherscan.io/tx/${txHash}`;
      }
      // avalanche fuji
      if (chainId === 43113) {
        return `https://testnet.snowtrace.io/tx/${txHash}`;
      }
      // avalanche mainnet
      if (chainId === 43114) {
        return `https://snowtrace.io/tx/${txHash}`;
      }
      // bsc testnet
      if (chainId === 97) {
        return `https://testnet.bscscan.com/tx/${txHash}`;
      }
      // bsc mainnet
      if (chainId === 56) {
        return `https://bscscan.com/tx/${txHash}`;
      }
      // fantom testnet
      if (chainId === 4002) {
        return `https://testnet.ftmscan.com/tx/${txHash}`;
      }
      // fantom mainnet
      if (chainId === 250) {
        return `https://ftmscan.com/tx/${txHash}`;
      }
      // zksync sepolia
      if (chainId === 300) {
        return `https://sepolia.explorer.zksync.io/tx/${txHash}`;
      }
      // zksync mainnet
      if (chainId === 324) {
        return `https://explorer.zksync.io/tx/${txHash}`;
      }
      // linea sepolia
      if (chainId === 59141) {
        return `https://sepolia.lineascan.build/tx/${txHash}`;
      }
      // linea mainnet
      if (chainId === 59144) {
        return `https://lineascan.build/tx/${txHash}`;
      }
      // scroll sepolia
      if (chainId === 534351) {
        return `https://sepolia.scrollscan.com/tx/${txHash}`;
      }
      // scroll mainnet
      if (chainId === 534352) {
        return `https://scrollscan.com/tx/${txHash}`;
      }
      // mantle sepolia
      if (chainId === 5003) {
        return `https://sepolia.explorer.mantle.xyz/tx/${txHash}`;
      }
      // mantle mainnet
      if (chainId === 5000) {
        return `https://explorer.mantle.xyz/tx/${txHash}`;
      }
      // blast sepolia
      if (chainId === 168587773) {
        return `https://sepolia.blastscan.io/tx/${txHash}`;
      }
      // blast mainnet
      if (chainId === 81457) {
        return `https://blastscan.io/tx/${txHash}`;
      }
    }
    
    // fallback: try to use chainId if chain object not available
    if (isEVM && chainId && hash) {
      // ethereum sepolia
      if (chainId === 11155111) {
        return `https://sepolia.etherscan.io/tx/${hash}`;
      }
      // ethereum mainnet
      if (chainId === 1) {
        return `https://etherscan.io/tx/${hash}`;
      }
    }
    
    return null;
  }, [hash, isSol, isEVM, chain, chainId]);
  
  // handle transaction errors and reset state
  useEffect(() => {
    if (ethSendError || contractError) {
      const error = ethSendError || contractError;
      const errorMessage = error?.message || error?.toString() || 'Transaction failed';
      
      // set error message for user (unless it's just a user rejection)
      if (!errorMessage.toLowerCase().includes('user rejected') && 
          !errorMessage.toLowerCase().includes('rejected the request')) {
        setError(errorMessage);
      }
      
      // reset transaction state after a delay
      const timer = setTimeout(() => {
        if (ethSendError) resetEthTransaction();
        if (contractError) resetContract();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [ethSendError, contractError, resetEthTransaction, resetContract]);
  
  // timeout for stuck transactions (30 seconds)
  useEffect(() => {
    if (isSending && !isConfirming) {
      const timer = setTimeout(() => {
        if (isEthSending) {
          setError('Transaction is taking too long. Please check your wallet or try again.');
          resetEthTransaction();
        }
        if (isContractSending) {
          setError('Transaction is taking too long. Please check your wallet or try again.');
          resetContract();
        }
      }, 30000); // 30 second timeout
      return () => clearTimeout(timer);
    }
  }, [isSending, isConfirming, isEthSending, isContractSending, resetEthTransaction, resetContract]);

  // generate bitcoin QR code
  const generateBtcQR = useCallback(async () => {
    if (!receivingAddresses.bitcoin || !amount) return;
    try {
      const btcUri = `bitcoin:${receivingAddresses.bitcoin}?amount=${amount}`;
      const qr = await QRCode.toDataURL(btcUri, { width: 300 });
      setBtcQrCode(qr);
    } catch (error) {
      console.error('Error generating BTC QR:', error);
    }
  }, [receivingAddresses.bitcoin, amount]);

  const handleSendTip = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!selectedBlockchain) {
      setError('Please select a blockchain');
      return;
    }

    // prevent transaction if network mismatch
    if (networkMismatch) {
      setError('Network mismatch detected. Please switch to the correct network before sending.');
      return;
    }

    const recipientAddress = receivingAddresses[selectedBlockchain];
    if (!recipientAddress) {
      setError('No receiving address configured for this blockchain');
      return;
    }

    // prevent sending to yourself
    if (isEVM && ethAddress && recipientAddress.toLowerCase() === ethAddress.toLowerCase()) {
      setError('Cannot send to yourself. Please configure a different receiving address in your .env file.');
      return;
    }
    if (isSol && solAddress && recipientAddress === solAddress.toString()) {
      setError('Cannot send to yourself. Please configure a different receiving address in your .env file.');
      return;
    }

    setError(null);

    try {
      if (isEVM) {
        // ethereum/polygon transaction
        if (!ethAddress) {
          setError('Please connect your wallet');
          return;
        }

        // check if native token or ERC20
        if (!selectedToken || selectedToken.contractAddress === 'native') {
          // native token transfer (ETH/MATIC)
          // sendEthTransaction triggers the wallet prompt - errors handled by hook
          sendEthTransaction({
            to: recipientAddress as Address,
            value: parseEther(amount),
          });
        } else {
          // ERC20 token transfer
          const amountInWei = parseUnits(amount, selectedToken.decimals);
          // writeContract triggers the wallet prompt - errors handled by hook
          writeContract({
            address: selectedToken.contractAddress as Address,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [recipientAddress as Address, amountInWei],
          });
        }
      } else if (isSol) {
        // solana transaction
        if (!solAddress) {
          setError('Please connect your wallet');
          return;
        }

        setIsSolSending(true);

        if (!selectedToken || selectedToken.contractAddress === 'native') {
          // native SOL transfer
          const recipientPubkey = new PublicKey(recipientAddress);
          const amountLamports = parseFloat(amount) * LAMPORTS_PER_SOL;

          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: solAddress,
              toPubkey: recipientPubkey,
              lamports: amountLamports,
            })
          );

          const signature = await wallet?.adapter.sendTransaction(transaction, connection);
          setSolHash(signature || null);

          if (signature) {
            await connection.confirmTransaction(signature, 'confirmed');
            setIsSolSuccess(true);
          }
        } else {
          // SPL token transfer
          const mintPubkey = new PublicKey(selectedToken.contractAddress);
          const recipientPubkey = new PublicKey(recipientAddress);
          const senderTokenAccount = await getAssociatedTokenAddress(mintPubkey, solAddress);
          const recipientTokenAccount = await getAssociatedTokenAddress(mintPubkey, recipientPubkey);

          const amountInSmallestUnit = BigInt(parseFloat(amount) * Math.pow(10, selectedToken.decimals));

          const transferInstruction = createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            solAddress,
            amountInSmallestUnit
          );

          const transaction = new Transaction().add(transferInstruction);
          const signature = await wallet?.adapter.sendTransaction(transaction, connection);
          setSolHash(signature || null);

          if (signature) {
            await connection.confirmTransaction(signature, 'confirmed');
            setIsSolSuccess(true);
          }
        }

        setIsSolSending(false);
      }
    } catch (error: unknown) {
      console.error('Error sending tip:', error);
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setError(errorMessage);
      setIsSolSending(false);
    }
  }, [amount, selectedBlockchain, selectedToken, networkMismatch, isEVM, isSol, ethAddress, solAddress, sendEthTransaction, writeContract, wallet, connection, receivingAddresses]);

  // auto-send transaction when wallet connects
  useEffect(() => {
    if (isConnected && amount && showWalletSelector && selectedBlockchain && !isBtc) {
      handleSendTip();
      setShowWalletSelector(false);
    }
  }, [isConnected, amount, showWalletSelector, selectedBlockchain, isBtc, handleSendTip]);

  // generate BTC QR when amount changes
  useEffect(() => {
    if (isBtc && amount && receivingAddresses.bitcoin) {
      generateBtcQR();
    }
  }, [isBtc, amount, receivingAddresses.bitcoin, generateBtcQR]);

  const handleTipClick = () => {
    if (!selectedBlockchain) {
      setError('Please select a blockchain');
      return;
    }

    if (isBtc) {
      // bitcoin just shows address/QR
      return;
    }

    if (!selectedToken) {
      setError('Please select a token');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError(null);

    if (isConnected) {
      handleSendTip();
    } else {
      setShowWalletSelector(true);
    }
  };

  const handleConnectWallet = (connector?: typeof connectors[0], walletName?: string) => {
    if (isEVM && connector) {
      connectEth({ connector });
    } else if (isSol && walletName) {
      const selectedWallet = wallets.find(w => w.adapter.name === walletName);
      if (selectedWallet) {
        select(selectedWallet.adapter.name);
        setTimeout(() => {
          connectSol();
        }, 100);
      }
    }
  };
  
  // switch to correct network
  const handleSwitchNetwork = useCallback(async () => {
    if (!expectedChain || !switchChain) return;
    try {
      await switchChain({ chainId: expectedChain.id });
    } catch (error) {
      console.error('Error switching network:', error);
      setError('Failed to switch network. Please switch manually in your wallet.');
    }
  }, [expectedChain, switchChain]);

  const quickAmounts = ['0.01', '0.05', '0.1', '0.5', '1'];

  // blockchain selection screen
  if (!selectedBlockchain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Select Blockchain</h2>
              <p className="text-gray-400">Choose which blockchain to send payment on</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(['ethereum', 'polygon', 'solana', 'bitcoin'] as Blockchain[]).map((chain) => (
                <button
                  key={chain}
                  onClick={() => setSelectedBlockchain(chain)}
                  className="py-6 px-4 bg-gradient-to-br from-slate-700/50 to-slate-800/50 hover:from-slate-700 hover:to-slate-800 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-600/50"
                >
                  <div className="text-2xl font-bold capitalize mb-1">{chain}</div>
                  <div className="text-sm text-gray-400">
                    {chain === 'bitcoin' ? 'BTC' : chain === 'ethereum' ? 'ETH & ERC20' : chain === 'polygon' ? 'MATIC & ERC20' : 'SOL & SPL'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // bitcoin - just show address/QR
  if (isBtc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button
            onClick={() => setSelectedBlockchain(null)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4">
                <Wallet className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Bitcoin Payment</h2>
              <p className="text-gray-400">Enter amount and scan QR code to send</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  Amount (BTC)
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-2xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>

              {receivingAddresses.bitcoin && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-sm text-gray-400 mb-2">Your payment address is pre-filled</p>
                  <p className="font-mono text-xs break-all text-gray-500">{receivingAddresses.bitcoin.slice(0, 10)}...{receivingAddresses.bitcoin.slice(-8)}</p>
                </div>
              )}

              {btcQrCode && amount && (
                <div className="flex justify-center">
                  <img src={btcQrCode} alt="Bitcoin QR Code" className="w-64 h-64 bg-white p-4 rounded-xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ethereum/polygon/solana - token selection and payment
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button
          onClick={() => setSelectedBlockchain(null)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2 capitalize">{selectedBlockchain}</h2>
            <p className="text-gray-400">Your payment address is pre-filled automatically - no need to enter it!</p>
          </div>

          {!isSuccess ? (
            <div className="space-y-6">
              {/* token selection */}
              {!selectedToken ? (
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    Select Token
                  </label>
                  <div className="space-y-3">
                    {/* native token */}
                    {POPULAR_TOKENS[selectedBlockchain]?.native.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => setSelectedToken(token)}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        {token.symbol} - {token.name}
                      </button>
                    ))}
                    {/* popular tokens */}
                    {POPULAR_TOKENS[selectedBlockchain]?.tokens.map((token) => (
                      <button
                        key={token.contractAddress}
                        onClick={() => setSelectedToken(token)}
                        className="w-full py-3 px-6 bg-slate-700/50 hover:bg-slate-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        {token.symbol} - {token.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* selected token display */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Selected Token</p>
                        <p className="text-xl font-bold">{selectedToken.symbol} - {selectedToken.name}</p>
                      </div>
                      <button
                        onClick={() => setSelectedToken(null)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* amount input */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-300">
                      Enter Amount ({selectedToken.symbol})
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError(null);
                      }}
                      placeholder="0.00"
                      disabled={isSending || isConfirming}
                      className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-2xl font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all disabled:opacity-50"
                    />
                  </div>
                </>
              )}

              {selectedToken && (
                <div>
                  <p className="text-sm text-gray-400 mb-3">Quick amounts</p>
                  <div className="grid grid-cols-5 gap-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setAmount(amt);
                          setError(null);
                        }}
                        disabled={isSending || isConfirming}
                        className="py-2 px-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* wallet selector */}
              {showWalletSelector && !isConnected && (
                <div className="space-y-4 p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <p className="text-center text-gray-300 mb-4">Select a wallet to continue</p>
                  {isEVM ? (
                    connectors.length > 0 ? (
                      <>
                        {connectors.map((connector) => {
                          // allow connection attempt even if not "ready" - wagmi will handle errors
                          const canConnect = connector.ready;
                          return (
                            <button
                              key={connector.uid}
                              onClick={() => {
                                console.log('Connector:', connector.name, 'Ready:', connector.ready, 'Type:', connector.type);
                                handleConnectWallet(connector);
                              }}
                              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                canConnect
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:scale-105'
                                  : 'bg-slate-700/50 hover:bg-slate-700 text-gray-300'
                              }`}
                            >
                              {connector.name}
                              {!canConnect && ' (May need installation)'}
                            </button>
                          );
                        })}
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Detected {connectors.length} wallet{connectors.length !== 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-center text-gray-400 text-sm">No wallets detected. Please install MetaMask or another wallet extension.</p>
                    )
                  ) : (
                    wallets.length > 0 ? (
                      <>
                        {wallets.map((wallet) => {
                          // solana wallet adapter states: 'Installed', 'Loadable', 'NotDetected', 'Unsupported'
                          const readyState = wallet.adapter.readyState;
                          const canConnect = readyState === 'Installed' || readyState === 'Loadable';
                          return (
                            <button
                              key={wallet.adapter.name}
                              onClick={() => {
                                console.log('Solana Wallet:', wallet.adapter.name, 'State:', readyState);
                                handleConnectWallet(undefined, wallet.adapter.name);
                              }}
                              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                canConnect
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                                  : 'bg-slate-700/50 hover:bg-slate-700 text-gray-300'
                              }`}
                            >
                              {wallet.adapter.name}
                              {!canConnect && ` (${readyState})`}
                            </button>
                          );
                        })}
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Detected {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-center text-gray-400 text-sm">No wallets detected. Please install Phantom or Solflare extension.</p>
                    )
                  )}
                  <button
                    onClick={() => setShowWalletSelector(false)}
                    className="w-full py-2 px-4 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* connected wallet info */}
              {isConnected && !showWalletSelector && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 space-y-2">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
                    <p className="font-mono text-sm">
                      {isEVM
                        ? `${ethAddress?.slice(0, 6)}...${ethAddress?.slice(-4)}`
                        : `${solAddress?.toString().slice(0, 6)}...${solAddress?.toString().slice(-4)}`
                      }
                    </p>
                  </div>
                  {currentNetwork && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Network</p>
                      <p className="text-sm font-medium">
                        {currentNetwork}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (isEVM) disconnectEth();
                      else disconnectSol();
                    }}
                    className="text-sm text-red-400 hover:text-red-300 mt-2"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              {/* network mismatch warning */}
              {networkMismatch && expectedChain && (
                <div className="flex flex-col gap-3 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-400 mb-1">Network Mismatch Detected</p>
                      <p className="text-sm text-yellow-300/80 mb-2">
                        Your wallet is on <strong>{chain?.name || 'an unsupported network'}</strong>, but this app expects <strong>{expectedChain.name}</strong>.
                      </p>
                      <p className="text-xs text-yellow-300/60 mb-3">
                        Transactions may fail or send to the wrong network. Please switch to the correct network.
                      </p>
                      {chain && (
                        <button
                          onClick={handleSwitchNetwork}
                          className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-semibold rounded-lg transition-colors"
                        >
                          Switch to {expectedChain.name}
                        </button>
                      )}
                      {!chain && (
                        <p className="text-xs text-yellow-300/60">
                          Please manually switch your wallet to {expectedChain.name} network.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* error messages */}
              {formattedError && (
                <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Transaction Error</p>
                    <p className="text-sm">
                      {formattedError}
                    </p>
                    {formattedError.includes('Insufficient balance') && (
                      <p className="text-xs text-red-300/80 mt-2">
                        Tip: Make sure you have enough {selectedToken?.symbol || 'tokens'} to cover the amount plus gas fees.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* send button */}
              {selectedToken && !showWalletSelector && (
                <button
                  onClick={handleTipClick}
                  disabled={!amount || isSending || isConfirming || networkMismatch}
                  className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isSending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isSending ? 'Sending...' : 'Confirming...'}
                    </>
                  ) : (
                    'Send Tip'
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-400">Tip Sent Successfully!</h3>
              <p className="text-gray-400">Thank you for your generous tip!</p>
              {hash && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Transaction</p>
                  {explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:text-cyan-300 font-mono break-all underline transition-colors"
                    >
                      {hash}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500 font-mono break-all">{hash}</p>
                  )}
                </div>
              )}
              <button
                onClick={() => {
                  setAmount('');
                  setSelectedToken(null);
                  setError(null);
                  setSolHash(null);
                  setIsSolSuccess(false);
                  if (isEVM) {
                    disconnectEth();
                  } else {
                    disconnectSol();
                  }
                }}
                className="mt-6 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
              >
                Send Another Tip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


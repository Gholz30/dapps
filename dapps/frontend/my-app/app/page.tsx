'use client';

import { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { injected } from 'wagmi/connectors';

// ==============================
// 🔹 CONFIG
// ==============================
// 👉 GANTI dengan contract address hasil deploy kamu day 2
const CONTRACT_ADDRESS = '0xF507b6C217c0135712d03De13DE6811Ec110f2BD';

// 👉 ABI SIMPLE STORAGE
const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default function Page() {
  // ==============================
  // 🔒 HYDRATION STATE
  // ==============================
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==============================
  // 🔹 WALLET HOOKS
  // ==============================
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // ==============================
  // 🔹 LOCAL STATE
  // ==============================
  const [inputValue, setInputValue] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState(''); // 'pending', 'success', 'error'
  const [toast, setToast] = useState({ message: '', type: '' });

  // ==============================
  // 🔹 READ CONTRACT
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
  });

  // ==============================
  // 🔹 WRITE CONTRACT
  // ==============================
  const { writeContract, isPending: isWriting } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        setTxHash(data);
        setTxStatus('pending');
        showToast('⏳ Transaction pending...', 'info');

        // Wait for confirmation & block finality
        setTimeout(() => {
          setTxStatus('success');
          showToast('✅ Transaction confirmed!', 'success');
          setInputValue('');
          
          // Delay refetch untuk memastikan data ter-update di blockchain
          setTimeout(() => {
            refetch();
          }, 1500);
        }, 2000);
      },
      onError: (error) => {
        setTxStatus('error');

        const errorMsg = error instanceof Error ? error.message : String(error);

        if (errorMsg.includes('user rejected')) {
          showToast('❌ You rejected the transaction', 'error');
        } else if (errorMsg.includes('insufficient funds')) {
          showToast('❌ Insufficient gas funds', 'error');
        } else if (errorMsg.includes('revert')) {
          showToast('❌ Transaction reverted by contract', 'error');
        } else {
          showToast(`❌ Error: ${errorMsg}`, 'error');
        }
      },
    },
  });

  // ==============================
  // 🔹 HELPER FUNCTIONS
  // ==============================

  const showToast = (message: string, type: string = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const shortenAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSetValue = () => {
    if (!inputValue) {
      showToast('⚠️ Please enter a value', 'warning');
      return;
    }

    if (!isConnected) {
      showToast('⚠️ Please connect wallet first', 'warning');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValue',
      args: [BigInt(inputValue)],
    });
  };

  // ==============================
  // 🔹 RENDER
  // ==============================

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-sm text-gray-500">Loading dApp...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 space-y-6">

        {/* HEADER */}
        <h1 className="text-xl font-bold text-center">
          Day 3 – Frontend dApp (Avalanche)
        </h1>

        {/* ==========================
            TASK 1: WALLET CONNECT
        ========================== */}
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-white text-black py-2 rounded font-semibold disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Network Badge */}
            <div className="p-2 rounded text-sm text-center font-semibold bg-green-900/30 border border-green-700 text-green-300">
              ✅ Avalanche Fuji
            </div>

            {/* Connected Address */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Connected Address</p>
              <p className="font-mono text-xs break-all bg-gray-800 p-2 rounded">
                {address}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({shortenAddress(address || '')})
              </p>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={handleDisconnect}
              className="text-red-400 text-sm underline hover:text-red-300"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* ==========================
            TASK 2: READ CONTRACT
        ========================== */}
        {isConnected && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-400">📖 Contract Value (read)</p>

            {isReading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-400">
                  {value?.toString() || '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}

            <button
              onClick={() => refetch()}
              disabled={isReading}
              className="w-full text-sm underline text-gray-300 hover:text-white disabled:opacity-50"
            >
              🔄 Refresh value
            </button>
          </div>
        )}

        {/* ==========================
            TASK 3: WRITE CONTRACT
        ========================== */}
        {isConnected && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-400">✏️ Update Contract Value</p>

            <input
              type="number"
              placeholder="New value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isWriting}
              className="w-full p-2 rounded bg-black border border-gray-600 text-white disabled:opacity-50"
            />

            <button
              onClick={handleSetValue}
              disabled={isWriting || !inputValue}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold disabled:opacity-50"
            >
              {isWriting ? 'Updating...' : 'Set Value'}
            </button>
          </div>
        )}

        {/* ==========================
            TASK 4 & 5: TRANSACTION STATUS
        ========================== */}
        {txHash && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-400">📝 Transaction Status</p>

            {/* Status Badge */}
            {txStatus === 'pending' && (
              <div className="p-2 bg-yellow-900/30 border border-yellow-700 rounded text-center">
                <span className="text-xs text-yellow-300 font-semibold">
                  ⏳ Pending...
                </span>
              </div>
            )}
            {txStatus === 'success' && (
              <div className="p-2 bg-green-900/30 border border-green-700 rounded text-center">
                <span className="text-xs text-green-300 font-semibold">
                  ✅ Confirmed
                </span>
              </div>
            )}
            {txStatus === 'error' && (
              <div className="p-2 bg-red-900/30 border border-red-700 rounded text-center">
                <span className="text-xs text-red-300 font-semibold">
                  ❌ Failed
                </span>
              </div>
            )}

            {/* TX Hash */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Hash</p>
              <p className="font-mono text-xs break-all bg-gray-800 p-2 rounded text-gray-300">
                {txHash}
              </p>
            </div>

            {/* Link to Explorer */}
            <a
              href={`https://testnet.snowtrace.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-blue-400 underline hover:text-blue-300"
            >
              🔗 View on Snowtrace
            </a>

            {/* Clear Button */}
            <button
              onClick={() => {
                setTxHash('');
                setTxStatus('');
              }}
              className="text-xs text-gray-400 underline hover:text-gray-300"
            >
              Clear
            </button>
          </div>
        )}

        {/* ==========================
            TOAST NOTIFICATION
        ========================== */}
        {toast.message && (
          <div
            className={`border rounded p-3 text-sm text-center ${
              toast.type === 'success'
                ? 'bg-green-900/30 border-green-700 text-green-300'
                : toast.type === 'error'
                  ? 'bg-red-900/30 border-red-700 text-red-300'
                  : toast.type === 'warning'
                    ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
                    : 'bg-blue-900/30 border-blue-700 text-blue-300'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* FOOTER */}
        <p className="text-xs text-gray-500 pt-2 text-center border-t border-gray-700">
          Smart contract = single source of truth
        </p>

      </div>
    </main>
  );
}
const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const nimEl = document.getElementById("nim");
const NAMA_LENGKAP = "Mohammad Nazmi Firdaus";
const NIM = "241011402802"; 


// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  console.log({ balance });
  return (balance / 1e18).toFixed(4);
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  console.log("window.ethereum", window.ethereum);

  try {
    statusEl.style.color = "black";
    networkEl.textContent = "-";
    balanceEl.textContent = "-";

    statusEl.textContent = "Connecting...";

    // Request wallet accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const address = accounts[0];
    addressEl.textContent = shortenAddress(address);
    nimEl.textContent = `${NAMA_LENGKAP} | ${NIM}`;


    console.log({ address });

    // Get chainId
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    console.log({ chainId });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      statusEl.textContent = "Connected ✅";
      statusEl.style.color = "#4cd137";

      connectBtn.disabled = true;
      connectBtn.textContent = "Wallet Connected";

      // Get AVAX balance
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      console.log({ balanceWei });

      balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
      networkEl.textContent = "Wrong Network ❌";
      statusEl.textContent = "Please switch to Avalanche Fuji";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
    }
  } catch (error) {
  console.error(error);

  if (error.code === 4001) {
    statusEl.textContent = "Connection rejected by user ❌";
  } else {
    statusEl.textContent = "Unexpected error occurred ❌";
  }

  statusEl.style.color = "red";
  connectBtn.disabled = false;
}

}

connectBtn.addEventListener("click", connectWallet);

function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

wwindow.ethereum.on("accountsChanged", (accounts) => {
  if (accounts.length === 0) {
    statusEl.textContent = "Disconnected ❌";
    addressEl.textContent = "-";
    balanceEl.textContent = "-";
    networkEl.textContent = "-";

    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
  } else {
    addressEl.textContent = shortenAddress(accounts[0]);
    statusEl.textContent = "Account Changed 🔄";
    statusEl.style.color = "#0097e6";
  }
});


window.ethereum.on("chainChanged", (chainId) => {
  if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
    networkEl.textContent = "Avalanche Fuji Testnet";
    statusEl.textContent = "Connected ✅";
    statusEl.style.color = "#4cd137";
  } else {
  networkEl.textContent = "Wrong Network ❌";
  statusEl.textContent = "Connected (Wrong Network)";
  statusEl.style.color = "#fbc531";
  balanceEl.textContent = "-";

  connectBtn.disabled = false;
  connectBtn.textContent = "Switch Network";
}

});




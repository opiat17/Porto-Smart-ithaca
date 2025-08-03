import { useEffect, useState } from "react";
import { connectWallet } from "../lib/web3";
import { createPortoAccount } from "../lib/porto";

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);

  async function handleConnect() {
    const signer = await connectWallet();
    const addr = await signer.getAddress();
    setAddress(addr);
    localStorage.setItem("connectedAddress", addr);
  }

  async function handleCreate() {
    await createPortoAccount();
    alert("Аккаунт Porto создан!");
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Porto Farmer UI</h1>
      <button onClick={handleConnect}>🔌 Connect Wallet</button>
      <button onClick={handleCreate} disabled={!address}>⚙️ Create Porto Account</button>
      <p>Connected: {address}</p>
    </main>
  );
}
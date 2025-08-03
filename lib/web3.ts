import { ethers } from "ethers";

export async function connectWallet() {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return signer;
  }
  throw new Error("No Ethereum provider found");
}
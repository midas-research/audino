import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

import AppBar from "../../components/AppBar/AppBar";
import { useSelfUserQuery } from "../../services/User/useQueries";
import CardLoader from "../../components/loader/cardLoader";
import CustomInput from "../../components/CustomInput/CustomInput";
import PrimaryButton from "../../components/PrimaryButton/PrimaryButton";

export default function ProfilePage() {
  const selfUserQuery = useSelfUserQuery({
    queryConfig: {
      queryKey: [],
      apiParams: {
        key: localStorage.getItem("audino-key"),
      },
    },
  });

  const [walletAddresses, setWalletAddresses] = useState([]);
  const [ethBalances, setEthBalances] = useState({});

  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected accounts:", accounts);

      setWalletAddresses(accounts);
    } catch (err) {
      setError("User denied wallet connection");
    }
  };

  const fetchBalances = async (addresses) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balances = {};

      for (const address of addresses) {
        const balance = await provider.getBalance(address);
        const ethValue = ethers.formatEther(balance);
        balances[address] = parseFloat(ethValue).toFixed(4);
      }

      setEthBalances(balances);
    } catch (err) {
      setError("Failed to fetch balances");
    }
  };

  // Fetch balance when walletAddress updates
  useEffect(() => {
    if (walletAddresses.length > 0) {
      fetchBalances(walletAddresses);
    }
  }, [walletAddresses]);

  console.log("walletAddresses", walletAddresses);
  console.log("ethBalances", ethBalances);
  return (
    <>
      <AppBar>
        <header className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Profile
            </h1>
          </div>
        </header>
      </AppBar>
      <main className=" -mt-32 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full">
          {selfUserQuery.isLoading ? (
            [...Array(5).keys()].map((load) => <CardLoader />)
          ) : (
            <div className="">
              {/* <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
                >
                  Name
                </label>
                <CustomInput
                  type="text"
                  value={
                    selfUserQuery.data?.first_name +
                      " " +
                      selfUserQuery.data?.last_name || ""
                  }
                  disabled={true}
                />
              </div> */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
                >
                  Username
                </label>
                <CustomInput
                  type="text"
                  value={selfUserQuery.data?.username || ""}
                  disabled={true}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-white mb-2"
                >
                  Email
                </label>
                <CustomInput
                  type="text"
                  value={selfUserQuery.data?.email || ""}
                  disabled={true}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 mt-4 shadow sm:px-6 min-h-full">
          <h3 className="text-base font-semibold text-gray-900">
            Your earnings
          </h3>
          <div className="p-4">
            {walletAddresses.length > 0 ? (
              <div className="mt-4 space-y-4">
                {walletAddresses.map((address) => (
                  <div key={address}>
                    <p>
                      <strong>Wallet:</strong> {address}
                    </p>
                    <p>
                      <strong>ETH Balance:</strong>{" "}
                      {ethBalances[address] || "Loading..."} ETH
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <PrimaryButton onClick={connectWallet} className="mx-auto">
                Connect Wallet
              </PrimaryButton>
            )}

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </div>
        </div>
      </main>
    </>
  );
}

"use strict";

const RPC = require("@hyperswarm/rpc");
const DHT = require("hyperdht");
const crypto = require("crypto");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const main = async () => {
    try {
        const dhtSeed = crypto.randomBytes(32);
        const dht = new DHT({
            port: 50001,
            keyPair: DHT.keyPair(dhtSeed),
            bootstrap: [{ host: "127.0.0.1", port: 30001 }],
        });
        await dht.ready();

        const serverPubKey = Buffer.from(
            "1a9cb0eb6c8e46779c40bcd932d78a2aad630bcda42baa0be90f760a0dff943c",
            "hex"
        );

        const rpc = new RPC({ dht });

        console.log("Bitcoin Wallet Client");
        console.log("Available commands: create, balance, send, transactions, exit");

        askForCommand();

        async function askForCommand() {
            rl.question("\nEnter command: ", async (command) => {
                switch (command.toLowerCase()) {
                    case "create":
                        await createWallet();
                        break;
                    case "balance":
                        await getBalance();
                        break;
                    case "send":
                        await sendPayment();
                        break;
                    case "transactions":
                        await listTransactions();
                        break;
                    case "exit":
                        await cleanup();
                        return;
                    default:
                        console.log("Unknown command. Try again.");
                }
                askForCommand(); // Prompt for the next command
            });
        }

        async function createWallet() {
            rl.question("Enter initial balance: ", async (initialBalance) => {
                try {
                    const respRaw = await rpc.request(
                        serverPubKey,
                        "createWallet",
                        Buffer.from(JSON.stringify({ initialBalance: parseFloat(initialBalance) }))
                    );
                    const resp = JSON.parse(respRaw.toString());
                    console.log("New Wallet Created:", resp);
                } catch (error) {
                    console.error("Error creating wallet:", error.message);
                }
                askForCommand(); // Return to command prompt after execution
            });
        }

        async function getBalance() {
            rl.question("Enter wallet ID: ", async (walletId) => {
                try {
                    const respRaw = await rpc.request(
                        serverPubKey,
                        "getBalance",
                        Buffer.from(JSON.stringify({ walletId }))
                    );
                    const resp = JSON.parse(respRaw.toString());
                    console.log("Wallet Balance:", resp);
                } catch (error) {
                    console.error("Error getting balance:", error.message);
                }
                askForCommand(); // Return to command prompt after execution
            });
        }

        async function sendPayment() {
            rl.question("Enter wallet ID: ", (walletId) => {
                rl.question("Enter recipient address: ", (recipientAddress) => {
                    rl.question("Enter amount to send: ", async (amountToSend) => {
                        try {
                            const respRaw = await rpc.request(
                                serverPubKey,
                                "sendPayment",
                                Buffer.from(
                                    JSON.stringify({
                                        walletId,
                                        toAddress: recipientAddress,
                                        amount: parseFloat(amountToSend),
                                    })
                                )
                            );
                            const resp = JSON.parse(respRaw.toString());
                            console.log("Transaction Sent:", resp);
                        } catch (error) {
                            console.error("Error sending payment:", error.message);
                        }
                        askForCommand(); // Return to command prompt after execution
                    });
                });
            });
        }

        async function listTransactions() {
            rl.question("Enter wallet ID: ", async (walletId) => {
                try {
                    const respRaw = await rpc.request(
                        serverPubKey,
                        "listTransactions",
                        Buffer.from(JSON.stringify({ walletId }))
                    );
                    const resp = JSON.parse(respRaw.toString());
                    console.log("Recent Transactions:", resp);
                } catch (error) {
                    console.error("Error listing transactions:", error.message);
                }
                askForCommand(); // Return to command prompt after execution
            });
        }

        async function cleanup() {
            await rpc.destroy();
            rl.close();
            console.log("Goodbye!");
        }

    } catch (error) {
        console.error("An error occurred:", error.message);
    }
};

main();

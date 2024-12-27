"use strict";

const RPC = require("@hyperswarm/rpc");
const DHT = require("hyperdht");
const Hypercore = require("hypercore");
const Hyperbee = require("hyperbee");
const crypto = require("crypto");

const main = async () => {
    const hcore = new Hypercore("./db/tether-server");
    const hbee = new Hyperbee(hcore, {
        keyEncoding: "utf-8",
        valueEncoding: "json",
    });
    await hbee.ready();

    let dhtSeed = (await hbee.get("dht-seed"))?.value;
    if (!dhtSeed || dhtSeed.length !== 32) {
        console.log('"dhtSeed" is invalid or missing. Regenerating...');
        dhtSeed = crypto.randomBytes(32);
        await hbee.put("dht-seed", dhtSeed);
    }

    const dht = new DHT({
        port: 40001,
        keyPair: DHT.keyPair(Uint8Array.from(dhtSeed)),
        bootstrap: [{ host: "127.0.0.1", port: 30001 }],
    });
    await dht.ready();

    let rpcSeed = (await hbee.get("rpc-seed"))?.value;
    if (!rpcSeed || rpcSeed.length !== 32) {
        console.log('"rpcSeed" is invalid or missing. Regenerating...');
        rpcSeed = crypto.randomBytes(32);
        await hbee.put("rpc-seed", rpcSeed);
    }

    const rpc = new RPC({ seed: Uint8Array.from(rpcSeed), dht });
    const rpcServer = rpc.createServer();
    await rpcServer.listen();
    console.log("RPC server listening on:", rpcServer.publicKey.toString("hex"));

    // Store wallets in memory and in Hyperbee
    const wallets = {};

    rpcServer.respond("createWallet", async (reqRaw) => {
        try {
            const { initialBalance } = JSON.parse(reqRaw.toString());
            const walletId = crypto.randomBytes(16).toString("hex");
            const address = `btc-${crypto.randomBytes(20).toString("hex")}`;
            const wallet = { id: walletId, address, balance: initialBalance || 0, transactions: [] };

            // Store wallet in Hyperbee
            await hbee.put(`wallet:${walletId}`, wallet); // Store wallet in Hyperbee
            wallets[walletId] = wallet; // Cache in memory
            return Buffer.from(JSON.stringify({ walletId, address }));
        } catch (error) {
            console.error("Error creating wallet:", error);
            return Buffer.from(JSON.stringify({ error: "Failed to create wallet" }));
        }
    });

    rpcServer.respond("getBalance", async (reqRaw) => {
        try {
            const { walletId } = JSON.parse(reqRaw.toString());
            // Retrieve from cache or Hyperbee
            const wallet = wallets[walletId] || (await hbee.get(`wallet:${walletId}`))?.value;
            if (!wallet) throw new Error("Wallet not found");
            return Buffer.from(JSON.stringify({ balance: wallet.balance }));
        } catch (error) {
            console.error("Error getting balance:", error);
            return Buffer.from(JSON.stringify({ error: error.message }));
        }
    });

    rpcServer.respond("sendPayment", async (reqRaw) => {
        try {
            const { walletId, toAddress, amount } = JSON.parse(reqRaw.toString());
            // Retrieve from cache or Hyperbee
            const wallet = wallets[walletId] || (await hbee.get(`wallet:${walletId}`))?.value;
            if (!wallet) throw new Error("Wallet not found");
            if (wallet.balance < amount) throw new Error("Insufficient funds");

            const txId = crypto.randomBytes(32).toString("hex");
            const transaction = { id: txId, from: wallet.address, to: toAddress, amount, timestamp: Date.now() };

            wallet.balance -= amount; // Deduct amount from balance
            wallet.transactions.push(transaction); // Log transaction

            // Update stored wallet
            await hbee.put(`wallet:${walletId}`, wallet); // Update stored wallet
            wallets[walletId] = wallet; // Update cache

            return Buffer.from(JSON.stringify({ txId }));
        } catch (error) {
            console.error("Error sending payment:", error);
            return Buffer.from(JSON.stringify({ error: error.message }));
        }
    });

    rpcServer.respond("listTransactions", async (reqRaw) => {
        try {
            const { walletId } = JSON.parse(reqRaw.toString());
            // Retrieve from cache or Hyperbee
            const wallet = wallets[walletId] || (await hbee.get(`wallet:${walletId}`))?.value;
            if (!wallet) throw new Error("Wallet not found");
            return Buffer.from(JSON.stringify({ transactions: wallet.transactions }));
        } catch (error) {
            console.error("Error listing transactions:", error);
            return Buffer.from(JSON.stringify({ error: error.message }));
        }
    });
};

main().catch(console.error);

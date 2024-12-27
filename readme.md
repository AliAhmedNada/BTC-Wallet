# Tether - wallet

## Overview

**Tether** is a simple Bitcoin wallet client-server application. It enables users to create wallets, manage balances, send payments, and list transactions using a lightweight RPC communication system built on HyperDHT and Hyperbee.

The project consists of two primary components:
- **Server**: Responsible for managing wallet data persistence, RPC responses, and financial logic.
- **Client**: Provides a command-line interface for interacting with the wallet functionalities.

---

## Features

### Server
- **Wallet Creation**: Generate new wallet instances with unique IDs and Bitcoin-like addresses.
- **Balance Query**: Retrieve the balance of a specific wallet.
- **Send Payments**: Transfer funds between wallets securely.
- **Transaction Logging**: Maintain transaction history for all wallets.

### Client
- Interactive interface to:
    - Create wallets
    - Check wallet balances
    - Send payments
    - View transaction history

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or above)
- NPM (comes with Node.js)

### Clone the Repository
```shell script
git clone https://github.com/your-repo/Tether010.git
cd Tether010
```

### Install Dependencies
```shell script
npm install
```

---

## Usage

The application consists of a server and a client. To use it, follow these steps:

### Step 1: Run the Server
Start the server to handle wallet data management and interactions with the client:
```shell script
node server.js
```
You should see the server public key printed in the console:
```
RPC server listening on: <public-key>
```

### Step 2: Run the Client
In a new terminal, start the wallet client , Copy Public Key to Client Code Line number 24 :

```
// example as below
 const serverPubKey = Buffer.from(
 "1a9cb0eb6c8e46779c40bcd932d78a2aad630bcda42baa0be90f760a0dff943c",
 "hex");
```
```shell script
node client.js
```

The client will provide an interactive command-line interface with the following commands:
- **create**: Create a new wallet with an initial balance.
- **balance**: Query the balance of an existing wallet.
- **send**: Transfer funds from one wallet to another.
- **transactions**: View the transaction history of a wallet.
- **exit**: Exit the client.

---

## Example Usage

### 1. Create a Wallet
```shell script
Enter command: create
Enter initial balance: 1000
New Wallet Created: { walletId: '...', address: 'btc-...' }
```

### 2. Check Wallet Balance
```shell script
Enter command: balance
Enter wallet ID: <walletId>
Wallet Balance: { balance: 1000 }
```

### 3. Send Payment
```shell script
Enter command: send
Enter wallet ID: <walletId>
Enter recipient address: <recipientAddress>
Enter amount to send: 200
Transaction Sent: { txId: '...' }
```

### 4. View Transactions
```shell script
Enter command: transactions
Enter wallet ID: <walletId>
Recent Transactions: { transactions: [...] }
```

---

## Project Structure

- **client.js**: Handles the command-line interface and client-side RPC requests.
- **server.js**: Manages wallet logic, storage, and RPC responses.
- **db/**: Stores Hypercore and Hyperbee data for wallets and server configurations.
- **package.json**: Contains dependencies and metadata for the project.

---

## Dependencies

Core dependencies include:
- **@hyperswarm/rpc**: Lightweight RPC framework for handling client-server communication.
- **hyperdht**: Decentralized hash table for networking.
- **hypercore**: Append-only logs for data storage.
- **hyperbee**: Key-value store for wallet data.
- **crypto**: Cryptographic functions for secure operations.

---

Have fun managing your bitcoin transactions with **Tether010** 🚀!

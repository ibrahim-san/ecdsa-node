import { secp256k1 } from "ethereum-cryptography/secp256k1.js";

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const crypto = require("crypto");

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, publicKey } = req.body;

  const msg = `${sender}${recipient}${amount}`;
  const hash = crypto.createHash("sha256").update(msg).digest("hex");

  if (!secp256k1.verify(Buffer.from(signature, "hex"), Buffer.from(hash, "hex"), publicKey)) {
    return res.status(400).send({ message: "Invalid signature" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

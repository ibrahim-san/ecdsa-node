import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";

const crypto = require("crypto");

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  async function signTransaction(sender, recipient, amount) {
    const privateKey = secp256k1.utils.randomPrivateKey();
    setPrivateKey(privateKey);
    const msg = `${sender}${recipient}${amount}`;
    const hash = crypto.createHash("sha256").update(msg).digest("hex");
    const signature = secp256k1.sign(Buffer.from(hash, "hex"), privateKey);
    return signature.signature;
  }

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {

      const signature = await signTransaction(address, recipient, parseInt(sendAmount));
      const response = await server.post(`send`, {
        sender: address,
        recipient,
        amount: parseInt(sendAmount),
        signature: signature.toString("hex"),
      });
      setBalance(response.data.balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

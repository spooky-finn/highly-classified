import express from "express";
import { useCaseMostChangedBalance } from "./mostChangedBalance";

const app = express();
const PORT = 3000;
// const ETHERSCAN_API_KEY = "31TDR81FX126W98P3Z345FFQMGIJJBIB6S";

app.get("/most_changed_balance", async (req, res) => {
  try {
    const result = await useCaseMostChangedBalance();
    console.log("result", result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

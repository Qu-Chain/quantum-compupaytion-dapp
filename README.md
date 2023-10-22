# Quantum Computation handled by Smart Contracts
Democratise Access to specialised hardware like quantum computers. Upload your [Open- QASM](https://openqasm.com) circuit to the Dapp, calculate the cost of the computation and call the smart contract to add the circuit. This triggers a series of API calls which ultimately reaches the level of an IBM quantum computer. The result is posted on-chain along with the hash of the quantum circuit making it a privacy preserving computation and allowing the user to execute conditional logic based on the result of the computation. This also makes the compuation more efficient insofar as circuits that have already been executed in past have a result associated with them which can always be fetched seamleslly without re-running the computation.

## Nexth

Adapted from from Nexth A Next.js + Ethereum starter kit to quickly ship Web3 Apps

## Developer Tooling 🧰

- [TypeScript](https://www.typescriptlang.org/)
- [eslint](https://eslint.org/)
- [prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [Chakra](https://chakra-ui.com)

## Web3 & Quantum Tooling 

- [ChainLink Functions](https://docs.chain.link/chainlink-functions#:~:text=Chainlink%20Functions%20eliminates%20the%20need,back%20to%20your%20smart%20contract.)
- [Web3 Modal](https://web3modal.com)
- [wagmi](https://wagmi.sh)
- [Polygon](https://polygon.technology)
- [HardHat](https://hardhat.org)
- [Open QASM](https://openqasm.com)
- [IBM Qiskit](https://qiskit.org)

## Development 🛠️

```bash
npm run dev
# or
yarn dev
```

The smart contract is live on PolygonMumbai: https://mumbai.polygonscan.com/address/0xbD1deBcB2E5D80187a149fB52368aa4229eaAD09.

Chainlink Functions:
https://github.com/Qu-Chain/quantum-compupaytion-dapp/blob/main/packages/contracts/contracts/QuantumOracle.sol
https://github.com/Qu-Chain/quantum-compupaytion-dapp/tree/main/packages/contracts/functions_source_code
https://github.com/Qu-Chain/quantum-compupaytion-dapp/blob/main/packages/contracts/scripts/deploy.ts

Chainlink Automation:
https://automation.chain.link/mumbai/1509120381179837733293241577978834436454292072247307933609402250293705981564

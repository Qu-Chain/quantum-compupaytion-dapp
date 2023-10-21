import { ethers, network, run } from 'hardhat'
import fs from 'fs'

const routerAddress: Record<string, string> = {
  maticmum: '0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C',
}

const donId = 'fun-polygon-mumbai-1'
const gasLimit = 300000
const subscriptionId = 469

async function main() {
  const networkName = (await ethers.provider.getNetwork()).name

  if (!routerAddress[networkName]) {
    throw 'Unsupported network'
  }

  console.log('Deploying Message...')

  const args: any[] = [routerAddress[networkName]]
  const QuantumOracle = await ethers.getContractFactory('QuantumOracle')
  const quantumOracle = await QuantumOracle.deploy(args[0])

  await quantumOracle.deployed()

  console.log(`Quantum Oracle deployed to ${quantumOracle.address}`)

  // no need to verify on localhost or hardhat
  if (network.config.chainId != 31337 && process.env.POLYGONSCAN_API_KEY) {
    console.log(`Waiting for block confirmation...`)
    await quantumOracle.deployTransaction.wait(5)

    console.log('Verifying contract...')
    try {
      run('verify:verify', {
        address: quantumOracle.address,
        constructorArguments: args,
      })
    } catch (e) {
      console.log(e)
    }
  }

  // configure the parameters for the chainlink functions
  const addCircuitSourceCode = fs.readFileSync('./functions_source_code/AddCircuit.js').toString()
  const fetchResultSourceCode = fs.readFileSync('./functions_source_code/FetchResult.js').toString()

  await quantumOracle.updateSourceForAddingCircuit(addCircuitSourceCode)
  await quantumOracle.updateSourceForFetchingResult(fetchResultSourceCode)
  await quantumOracle.setDONConfig(0, 0, ethers.utils.formatBytes32String(donId))
  await quantumOracle.setGasLimitForUpdatingJobID(gasLimit)
  await quantumOracle.setGasLimitForUpdatingResult(gasLimit)
  await quantumOracle.setSubscriptionId(subscriptionId)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

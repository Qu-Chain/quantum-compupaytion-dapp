import { ethers, network, run } from 'hardhat'

const routerAddress: Record<string, string> = {
  polygonMumbai: '0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C',
}

async function main() {
  const networkName = (await ethers.provider.getNetwork()).name
  if (!routerAddress[networkName]) {
    throw 'Unsupported network'
  }

  console.log('Deploying Message...')

  const args: any[] = [routerAddress[networkName]]
  const QuantumOracle = await ethers.getContractFactory('QuantumOracle')
  const quantumOracle = await QuantumOracle.deploy(...args)

  await quantumOracle.deployed()

  console.log(`Quantum Oracle deployed to ${quantumOracle.address}`)

  // no need to verify on localhost or hardhat
  if (network.config.chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

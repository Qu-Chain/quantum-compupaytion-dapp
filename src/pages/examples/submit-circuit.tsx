import { useDebounce } from 'use-debounce'
import {
  useAccount,
  useBalance,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useNetwork,
} from 'wagmi'
import { Button, FormControl, FormLabel, Heading, Input, NumberInput, NumberInputField, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { NextSeo } from 'next-seo'
import { utils } from 'ethers'
import { LinkComponent } from 'components/layout/LinkComponent'
import { useCircuitContext } from 'components/layout/CircuitContext'
import { parseEther } from 'ethers/lib/utils.js'
import abi_contract from '../../../src/abi/QuantumOracle.json'

function SendEther() {
  const { circuit, setCircuit } = useCircuitContext()

  const updateStateIfCircuitNotEmpty = () => {
    if (circuit !== '') {
      const length: number = circuit.length * 10 ** 10
      setAmount(utils.formatEther(length.toString()))
      setValue(length.toString())
    }
  }
  const [amount, setAmount] = useState('')
  const [_value, setValue] = useState('')
  const [debouncedAmount] = useDebounce(amount, 500)

  const { chain } = useNetwork()
  const { address } = useAccount()
  const balance = useBalance({
    address,
  })

  console.log('amount', amount)

  const prepareContractWrite = usePrepareContractWrite({
    address: '0xbD1deBcB2E5D80187a149fB52368aa4229eaAD09',
    abi: abi_contract,
    args: [circuit],
    functionName: 'addCircuit',
    value: _value,
  })

  const contractWrite = useContractWrite(prepareContractWrite.config)
  const waitForTransaction = useWaitForTransaction({
    hash: contractWrite.data?.hash,
    onSettled: () => balance.refetch(),
  })

  const handleSendTransation = () => {
    contractWrite.write?.()
  }

  return (
    <div>
      <Heading as='h3' fontSize='xl' my={4}>
        Your Circuit
      </Heading>
      <p>
        {circuit.split('\n').map((el) => (
          <React.Fragment key={el}>
            {el}
            <br />
          </React.Fragment>
        ))}
      </p>
      <Button onClick={updateStateIfCircuitNotEmpty}>Calculate Approximate Cost of Computation</Button>

      <FormControl>
        <FormLabel mt={2}>Cost of Computation</FormLabel>
        <NumberInput mb={2} value={amount} onChange={(value) => setAmount(value)}>
          <NumberInputField placeholder='0.0' />
        </NumberInput>
        <Text>
          Your balance: {balance.data?.formatted} {balance.data?.symbol}
        </Text>
        <Button width='full' mt={4} onClick={handleSendTransation}>
          Send Transaction
        </Button>
        {waitForTransaction.isSuccess && (
          <div>
            <Text mt={2} fontSize='lg'>
              Successfully Called QuantumOrcale
            </Text>
            <Text fontSize='lg' fontWeight='bold'>
              <LinkComponent href={`${chain?.blockExplorers?.default.url}/tx/${contractWrite.data?.hash}`}>
                Check on block explorer
              </LinkComponent>
            </Text>
          </div>
        )}
        {waitForTransaction.isError && (
          <div>
            <Text mt={2} color='red' fontSize='lg'>
              Error Calling QuantumOracle
            </Text>
            <Text color='red' fontSize='lg' fontWeight='bold'>
              {waitForTransaction.error?.message}
            </Text>
          </div>
        )}
      </FormControl>
    </div>
  )
}

export default function SendEtherExample() {
  const { isConnected } = useAccount()

  if (isConnected) {
    return (
      <div>
        <NextSeo title='Submit Quantum Circuit' />
        <Heading as='h2' fontSize='2xl' my={4}>
          Submit Quantum Circuit
        </Heading>

        <SendEther />
      </div>
    )
  }

  return <div>Connect your wallet to submit your circuit to the blockchain.</div>
}

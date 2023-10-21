import { useDebounce } from 'use-debounce'
import {
  useAccount,
  useBalance,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
  useNetwork,
} from 'wagmi'
import { Button, FormControl, FormLabel, Heading, Input, NumberInput, NumberInputField, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { NextSeo } from 'next-seo'
import { utils } from 'ethers'
import { LinkComponent } from 'components/layout/LinkComponent'
import { useCircuitContext } from 'components/layout/CircuitContext'

function SendEther() {
  const [to, setTo] = useState('')
  const [debouncedTo] = useDebounce(to, 500)

  const [amount, setAmount] = useState('')
  const [debouncedAmount] = useDebounce(amount, 500)

  const { chain } = useNetwork()
  const { address } = useAccount()
  const balance = useBalance({
    address,
  })

  const prepareSendTransaction = usePrepareSendTransaction({
    request: {
      to: debouncedTo,
      value: debouncedAmount ? utils.parseEther(debouncedAmount) : undefined,
    },
  })
  const sendTransaction = useSendTransaction(prepareSendTransaction.config)
  const waitForTransaction = useWaitForTransaction({
    hash: sendTransaction.data?.hash,
    onSettled: () => balance.refetch(),
  })

  const handleSendTransation = () => {
    sendTransaction.sendTransaction?.()
  }

  const { circuit, setCircuit } = useCircuitContext()

  const updateStateIfCircuitNotEmpty = () => {
    if (circuit !== '') {
      const length: number = circuit.length * 10 ** 10
      setAmount(length.toString())
    }
  }

  return (
    <div>
      <Heading as='h3' fontSize='xl' my={4}>
        Your Circuit
      </Heading>
      <Button onClick={updateStateIfCircuitNotEmpty}>Calculate Approximate of Computation</Button>
      <p>
        {circuit.split('\n').map((el) => (
          <React.Fragment key={el}>
            {el}
            <br />
          </React.Fragment>
        ))}
      </p>

      <FormControl>
        <FormLabel mt={2}>Cost of Computation</FormLabel>
        <NumberInput mb={2} value={amount} onChange={(value) => setAmount(value)}>
          <NumberInputField placeholder='0.0' />
        </NumberInput>
        <Text>
          Your balance: {balance.data?.formatted} {balance.data?.symbol}
        </Text>

        <Button
          disabled={
            waitForTransaction.isLoading ||
            sendTransaction.isLoading ||
            !sendTransaction.sendTransaction ||
            !to ||
            !amount
          }
          mt={4}
          onClick={handleSendTransation}>
          {waitForTransaction.isLoading ? 'Sending...' : sendTransaction.isLoading ? 'Check your wallet' : 'Send'}
        </Button>
        {waitForTransaction.isSuccess && (
          <div>
            <Text mt={2} fontSize='lg'>
              Successfully sent {amount} ether to {to}
            </Text>
            <Text fontSize='lg' fontWeight='bold'>
              <LinkComponent href={`${chain?.blockExplorers?.default.url}/tx/${sendTransaction.data?.hash}`}>
                Check on block explorer
              </LinkComponent>
            </Text>
          </div>
        )}
        {waitForTransaction.isError && (
          <div>
            <Text mt={2} color='red' fontSize='lg'>
              Error sending {amount} to {to}
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

  return <div>Connect your wallet to sign this transaction.</div>
}

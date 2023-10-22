import type { AppProps } from 'next/app'
import { Layout } from 'components/layout'
import { Web3Provider } from 'providers/Web3'
import { ChakraProvider } from 'providers/Chakra'
import { useIsMounted } from 'hooks/useIsMounted'
import { Seo } from 'components/layout/Seo'
import { CircuitProvider } from 'components/layout/CircuitContext'

import { WagmiConfig, createConfig } from 'wagmi'
import { polygonMumbai, polygon, optimism, arbitrum } from 'wagmi/chains'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const config = createConfig(
  getDefaultConfig({
    appName: 'ConnectKit Next.js demo',
    //infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    //alchemyId:  process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [polygonMumbai, polygon, optimism, arbitrum],
    walletConnectProjectId: '5ef7aab0f85ac724e35b3127ea6ac8fc',
  })
)

export default function App({ Component, pageProps }: AppProps) {
  const isMounted = useIsMounted()

  return (
    <ChakraProvider>
      <Seo />
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <CircuitProvider>
            {isMounted && (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
          </CircuitProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  )
}

import type { AppProps } from 'next/app'
import { Layout } from 'components/layout'
import { ChakraProvider } from 'providers/Chakra'
import { useIsMounted } from 'hooks/useIsMounted'
import { Seo } from 'components/layout/Seo'
import { CircuitProvider } from 'components/layout/CircuitContext'
import { WagmiConfig, createConfig, mainnet } from 'wagmi'
import { polygonMumbai, polygon, optimism, arbitrum } from 'wagmi/chains'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import dotenv from 'dotenv'

dotenv.config()
const config = createConfig(
  getDefaultConfig({
    appName: 'QChain',
    //infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    //alchemyId:  process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [polygonMumbai, polygon, mainnet, optimism, arbitrum],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
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

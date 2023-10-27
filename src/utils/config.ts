import { ThemingProps } from '@chakra-ui/react'
import { mainnet, goerli, sepolia, polygon, optimism, arbitrum, polygonMumbai } from '@wagmi/chains'

export const SITE_NAME = 'Quantum Compupaytion'
export const SITE_DESCRIPTION = 'Pay for your computation in crypto, results posted on chain'
export const SITE_URL = 'https://nexth.vercel.app'

export const SOCIAL_TWITTER = 'HomeDAO_live/status/1717530622292308376?s=20'
export const SOCIAL_GITHUB = 'Qu-Chain/quantum-compupaytion-dapp'

export const THEME_INITIAL_COLOR = 'system'
export const THEME_COLOR_SCHEME: ThemingProps['colorScheme'] = 'gray'
export const THEME_CONFIG = {
  initialColorMode: THEME_INITIAL_COLOR,
}

export const ETH_CHAINS = [polygonMumbai]

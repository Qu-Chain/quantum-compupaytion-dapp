import { ThemingProps } from '@chakra-ui/react'
import { mainnet, goerli, sepolia, polygon, optimism, arbitrum } from '@wagmi/chains'

export const SITE_NAME = 'Quantum Compupaytion'
export const SITE_DESCRIPTION = 'Pay for your computation in crypto, results posted on chain'
export const SITE_URL = 'https://nexth.vercel.app'

export const SOCIAL_TWITTER = 'wslyvh'
export const SOCIAL_GITHUB = 'jan-o-e/quantum-compupaytion'

export const THEME_INITIAL_COLOR = 'system'
export const THEME_COLOR_SCHEME: ThemingProps['colorScheme'] = 'gray'
export const THEME_CONFIG = {
  initialColorMode: THEME_INITIAL_COLOR,
}

export const ETH_CHAINS = [mainnet, goerli, sepolia, polygon, optimism, arbitrum]

export const SERVER_SESSION_SETTINGS = {
  cookieName: SITE_NAME,
  password: process.env.SESSION_PASSWORD ?? 'UPDATE_TO_complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

import { polygonMumbai, mainnet, sepolia, polygon, optimism, arbitrum } from '@wagmi/core/chains'

export const ETH_CHAINS = [polygonMumbai, mainnet, sepolia, polygon, optimism, arbitrum]

export function GetNetworkColor(chain?: string) {
  if (chain === 'homestead') return 'green'
  if (chain === 'arbitrum') return 'blue'
  if (chain === 'optimism') return 'red'
  if (chain === 'matic') return 'purple'
  if (chain === 'polygonMumbai') return 'purple'

  return 'grey'
}

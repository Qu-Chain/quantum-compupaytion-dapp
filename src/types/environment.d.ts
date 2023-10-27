export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string
      ENV: 'test' | 'dev' | 'prod'
    }
  }
}

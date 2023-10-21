import React, { createContext, useContext, ReactNode, useState } from 'react'

interface CircuitContextProps {
  circuit: string
  setCircuit: (circuit: string) => void
}

const CircuitContext = createContext<CircuitContextProps | undefined>(undefined)

export const CircuitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [circuit, setCircuit] = useState('')

  return <CircuitContext.Provider value={{ circuit, setCircuit }}>{children}</CircuitContext.Provider>
}

export const useCircuitContext = () => {
  const context = useContext(CircuitContext)
  if (!context) {
    throw new Error('useCircuitContext must be used within a CircuitProvider')
  }
  return context
}

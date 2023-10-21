const circuit = args[0]

const url = `https://fastapi-production-b856.up.railway.app/circuit`

const jobId = Functions.makeHttpRequest({
  url: url,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  data: {
    qasm: circuit,
  },
})

return Functions.encodeString(jobId)

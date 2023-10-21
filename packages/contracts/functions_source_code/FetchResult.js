const circuit = args[0]

const url = `https://fastapi-production-b856.up.railway.app/result/${jobId}`

const result = Functions.makeHttpRequest({
  url: url,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  data: {},
})

return Functions.encodeString(JSON.stringify(result))

import numpy as np
from qiskit import *

from typing import Union
from fastapi import FastAPI 
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from PIL import Image
from io import BytesIO

IBMQ.save_account('fdf4f1e45417251c0e14db3c367382c06bc78d821c6370d35444066d4cd3a6fdcc7c5717c9d99b155607b3692f8dbd6a42c05d60e9313b6b865f27f5caaef53e')
provider = IBMQ.load_account()

app = FastAPI()

class Circuit(BaseModel):
    qasm: str

@app.post("/circuit/")
async def create_circuit(circuit: Circuit):
    print(circuit.qasm)
    circuit = QuantumCircuit.from_qasm_str(circuit.qasm)
    backend = provider.get_backend('ibmq_qasm_simulator')
    transpiled = transpile(circuit, backend=backend)
    job = backend.run(transpiled)
    return job.job_id()

@app.post("/draw/")
async def create_circuit(circuit: Circuit):
    print(circuit.qasm)
    circuit = QuantumCircuit.from_qasm_str(circuit.qasm)
    drawn_image = circuit.draw(output="mpl")
    buffer = BytesIO()
    drawn_image.savefig(buffer, format="png")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")

@app.post("/result/{job_id}")
def get_result(job_id: str):
    job = provider.get_backend('ibmq_qasm_simulator').retrieve_job(job_id)
    result = job.result()
    data = {}
    counts = result.results[0].data.counts
    max_s = 0
    for k in counts.keys():
        max_s = max(max_s, len(bin(int(k, 16))[2:]))
    
    for k in counts.keys():
        data[(bin(int(k, 16))[2:]).ljust(max_s, "0")] = counts[k]
    return data
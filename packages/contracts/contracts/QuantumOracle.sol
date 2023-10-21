// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from '@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol';
import {FunctionsRequest} from '@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol';

contract QuantumOracle is FunctionsClient {
  using FunctionsRequest for FunctionsRequest.Request;

  enum Status {
    NON_EXISTENT,
    PENDING,
    REQUESTED,
    RESULT_PENDING,
    RESULT_UPDATED
  }

  enum RequestType {
    NON_EXISTENT,
    CREATE_CIRCUIT,
    FETCH_RESULT
  }

  mapping(bytes32 => string) public results;
  mapping(bytes32 => string) public jobIds;
  mapping(bytes32 => RequestType) public requestTypes; // request id => request type
  mapping(bytes32 => bytes32) public requestIdToCircuitID; // request id => circuit hash
  mapping(bytes32 => Status) public status;

  event CircuitAdded(string circuitQASM, bytes32 circuitHash);
  event CircuitJobSent(bytes32 circuitHash, string jobId);
  event CircuitResultAsked(bytes32 circuitHash, string jobId);
  event CircuitResultUpdated(bytes32 circuitHash, string jobId, string result);
  event ChainlinkResponse(bytes32 requestId, bytes response, bytes err);

  error InvalidValueSent();
  error CircuitAlreadyInSystem();
  error InvalidStatusForThisCall();
  error InvalidRequestId();

  constructor(address chainlinkFunctionsRouter) FunctionsClient(chainlinkFunctionsRouter) {}

  function addCircuit(string memory circuitQASM) public payable {
    bytes32 circuitHash = keccak256(abi.encode(circuitQASM));
    if (status[circuitHash] != Status.NON_EXISTENT) revert CircuitAlreadyInSystem();
    if (calculateCost(circuitQASM) != msg.value) revert InvalidValueSent();

    // TODO: send the circuit to chainlink

    status[circuitHash] = Status.PENDING;

    emit CircuitAdded(circuitQASM, circuitHash);
  }

  function fetchResult(bytes32 circuitHash) public {
    if (status[circuitHash] != Status.REQUESTED) revert InvalidStatusForThisCall();

    string memory jobId = jobIds[circuitHash];
    // TODO: send the result request to chainlink

    status[circuitHash] = Status.RESULT_PENDING;
    emit CircuitResultAsked(circuitHash, jobId);
  }

  function updateResult(bytes32 circuitHash, string memory result) internal {
    if (status[circuitHash] != Status.RESULT_PENDING) revert InvalidStatusForThisCall();

    string memory jobId = jobIds[circuitHash];
    results[circuitHash] = result;
    status[circuitHash] = Status.RESULT_UPDATED;
    emit CircuitResultUpdated(circuitHash, jobId, result);
  }

  function updateJobId(bytes32 circuitHash, string memory jobId) internal {
    if (status[circuitHash] != Status.PENDING) revert InvalidStatusForThisCall();

    status[circuitHash] = Status.REQUESTED;
    emit CircuitJobSent(circuitHash, jobId);
  }

  function calculateCost(string memory circuitQASM) public pure returns (uint256) {
    return bytes(circuitQASM).length * 1e10;
  }

  function sendRequest(
    string memory source,
    bytes memory encryptedSecretsUrls,
    uint8 donHostedSecretsSlotID,
    uint64 donHostedSecretsVersion,
    string[] memory args,
    bytes[] memory bytesArgs,
    uint64 subscriptionId,
    uint32 gasLimit,
    bytes32 jobId
  ) external returns (bytes32 requestId) {
    FunctionsRequest.Request memory req;
    req.initializeRequestForInlineJavaScript(source);
    if (encryptedSecretsUrls.length > 0) req.addSecretsReference(encryptedSecretsUrls);
    else if (donHostedSecretsVersion > 0) {
      req.addDONHostedSecrets(donHostedSecretsSlotID, donHostedSecretsVersion);
    }
    if (args.length > 0) req.setArgs(args);
    if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);
    // s_lastRequestId =
    // return s_lastRequestId;
    return _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, jobId);
  }

  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    if (requestTypes[requestId] == RequestType.NON_EXISTENT) {
      revert InvalidRequestId();
    }

    bytes32 circuitHash = requestIdToCircuitID[requestId];

    // TODO: handle error

    if (requestTypes[requestId] == RequestType.CREATE_CIRCUIT) {
      string memory jobId = abi.decode(response, (string));
      updateJobId(circuitHash, jobId);
    } else if (requestTypes[requestId] == RequestType.FETCH_RESULT) {
      string memory result = abi.decode(response, (string));
      updateResult(circuitHash, result);
    }

    emit ChainlinkResponse(requestId, response, err);
  }
}

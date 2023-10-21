// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from '@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol';
import {FunctionsRequest} from '@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol';

import '@openzeppelin/contracts/access/Ownable.sol';

contract QuantumOracle is FunctionsClient, Ownable {
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

  mapping(bytes32 => string) public circuits;
  mapping(bytes32 => string) public results;
  mapping(bytes32 => string) public jobIds;
  mapping(bytes32 => RequestType) public requestTypes; // request id => request type
  mapping(bytes32 => bytes32) public requestIdToCircuitID; // request id => circuit hash
  mapping(bytes32 => Status) public status;

  string public sourceForAddingCircuit;
  string public sourceForFetchingResult;
  uint8 public donHostedSecretsSlotID;
  uint64 public donHostedSecretsVersion;
  bytes32 public donId;
  uint64 subscriptionId;
  bytes encryptedSecretsUrls;
  uint32 gasLimitForUpdatingJobID;
  uint32 gasLimitForUpdatingResult;

  event CircuitAdded(string circuitQASM, bytes32 circuitHash);
  event CircuitJobSent(bytes32 circuitHash, string jobId);
  event CircuitResultAsked(bytes32 circuitHash, string jobId);
  event CircuitResultUpdated(bytes32 circuitHash, string jobId, string result);
  event ChainlinkResponse(bytes32 requestId, bytes response, bytes err);
  event SourceUpdatedForAddingCircuit(string sourceForAddingCircuit);
  event SourceUpdatedForFetchingResult(string sourceForFetchingResult);

  error InvalidValueSent();
  error CircuitAlreadyInSystem();
  error InvalidStatusForThisCall();
  error InvalidRequestId();

  constructor(address chainlinkFunctionsRouter) FunctionsClient(chainlinkFunctionsRouter) {}

  function updateSourceForAddingCircuit(string memory _sourceForAddingCircuit) public onlyOwner {
    sourceForAddingCircuit = _sourceForAddingCircuit;
    emit SourceUpdatedForAddingCircuit(sourceForAddingCircuit);
  }

  function updateSourceForFetchingResult(string memory _sourceForFetchingResult) public onlyOwner {
    sourceForFetchingResult = _sourceForFetchingResult;
    emit SourceUpdatedForFetchingResult(sourceForFetchingResult);
  }

  function setSubscriptionId(uint64 _subscriptionId) public onlyOwner {
    subscriptionId = _subscriptionId;
  }

  function setDONConfig(
    uint8 _donHostedSecretsSlotID,
    uint64 _donHostedSecretsVersion,
    bytes32 _donId
  ) public onlyOwner {
    donHostedSecretsSlotID = _donHostedSecretsSlotID;
    donHostedSecretsVersion = _donHostedSecretsVersion;
    donId = _donId;
  }

  function setEncryptedSecretUrls(bytes calldata _encryptedSecretsUrls) public onlyOwner {
    encryptedSecretsUrls = _encryptedSecretsUrls;
  }

  function setGasLimitForUpdatingJobID(uint32 _gasLimit) public onlyOwner {
    gasLimitForUpdatingJobID = _gasLimit;
  }

  function setGasLimitForUpdatingResult(uint32 _gasLimit) public onlyOwner {
    gasLimitForUpdatingResult = _gasLimit;
  }

  function addCircuit(string memory circuitQASM) public payable {
    bytes32 circuitHash = keccak256(abi.encode(circuitQASM));
    if (status[circuitHash] != Status.NON_EXISTENT) revert CircuitAlreadyInSystem();
    if (calculateCost(circuitQASM) != msg.value) revert InvalidValueSent();

    // send the circuit to chainlink
    string[1] memory args;
    args[0] = circuitQASM;
    sendRequest(sourceForAddingCircuit, args, gasLimitForUpdatingJobID);

    circuits[circuitHash] = circuitQASM;
    status[circuitHash] = Status.PENDING;

    emit CircuitAdded(circuitQASM, circuitHash);
  }

  function fetchResult(bytes32 circuitHash) public {
    if (status[circuitHash] != Status.REQUESTED) revert InvalidStatusForThisCall();

    string memory jobId = jobIds[circuitHash];
    string memory circuitQASM = circuits[circuitHash];
    // send the result request to chainlink
    string[2] memory args;
    args[0] = circuitQASM;
    args[1] = jobId;
    sendRequest(sourceForFetchingResult, args, gasLimitForUpdatingResult);

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
    string[] memory args,
    // bytes[] memory bytesArgs,
    uint32 gasLimit
  ) internal returns (bytes32 requestId) {
    FunctionsRequest.Request memory req;
    req.initializeRequestForInlineJavaScript(source);
    if (encryptedSecretsUrls.length > 0) req.addSecretsReference(encryptedSecretsUrls);
    else if (donHostedSecretsVersion > 0) {
      req.addDONHostedSecrets(donHostedSecretsSlotID, donHostedSecretsVersion);
    }
    if (args.length > 0) req.setArgs(args);
    // if (bytesArgs.length > 0) req.setBytesArgs(bytesArgs);
    requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
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

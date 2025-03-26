import { createWeb3Name } from "@web3-name-sdk/core";
import { createSeiName } from "@web3-name-sdk/core/seiName";
import { createInjName } from "@web3-name-sdk/core/injName";
import { createSolName } from "@web3-name-sdk/core/solName";
import { createPaymentIdName } from "@web3-name-sdk/core/paymentIdName";
import { useState } from "react";
import "./App.css";

const TIMEOUT_PRESETS = {
  veryShort: 100, // Intentionally short to test timeout
  normal: 5000, // Normal timeout (5s)
  long: 15000, // Long timeout (15s)
  invalid: -1, // Invalid timeout value
};

// PaymentID Chain ID mapping
const PAYMENT_ID_CHAINS = {
  0: "Bitcoin",
  1: "Ethereum (EVM)",
  2: "Solana",
  3: "Tron",
  4: "Aptos",
  5: "Sui",
};

type Protocol = "EVM" | "Solana" | "Sei" | "Injective" | "PaymentID";
type Method =
  | "getAddress"
  | "getDomainName"
  | "batchGetDomainNameByChainId"
  | "getMetadata"
  | "getContentHash";

type TestCase = {
  title: string;
  domainName: string;
  address: string;
  protocol: Protocol;
  description: string;
  rpcUrl?: string;
  chainId?: number;
  supportsTimeout?: boolean;
};

const TEST_CASES: Record<string, TestCase> = {
  evm: {
    title: "EVM Test",
    domainName: "vitalik.eth",
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    protocol: "EVM",
    description: "Testing EVM name resolution with timeout parameter",
    supportsTimeout: true,
  },
  arb: {
    title: "Arbitrum Test",
    domainName: "registry.arb",
    address: "0x8d27d6235d9d8EFc9Eef0505e745dB67D5cD2918",
    protocol: "EVM",
    description: "Testing Arbitrum name resolution",
    supportsTimeout: true,
  },
  lens: {
    title: "Lens Protocol Test",
    domainName: "bts_official.lens",
    address: "0xd80EFA68b50D21E548B9Cdb092eBc6e5BcA113E7",
    protocol: "EVM",
    description: "Testing Lens Protocol name resolution",
    supportsTimeout: true,
  },
  crypto: {
    title: ".crypto Test",
    domainName: "beresnev.crypto",
    address: "0x6ec0deed30605bcd19342f3c30201db263291589",
    protocol: "EVM",
    description: "Testing .crypto name resolution",
    supportsTimeout: true,
  },
  solana: {
    title: "Solana Test",
    domainName: "bonfida.sol",
    address: "Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb",
    protocol: "Solana",
    description: "Testing Solana name resolution with timeout parameter",
    supportsTimeout: true,
  },
  sei: {
    title: "Sei Test",
    domainName: "allen.sei",
    address: "sei1tmew60aj394kdfff0t54lfaelu3p8j8lz93pmf",
    protocol: "Sei",
    description: "Testing Sei name resolution with timeout parameter",
    supportsTimeout: true,
  },
  injective: {
    title: "Injective Test",
    domainName: "allen.inj",
    address: "inj1xw0d9lcjjnqq4v3lqk8ek9r0cxwpr4s8dxy44h",
    protocol: "Injective",
    description: "Testing Injective name resolution with timeout parameter",
    supportsTimeout: true,
  },
};

function App() {
  const [currentTimeout, setCurrentTimeout] = useState(TIMEOUT_PRESETS.normal);
  const [currentTest, setCurrentTest] = useState<TestCase>(TEST_CASES.evm);
  const [currentMethod, setCurrentMethod] = useState<Method>("getAddress");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [customDomain, setCustomDomain] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customChainId, setCustomChainId] = useState("");
  const [selectedPaymentIdChain, setSelectedPaymentIdChain] = useState(1); // Default to Ethereum

  const [paymentIdDomain, setPaymentIdDomain] = useState("jerry@binance");
  const [paymentIdLoading, setPaymentIdLoading] = useState(false);
  const [paymentIdResult, setPaymentIdResult] = useState("");
  const [paymentIdError, setPaymentIdError] = useState("");
  const [paymentIdElapsedTime, setPaymentIdElapsedTime] = useState(0);

  const runTest = async () => {
    setLoading(true);
    setError("");
    setResult("");
    setElapsedTime(0);
    const startTime = Date.now();

    try {
      let resultValue = null;
      const domainName = customDomain || currentTest.domainName;
      const address = customAddress || currentTest.address;
      const chainId = customChainId
        ? parseInt(customChainId)
        : currentTest.chainId;

      switch (currentTest.protocol) {
        case "EVM": {
          const web3Name = createWeb3Name({ rpcUrl: currentTest.rpcUrl });
          switch (currentMethod) {
            case "getAddress":
              resultValue = await web3Name.getAddress(domainName, {
                timeout: currentTimeout,
              });
              break;
            case "getDomainName":
              resultValue = await web3Name.getDomainName({
                address,
                timeout: currentTimeout,
              });
              break;
            case "getMetadata":
              resultValue = await web3Name.getMetadata({
                name: domainName,
                timeout: currentTimeout,
              });
              break;
            case "getContentHash":
              resultValue = await web3Name.getContentHash({
                name: domainName,
                timeout: currentTimeout,
              });
              break;
            case "batchGetDomainNameByChainId":
              if (!chainId) {
                throw new Error(
                  "Chain ID is required for batchGetDomainNameByChainId"
                );
              }
              const result = await web3Name.batchGetDomainNameByChainId({
                addressList: [address as `0x${string}`],
                queryChainId: chainId,
                rpcUrl: currentTest.rpcUrl,
                timeout: currentTimeout,
              });
              resultValue = result?.[0]?.domain ?? null;
              break;
          }
          break;
        }
        case "Solana": {
          const solName = createSolName({ timeout: currentTimeout });
          switch (currentMethod) {
            case "getAddress":
              resultValue = await solName.getAddress({
                name: domainName,
                timeout: currentTimeout,
              });
              break;
            case "getDomainName":
              resultValue = await solName.getDomainName({
                address,
                timeout: currentTimeout,
              });
              break;
          }
          break;
        }
        case "Sei": {
          const seiName = createSeiName({ timeout: currentTimeout });
          switch (currentMethod) {
            case "getAddress":
              resultValue = await seiName.getAddress({
                name: domainName,
                timeout: currentTimeout,
              });
              break;
            case "getDomainName":
              resultValue = await seiName.getDomainName({
                address,
                timeout: currentTimeout,
              });
              break;
          }
          break;
        }
        case "Injective": {
          const injName = createInjName({ timeout: currentTimeout });
          switch (currentMethod) {
            case "getAddress":
              resultValue = await injName.getAddress({
                name: domainName,
                timeout: currentTimeout,
              });
              break;
            case "getDomainName":
              resultValue = await injName.getDomainName({
                address,
                timeout: currentTimeout,
              });
              break;
          }
          break;
        }
      }

      const endTime = Date.now();
      setElapsedTime(endTime - startTime);
      setResult(
        resultValue ? JSON.stringify(resultValue, null, 2) : "not found"
      );
    } catch (err) {
      const endTime = Date.now();
      setElapsedTime(endTime - startTime);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get available methods for current protocol
  const getAvailableMethods = (protocol: Protocol): Method[] => {
    switch (protocol) {
      case "EVM":
        return [
          "getAddress",
          "getDomainName",
          "batchGetDomainNameByChainId",
          "getMetadata",
          "getContentHash",
        ];
      case "Solana":
      case "Sei":
      case "Injective":
        return ["getAddress", "getDomainName"];
      case "PaymentID":
        return ["getAddress"]; // Only getAddress is supported for PaymentID domains currently
      default:
        return ["getAddress"];
    }
  };

  return (
    <div className="dark-theme-container">
      <div className="header">
        <h1>Web3Name SDK Testing</h1>
      </div>

      {/* Protocol selection */}
      <div className="card test-card">
        <h3>Select Protocol</h3>
        <div className="test-select">
          {Object.values(TEST_CASES).map((testCase) => (
            <button
              key={testCase.title}
              onClick={() => {
                setCurrentTest(testCase);
                // Reset method if not available in new protocol
                if (
                  !getAvailableMethods(testCase.protocol).includes(
                    currentMethod
                  )
                ) {
                  setCurrentMethod(getAvailableMethods(testCase.protocol)[0]);
                }
                setTimeout(() => {
                  // Check protocol after state update
                }, 0);
              }}
              className={currentTest.title === testCase.title ? "active" : ""}
            >
              {testCase.title}
            </button>
          ))}
        </div>
        <div className="test-description">
          <p>
            <strong>Current Test:</strong> {currentTest.title}
          </p>
          <p>{currentTest.description}</p>
          <div className="input-group">
            <div>
              <label>
                <strong>Domain:</strong>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder={currentTest.domainName}
                />
              </label>
            </div>
            <div>
              <label>
                <strong>Address:</strong>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder={currentTest.address}
                />
              </label>
            </div>
            {currentTest.protocol === "EVM" && (
              <div>
                <label>
                  <strong>Chain ID:</strong>
                  <input
                    type="number"
                    value={customChainId}
                    onChange={(e) => setCustomChainId(e.target.value)}
                    placeholder={currentTest.chainId?.toString()}
                  />
                  <span className="chain-id-note">
                    (e.g. 1: Ethereum, 56:BSC, 137: Polygon)
                  </span>
                </label>
              </div>
            )}
          </div>
          {currentTest.rpcUrl && (
            <p>
              <strong>RPC URL:</strong> {currentTest.rpcUrl}
            </p>
          )}
        </div>
      </div>

      {/* Method selection */}
      <div className="card method-card">
        <h3>Select Method</h3>
        <div className="method-select">
          {getAvailableMethods(currentTest.protocol).map((method) => (
            <button
              key={method}
              onClick={() => setCurrentMethod(method)}
              className={currentMethod === method ? "active" : ""}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Timeout settings */}
      <div
        className={`card timeout-card ${
          currentTest.supportsTimeout === false ? "disabled-card" : ""
        }`}
      >
        <h3>Select Timeout Duration</h3>
        <div className="timeout-select">
          {Object.entries(TIMEOUT_PRESETS).map(([name, value]) => (
            <button
              key={name}
              onClick={() => setCurrentTimeout(value)}
              className={currentTimeout === value ? "active" : ""}
              disabled={currentTest.supportsTimeout === false}
            >
              {name} ({value}ms)
            </button>
          ))}
        </div>
        {currentTest.supportsTimeout === false && (
          <div className="warning-message">
            <p>
              ⚠️ {currentTest.protocol} protocol doesn't support timeout
              parameter
            </p>
          </div>
        )}
        <div className="actions">
          <button className="primary" onClick={runTest} disabled={loading}>
            {loading
              ? "Testing..."
              : `Run ${currentMethod} with ${currentTimeout}ms Timeout`}
          </button>
        </div>
      </div>

      {/* Test results */}
      <div className="card result-card">
        <h3>Test Results</h3>
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Request in progress...</p>
          </div>
        )}
        {error && (
          <div className="error">
            <h4>❌ Error</h4>
            <p>{error}</p>
            <p>Request time: {elapsedTime}ms</p>
          </div>
        )}
        {!error && result && (
          <div className="success">
            <h4>✅ Success</h4>
            <div className="result-content">
              <pre>{result}</pre>
              <p>Request time: {elapsedTime}ms</p>
            </div>
          </div>
        )}
      </div>

      <div className="card payment-id-card">
        <h3>PaymentID Domain Resolution</h3>
        <div className="payment-id-content">
          <div className="input-group">
            <div>
              <label>
                <strong>PaymentID Domain:</strong>
                <input
                  type="text"
                  value={paymentIdDomain}
                  onChange={(e) => setPaymentIdDomain(e.target.value)}
                  placeholder="username@provider (e.g., jerry@binance)"
                />
              </label>
            </div>
          </div>

          <p>
            <strong>Select Chain for PaymentID Resolution:</strong>
          </p>
          <div className="chain-select">
            {Object.entries(PAYMENT_ID_CHAINS).map(([id, name]) => (
              <button
                key={id}
                onClick={() => setSelectedPaymentIdChain(parseInt(id))}
                className={
                  selectedPaymentIdChain === parseInt(id) ? "active" : ""
                }
              >
                {name} (ID: {id})
              </button>
            ))}
          </div>

          <div className="payment-actions">
            <button
              className="primary"
              onClick={() => {
                const paymentIdName = createPaymentIdName();
                const domainToTest = paymentIdDomain;
                const chainIdToUse = selectedPaymentIdChain;

                // Set UI state
                setPaymentIdLoading(true);
                setPaymentIdError("");
                setPaymentIdResult("");

                // Execute PaymentID resolution
                async function runPaymentIdTest() {
                  try {
                    const start = Date.now();
                    const result = await paymentIdName.getAddress({
                      name: domainToTest,
                      chainId: chainIdToUse,
                    });
                    const end = Date.now();

                    setPaymentIdElapsedTime(end - start);

                    if (result) {
                      setPaymentIdResult(JSON.stringify(result, null, 2));
                    } else {
                      setPaymentIdResult(
                        "Address not found for this PaymentID domain and selected chain"
                      );
                    }
                  } catch (err) {
                    setPaymentIdError(
                      err instanceof Error ? err.message : String(err)
                    );
                  } finally {
                    setPaymentIdLoading(false);
                  }
                }

                runPaymentIdTest();
              }}
              disabled={paymentIdLoading}
            >
              {paymentIdLoading ? "Resolving..." : "Resolve PaymentID Domain"}
            </button>
          </div>

          {paymentIdLoading && (
            <div className="loading payment-loading">
              <div className="spinner"></div>
              <p>
                Resolving {paymentIdDomain} for{" "}
                {
                  PAYMENT_ID_CHAINS[
                    selectedPaymentIdChain as keyof typeof PAYMENT_ID_CHAINS
                  ]
                }
                ...
              </p>
            </div>
          )}

          {paymentIdError && (
            <div className="payment-error">
              <h4>❌ Error</h4>
              <p>{paymentIdError}</p>
              <p>Request time: {paymentIdElapsedTime}ms</p>
            </div>
          )}

          {!paymentIdError && paymentIdResult && !paymentIdLoading && (
            <div className="payment-success">
              <h4>✅ Success</h4>
              <div className="payment-result">
                <pre>{paymentIdResult}</pre>
                <p>Request time: {paymentIdElapsedTime}ms</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

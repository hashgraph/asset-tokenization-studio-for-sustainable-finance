#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
//
// Analyze a Hedera transaction: decode revert reasons, show logs for successful txs.
//
// Usage:
//   node scripts/utils/analyze-tx.js <transactionId>
//
// Accepted formats:
//   0.0.3774976@1770968284.847000000   (Hedera native)
//   0.0.3774976-1770968284-847000000   (mirror node URL format)
//   0x<evm tx hash>

const https = require("https");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const NETWORK = process.env.HEDERA_NETWORK || "testnet";
const MIRROR_BASE = `https://${NETWORK}.mirrornode.hedera.com/api/v1`;

// ─── HOW TO UPDATE ERROR_SELECTORS AND KNOWN_EVENTS FOR A NEW PROJECT ────────
//
// When you move this script to a new project, you need to rebuild ERROR_SELECTORS
// and KNOWN_EVENTS from that project's compiled Solidity artifacts.
// Here is exactly how to do it — run these steps in Node.js or a one-off script.
//
//
// ── A. ERROR_SELECTORS (custom revert errors) ─────────────────────────────────
//
// 1. Find all compiled ABI files. They live in:
//      <project>/artifacts/contracts/**/*.json         (Hardhat)
//      <project>/out/**/*.json                         (Foundry)
//    Each file has an "abi" array.
//
// 2. For each ABI entry where entry.type === "error":
//    a. Build the canonical signature: `ErrorName(type1,type2,...)`
//       - Use only the type field of each input, NOT the name.
//       - For tuple types, expand them recursively: `(type1,type2,...)`.
//       - Strip all parameter names (only types matter for the selector).
//    b. Compute: keccak256(canonicalSignature).slice(0, 4 bytes) → 8 hex chars.
//    c. Add to ERROR_SELECTORS: { "<8hexchars>": "ErrorName(human-readable sig)" }
//       - The value is for display only, so you can keep parameter names there.
//
// 3. IMPORTANT: use the `keccak` npm package, NOT Node's built-in crypto.
//    Node's crypto.createHash('sha3-256') is NIST SHA-3, NOT Ethereum keccak256.
//    They produce different hashes. Always use:
//
//      const { createKeccak } = require("keccak")   // npm install keccak
//      const hash = createKeccak("keccak256").update(Buffer.from(sig)).digest("hex")
//
// 4. One-liner to scan all artifacts and print selectors:
//
//      const { createKeccak } = require("keccak")
//      const keccak256 = (s) => createKeccak("keccak256").update(Buffer.from(s)).digest("hex")
//      const glob = require("glob")
//      const fs = require("fs")
//
//      const seen = new Set()
//      for (const file of glob.sync("**/artifacts/**/*.json", { ignore: ["**/*.dbg.json"] })) {
//        const abi = JSON.parse(fs.readFileSync(file)).abi ?? []
//        for (const e of abi.filter(x => x.type === "error")) {
//          const types = e.inputs.map(i => i.type).join(",")
//          const sig = `${e.name}(${types})`
//          if (!seen.has(sig)) {
//            seen.add(sig)
//            console.log(`  "${keccak256(sig).slice(0, 8)}": "${e.name}(${e.inputs.map(i=>`${i.type} ${i.name}`).join(", ")})",`)
//          }
//        }
//      }
//
//
// ── B. KNOWN_EVENTS (topic0 hashes) ──────────────────────────────────────────
//
// 1. Same artifact scan, but filter entry.type === "event".
//
// 2. Canonical signature for topic0:
//    a. `EventName(type1,type2,...)`  — again, types only, no names, no "indexed".
//    b. topic0 = keccak256(canonicalSignature)  → full 32-byte (64 hex char) hash.
//       Do NOT slice — topic0 is the full 32-byte hash.
//
// 3. For KNOWN_EVENTS you also need to know which params are indexed (topic1/2/3).
//    From the ABI: inputs where input.indexed === true appear as topics[1..3].
//    Non-indexed params are ABI-encoded in log.data.
//
// 4. One-liner to print event entries:
//
//      for (const e of abi.filter(x => x.type === "event")) {
//        const types = e.inputs.map(i => i.type).join(",")
//        const sig = `${e.name}(${types})`
//        const topic0 = keccak256(sig)
//        const indexed = e.inputs.filter(i => i.indexed).map(i => `${i.name}:${i.type}`)
//        const display = e.inputs.map(i => `${i.type} ${i.name}`).join(", ")
//        console.log(`  "${topic0}": { sig: "${e.name}(${display})", topics: [${indexed.map(x=>`"${x}"`).join(", ")}] },`)
//      }
//
//
// ── C. Diamond / proxy contracts (facets) ─────────────────────────────────────
//
// In a Diamond pattern, the top-level contract delegates to facets. Errors and
// events can be defined in ANY facet, not just the main artifact.
// → Scan ALL facet artifacts, not just the entry point.
//
// In this project the relevant artifact roots are:
//   packages/shared/contracts/artifacts/contracts/**           (shared facets, BLR, factory)
//   packages/ats/contracts/artifacts/contracts/**              (ATS-specific facets, FactorySuite)
//   node_modules/@[scope]/[package]/artifacts/**               (TRex / ERC3643 library errors)
//
// If an error or event is NOT found in any artifact, check:
//   - The contract was not recompiled yet (run `npx hardhat compile`)
//   - The ABI was generated from an interface, not the implementation
//   - The selector comes from an imported OpenZeppelin / TRex library contract
//     → scan node_modules artifacts too
//
//
// ── D. Verifying a selector or topic0 manually ───────────────────────────────
//
//   node -e "
//     const { createKeccak } = require('keccak')
//     const h = s => createKeccak('keccak256').update(Buffer.from(s)).digest('hex')
//     console.log(h('WrongTimestamp(uint256)').slice(0,8))   // → dcf61246
//     console.log(h('Transfer(address,address,uint256)'))    // → full topic0
//   "
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Known 4-byte error selectors ────────────────────────────────────────────

const ERROR_SELECTORS = {
  // Standard Solidity
  "08c379a0": "Error(string)",
  "4e487b71": "Panic(uint256)",

  // Access / roles
  "1e09743f": "Unauthorized(address,address,bytes32)",
  a1180aad: "AccountHasNoRole(address,bytes32)",
  "90e55392": "AccountHasNoRoles(address,bytes32[])",
  "3ad9a7ae": "AccountNotAssignedToRole(bytes32,address)",
  a6006e94: "AccountAssignedToRole(bytes32,address)",
  "365ff1a4": "RolesAndActivesLengthMismatch(uint256,uint256)",
  aa4b6234: "RolesNotApplied(bytes32[],bool[],address)",

  // Initialization
  "0dc149f0": "AlreadyInitialized()",
  "2afc1825": "AlreadyInitializedV2()",
  "0b845f7f": "NoInitialAdmins()",
  "70e9efd4": "NoInitialAdmins((bytes32,address[])[])",

  // Address / zero checks
  "10c748a6": "InvalidAddressZero()",
  "8579befe": "ZeroAddressNotAllowed()",
  "42cad957": "ZeroOwnerAddress()",
  "80e32d8f": "SpenderWithZeroAddress()",
  "19bb4029": "InvalidContractAddress(address)",

  // Bond lifecycle / dates
  "1c94559c": "WrongDates(uint256,uint256)",
  dcf61246: "WrongTimestamp(uint256)",
  "25c20828": "InvalidTimestamp(uint256)",
  "1addb674": "InvalidDate(uint256,uint256,uint256)",
  "8914d40b": "InvalidDateRange(uint256,uint256)",
  d937486c: "InvalidDates()",
  "67a8e319": "BondMaturityDateWrong()",
  "094c9a35": "NotPaymentDate(uint256,uint256)",

  // Bond / coupon / interest rate
  "3a11c78b": "CouponCreationFailed()",
  "849d4eb8": "InterestRateIsFixed()",
  "68eba14f": "InterestRateIsKpiLinked()",
  "15a15b0a": "InterestRateIsSustainabilityPerformanceTarget()",
  "570cf0d3": "WrongInterestRateValues((uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint8))",
  a60b6cba: "WrongImpactDataValues((uint256,uint256,uint256,uint8,uint256))",

  // FactorySuite / factory
  be94552d: "BondDeploymentFailed()",
  c340e5b3: "TreasuryDeploymentFailed()",
  50257673: "DeployBondFailed()",
  b153e4d6: "InvalidTreasuryData()",
  "956d96ce": "WrongTreasury(address)",

  // KPI
  "74efd82c": "KpiDataAlreadyExists(uint256)",
  "2f850995": "NotExistingProject(address)",

  // Balance / supply / amounts
  "5d6824c4": "InsufficientBalance(address,uint256,uint256,bytes32)",
  efafde54: "InsufficientFrozenBalance(address,uint256,uint256,bytes32)",
  "7ff7d816": "InsufficientHoldBalance(uint256,uint256)",
  "74e0caad": "NotEnoughBalance(uint256)",
  b1d4c9d4: "NotEnoughFunds(address,uint256,uint256,address)",
  f9f84915: "MaxSupplyReached(uint256)",
  "57c004a9": "MaxSupplyReachedForPartition(bytes32,uint256)",
  "98c2b03b": "NewMaxSupplyTooLow(uint256,uint256)",
  "76f138fb": "NewMaxSupplyCannotBeZero()",
  "820c68a8": "NewMaxSupplyForPartitionTooLow(bytes32,uint256,uint256)",
  "21aa64a7": "NewMaxSupplyByPartitionTooHigh(bytes32,uint256,uint256)",
  "36337fc1": "NotAllowedAmount(uint256)",
  "7c946ed7": "ZeroValue()",
  cac7e5bb: "WrongQuantities(uint256,uint256,uint256,uint256)",

  // Hold / lock / clearing
  "039be1dd": "WrongLockId()",
  "7e90c2c9": "WrongHoldId()",
  "2e37608c": "WrongClearingId()",
  "0415b9f9": "HoldExpirationReached()",
  "20aa310e": "HoldExpirationNotReached()",
  "5ea0e3b0": "ExpirationDateReached()",
  affb3088: "ExpirationDateNotReached()",
  e8232ac2: "LockExpirationNotReached()",
  "5b2e3086": "ClearingIsActivated()",
  "9f2523d3": "ClearingIsDisabled()",

  // Partitions
  "4a6f30c3": "ZeroPartition()",
  bf84f4ec: "InvalidPartition(address,bytes32)",
  b96d9539: "PartitionNotAllowedInSinglePartitionMode(bytes32)",
  "76d08f88": "NotAllowedInMultiPartitionMode()",
  "05681565": "PartitionsAreUnProtected()",
  55347310: "PartitionsAreProtectedAndNoRole(address,bytes32)",

  // Token / HTS
  "649815a5": "TokenIsPaused()",
  "72058d69": "TokenIsUnpaused()",
  f4b7b072: "TokenIsNotControllable()",
  "809ba4e8": "AssociateTokenFailed(address)",
  ef7f6b32: "AssociationFailed(address)",
  c6e871f4: "DissociateTokenFailed(address,int256)",
  "30bcd300": "TransferPaymentTokenFailed(address,uint256)",
  "73a1b14a": "TransferEnvironmentalAssetTokenFailed(address,address,uint256)",
  fd37ed6d: "PaymentTokenTransferError(address,address,int64)",
  "99dcfe11": "EnvironmentalAssetTokenTransferError(address,address,int64)",
  "1b245d57": "GetTokenDecimalsFailed(address,int256)",
  f6aad11a: "InvalidTokenDecimals(address,int32)",
  e80be37a: "GetAssetDecimalsFailed(address)",
  "3c4ac0df": "PaymentTokenCreateError(string,string,int256)",
  "99c7109e": "EnvironmentalAssetCreateError(string,string,int256)",
  "9b7b75b2": "WrongPaymentToken(address)",
  e4446cce: "AssetNominalValueError(address)",
  "6f79c78a": "InvalidAsset(address)",
  c85b58f8: "WrongAsset(address)",

  // KYC / compliance / identity
  "209d2853": "AddressNotVerified()",
  d5209e15: "KycIsNotGranted()",
  fc855b1b: "InvalidKycStatus()",
  "7e82407d": "NotCompliantAccount(address,address)",
  "66eb1b54": "ComplianceNotAllowed()",
  "67fba102": "ComplianceCallFailed()",
  "682a9065": "AlreadyBound()",
  "179435b3": "NotBound()",
  ad87849e: "IdentityRegistryCallFailed()",

  // Control lists / KYC lists / pauses
  "1a4a04ba": "ListedAccount(address)",
  "4c463ddc": "UnlistedAccount(address)",
  "67a1e319": "ListedControlList(address)",
  "6b4e1917": "UnlistedControlList(address)",
  "91c6b79d": "ListedKycList(address)",
  f5cc4d79: "UnlistedKycList(address)",
  "267b9ec9": "ListedPause(address)",
  "3281637c": "UnlistedPause(address)",
  cb2beece: "ListedIssuer(address)",
  d1243a92: "UnlistedIssuer(address)",
  bd29da3f: "ExternalControlListsNotUpdated(address[],bool[])",
  "8a85ec02": "ExternalKycListsNotUpdated(address[],bool[])",
  "2d931b36": "ExternalPausesNotUpdated(address[],bool[])",
  "796c1f0d": "AccountIsBlocked(address)",
  cd324f53: "AccountIsNotIssuer(address)",

  // BLR / Diamond / resolver
  "3db7c72e": "InvalidResolverAddress(address)",
  "840a2011": "EmptyResolver(address)",
  "5416eb98": "FunctionNotFound(bytes4)",
  "09ece444": "SelectorBlacklisted(bytes4)",
  "7da728b1": "ZeroKeyNotValidForBusinessLogic()",
  "193c9b12": "BusinessLogicKeyDuplicated(bytes32)",
  "0f5ce4d0": "BusinessLogicVersionDoesNotExist(uint256)",
  "9a7772cd": "ResolverProxyConfigurationNoRegistered(bytes32,uint256)",
  "7e045694": "FacetIdNotRegistered(bytes32,bytes32)",
  "9585f5e1": "DuplicatedFacetInConfiguration(bytes32)",
  a5d5f632: "DefaultValueForConfigurationIdNotPermitted()",

  // Signatures / nonces / ERC2612
  "356a4418": "WrongSignature()",
  "5763538a": "WrongSignatureLength()",
  d93f5efe: "WrongNounce(uint256,address)",
  "5f87bc00": "WrongChainId()",
  "724a779a": "ExpiredDeadline(uint256)",
  "4b800e46": "ERC2612InvalidSigner(address,address)",
  62791302: "ERC2612ExpiredSignature(uint256)",

  // Proceed recipients
  "664dc89c": "ProceedRecipientNotFound(address)",
  b7fd3b5b: "ProceedRecipientAlreadyExists(address)",
  "41d435ea": "WrongProceedsRecipient(address)",

  // Offering / subscription (primary market)
  "5e1352fa": "OfferingDoesNotExist(uint256)",
  "64824e81": "OfferingCannotBeExecuted(uint256)",
  df38924e: "OfferingCannotBeCancelled(uint256)",
  "80247e5e": "SubscriptionNotAcceptedForOffering(uint256)",
  "10d117b4": "SubscriptionDoesNotExist(uint256,uint256)",
  "4f63ad27": "SubscriptionIsNotActive(uint256,uint256)",
  dc7b7c14: "SubscriptionExceedsTarget(uint256,uint256,uint256)",
  d9dd274f: "UnauthorizedAccountForOffering(address,uint256)",
  a8888cf4: "InvalidSubscriptionLotUnits(uint256,uint256,uint256)",

  // ISIN / document
  df749cc5: "WrongISIN(string)",
  "342c92db": "WrongISINChecksum(string)",
  "2ef13105": "EmptyName()",
  "402e72be": "EmptyHASH()",
  d07b00d6: "EmptyURI()",
  c2e54650: "DocumentDoesNotExist(bytes32)",

  // Misc
  "6e128399": "Unimplemented()",
  d6234725: "NotImplemented()",
  "03018ac6": "InvalidRuleCombination(uint8,uint8)",
  "07ac0eb9": "InputBoolArrayLengthMismatch()",
  "64f13710": "InputAmountsArrayLengthMismatch()",
  "4470462b": "ProvidedListsLengthMismatch(uint256,uint256)",
  fcaaa691: "RegulationTypeAndSubTypeForbidden(uint8,uint8)",
  "0c68e660": "BalanceAdjustmentCreationFailed()",
  "0cc16600": "VotingRightsCreationFailed()",
  "409bf2d2": "DividendCreationFailed()",
  ba5b0d48: "RedeemAtMaturityByPartitionError(address,address,bytes32)",
  e7cfb56c: "BalanceOfByPartitionError(address,address,bytes32)",
  f180d8f9: "InsufficientAllowance(address,address)",
  "8e81eb83": "SnapshotIdDoesNotExists(uint256)",
  f128004d: "SnapshotIdNull()",
  "505389ae": "CannotRecoverWallet()",
  f9f9bcf9: "WalletRecovered()",
  db0a3012: "InvalidDestinationAddress(address,address)",
  f50c17aa: "ContradictoryValuesInArray(uint256,uint256)",
  "936e9b6d": "FactorIsZero()",
  "3266e9e3": "DuplicatedCorporateAction(bytes32,bytes)",
  d3924f4e: "WrongIndexForAction(uint256,bytes32)",
};

// ─── Known event topic0 → { sig, topics[] } ──────────────────────────────────
// topic0 = keccak256(canonical event signature)  (real values from compiled ABIs)
// topics: array of "name:type" for indexed params (topic1, topic2, topic3)

const KNOWN_EVENTS = {
  // ── FactorySuite (local contract) ─────────────────────────────────────────
  "224aa1559d5d7642b820ae5bcb9f8f5354e4e84b8460e0bb65bde342dd74ecff": {
    sig: "BondSuiteDeployed(address deployer, address bond, address treasury, BondKpiLinkedRateData, TreasuryData)",
    topics: ["deployer:address", "bond:address", "treasury:address"],
  },

  // ── Factory events (TRex) ─────────────────────────────────────────────────
  "45915a0104ea5671b1651c88183b8d6175450f67c9ad1462ed080594e0b10ec6": {
    sig: "BondKpiLinkedRateDeployed(address deployer, address bond, BondKpiLinkedRateData)",
    topics: ["deployer:address"],
  },
  "7760a5a38dddb73a76a698ab856ee89aa872213a7df0adfbca3c176f2cb74b23": {
    sig: "BondFixedRateDeployed(address deployer, address bond, BondFixedRateData)",
    topics: ["deployer:address"],
  },
  "01d3e27a30d468a96e49f71ff84af896733789c198ff030dae07d2d9ae9e9f17": {
    sig: "BondDeployed(address deployer, address bond, BondData, FactoryRegulationData)",
    topics: ["deployer:address"],
  },
  "59f510d04f090e1185bc91d7647b595294572073ef9f4754e7604b2a8af1e5f2": {
    sig: "EquityDeployed(address deployer, address equity, EquityData, FactoryRegulationData)",
    topics: ["deployer:address"],
  },

  // ── ERC3643 token events ──────────────────────────────────────────────────
  "7f3a888862559648ec01d97deb7b5012bff86dc91e654a1de397170db40e35b6": {
    sig: "ComplianceAdded(address compliance)",
    topics: [],
  },
  d2be862d755bca7e0d39772b2cab3a5578da9c285f69199f4c063c2294a7f36c: {
    sig: "IdentityRegistryAdded(address identityRegistry)",
    topics: [],
  },

  // ── Access control ────────────────────────────────────────────────────────
  "03b5d550f3da9dfe316fa35cbecc4cee6d2febeaeee1432f30504bd9ce3780a8": {
    sig: "RoleGranted(address operator, address account, bytes32 role)",
    topics: ["operator:address", "account:address", "role:bytes32"],
  },
  d1c3e214f7584ab57912c23f3cead20e310547c9823c8bc891ba162e35622734: {
    sig: "RoleRevoked(address operator, address account, bytes32 role)",
    topics: ["operator:address", "account:address", "role:bytes32"],
  },
  "4267fc5085e309828a2ec01d2d3a5ad76fa27eee7beada466b9cd88872fea422": {
    sig: "RolesApplied(bytes32[] roles, bool[] actives, address account)",
    topics: [],
  },

  // ── KYC ──────────────────────────────────────────────────────────────────
  "0cc42ba172587888529a0b89cc75bd6914b337cf10757fd80e3246330e55ad94": {
    sig: "KycGranted(address account, address issuer)",
    topics: ["account:address", "issuer:address"],
  },
  "5d9279616441228548cfb67f31b7b9b131fd30de1b3c54a6dd0062a74ce638a6": {
    sig: "KycRevoked(address account, address issuer)",
    topics: ["account:address", "issuer:address"],
  },

  // ── Bond ─────────────────────────────────────────────────────────────────
  beb7fdc8c5c160b79de3e9c869bf2f6b287cbe29eb05d7623537a427231942ee: {
    sig: "CouponSet(bytes32 corporateActionId, uint256 couponId, address operator, Coupon coupon)",
    topics: [],
  },

  // ── KPI / interest rate ───────────────────────────────────────────────────
  b14d0e5a6665e6c690dc5c7ffc777323768a449038bc6bfed9986ecd52547303: {
    sig: "KpiDataAdded(address project, uint256 date, uint256 value)",
    topics: ["project:address"],
  },
  efa3dfa8d78e0e27426092335dd8b8728d75c9cb08c41f913912f43124eadf69: {
    sig: "ImpactDataUpdated(address operator, ImpactData newImpactData)",
    topics: ["operator:address"],
  },
  d0b63916056283821cf7a22555fc10acfeb558f32eed0b4507f4e564e193fdd1: {
    sig: "InterestRateUpdated(address operator, InterestRate newInterestRate)",
    topics: ["operator:address"],
  },

  // ── Pause ─────────────────────────────────────────────────────────────────
  f017c0de579727a3cd3ee18077ee8b4c43bf21892985952d1d5a0d52f983502d: {
    sig: "TokenPaused(address operator)",
    topics: ["operator:address"],
  },
  f38578ed892ce2ce655ca8ae03c73464ad74915a1331a9b4085e637534daeedf: {
    sig: "TokenUnpaused(address operator)",
    topics: ["operator:address"],
  },

  // ── ERC20 / transfers ─────────────────────────────────────────────────────
  ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef: {
    sig: "Transfer(address from, address to, uint256 value)",
    topics: ["from:address", "to:address"],
  },
  "8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
    sig: "Approval(address owner, address spender, uint256 value)",
    topics: ["owner:address", "spender:address"],
  },

  // ── ERC1410 partition transfers ───────────────────────────────────────────
  "5af1c8f424b104b6ba4e3c0885f2ed9fef04a9b1ea39cd9ed362432105c0791a": {
    sig: "IssuedByPartition(bytes32 partition, address operator, address to, uint256 value, bytes data)",
    topics: ["partition:bytes32", "operator:address", "to:address"],
  },
  a4f62471c9bdf88115b97203943c74c59b655913ee5ee592706d84ef53fb6be2: {
    sig: "RedeemedByPartition(bytes32 partition, address operator, address from, uint256 value, bytes data, bytes operatorData)",
    topics: ["partition:bytes32", "operator:address", "from:address"],
  },
  ff4e9a26af4eb73b8bacfaa4abd4fea03d9448e7b912dc5ff4019048875aa2d4: {
    sig: "TransferByPartition(bytes32 fromPartition, address operator, address from, address to, uint256 value, bytes data, bytes operatorData)",
    topics: ["fromPartition:bytes32"],
  },

  // ── Freeze ────────────────────────────────────────────────────────────────
  "7fa523c84ab8d7fc5b72f08b9e46dbbf10c39e119a075b3e317002d14bc9f436": {
    sig: "AddressFrozen(address userAddress, bool isFrozen, address owner)",
    topics: ["userAddress:address", "isFrozen:bool", "owner:address"],
  },

  // ── Hold ─────────────────────────────────────────────────────────────────
  c5c40f4f39271cfbce3124ffa5441f632998927732cf26ac2038f2bfd15365d8: {
    sig: "HeldByPartition(address operator, address tokenHolder, bytes32 partition, uint256 holdId, Hold hold, bytes operatorData)",
    topics: ["operator:address", "tokenHolder:address"],
  },
  "6c167944f4b372d42d168efc93004d7e517cb82a501d67490af33f95530ca50e": {
    sig: "HoldByPartitionReleased(address tokenHolder, bytes32 partition, uint256 holdId, uint256 amount)",
    topics: ["tokenHolder:address", "partition:bytes32"],
  },
  "4fb20409d1b2a56fa4c5b29c11d9b1e148649db67860c5648a8a86f35edf8582": {
    sig: "HoldByPartitionExecuted(address tokenHolder, bytes32 partition, uint256 holdId, uint256 amount, address to)",
    topics: ["tokenHolder:address", "partition:bytes32"],
  },

  // ── Lock ──────────────────────────────────────────────────────────────────
  "1f36cfc418f72043825aa85b5d279c03191ab83364af0ec5f170d67f1a7ba152": {
    sig: "LockedByPartition(address tokenHolder, address operator, bytes32 partition, uint256 lockId, uint256 amount, uint256 expirationDate)",
    topics: ["tokenHolder:address", "operator:address", "partition:bytes32"],
  },
  "6b9cdd97822563ef24ac6b58b361df36a653662e434bb96e40fa50ae5c9de688": {
    sig: "LockByPartitionReleased(address operator, address tokenHolder, bytes32 partition, uint256 lockId)",
    topics: ["operator:address", "tokenHolder:address", "partition:bytes32"],
  },

  // ── Cap ───────────────────────────────────────────────────────────────────
  ccc3b7560f9d81f26c619129ba9fa74ded9a6edb555a04655baaeca673e0a809: {
    sig: "MaxSupplySet(address operator, uint256 newMaxSupply, uint256 previousMaxSupply)",
    topics: ["operator:address"],
  },

  // ── Treasury / Portfolio ──────────────────────────────────────────────────
  bbbf805ef99ca7d0b7d2cc769719f2a281c9b3331a3642efa75a712e3094a166: {
    sig: "TokenAssociated(address token)",
    topics: [],
  },
  "6feadbc0fdfae236904fe63b52ce02cbfd83164f46b17b21459b2dcf81aa8bad": {
    sig: "TokenDissociated(address token)",
    topics: [],
  },
  "414d697768e66effabbaa073131f722798b33c994b7d6acc2bb0821273bf0851": {
    sig: "EnvironmentalAssetAdded(address token, address portfolio)",
    topics: [],
  },
  "9bbd8e5e94f61ebca6d5bda66b0905eaea1a3322e3287f15f3cfa1cdc52a3a20": {
    sig: "EnvironmentalAssetRemoved(address token, address portfolio, int256 amount)",
    topics: [],
  },
  "4ddaf9ab623b4c32111a4bcf0643c5245f557c840d4fe3dead9e20f8a0e000f2": {
    sig: "PaymentTokenUpdated(address old, address newToken, address portfolio, int256 amount)",
    topics: [],
  },

  // ── BLR / Diamond ─────────────────────────────────────────────────────────
  "2b0a236a05eac0a818ab3435c90311b574fcdfc44d62b8f8a8d487e534701ddd": {
    sig: "BusinessLogicsRegistered(BusinessLogicRegistryData[] businessLogics, uint256 newLatestVersion)",
    topics: [],
  },
  "4c11a9f3e7b8f0ac9192fb594ac8c0e0e222fc0098f7eca99e460ec13c63741b": {
    sig: "DiamondConfigurationCreated(bytes32 configurationId, FacetConfiguration[] facetConfigurations, uint256 version)",
    topics: [],
  },

  // ── Snapshots ────────────────────────────────────────────────────────────
  d252178ed4aae4bc61be5bc8161b97bca1aae7b7fbde4523d5f4498cfca42763: {
    sig: "SnapshotTaken(address operator, uint256 snapshotID)",
    topics: ["operator:address", "snapshotID:uint256"],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeTxId(raw) {
  // 0.0.X@sec.nano  →  0.0.X-sec-nano
  const atMatch = raw.match(/^(\d+\.\d+\.\d+)@(\d+)\.(\d+)$/);
  if (atMatch) {
    return `${atMatch[1]}-${atMatch[2]}-${atMatch[3]}`;
  }
  return raw;
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 404) {
            reject(new Error(`404 Not Found: ${url}`));
            return;
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON from ${url}: ${data.slice(0, 200)}`));
          }
        });
      })
      .on("error", reject);
  });
}

// ─── Decoding ─────────────────────────────────────────────────────────────────

function decodeRevertReason(hex) {
  if (!hex || hex === "0x" || hex.length < 10) return null;
  const data = hex.startsWith("0x") ? hex.slice(2) : hex;
  const selector = data.slice(0, 8).toLowerCase();

  if (ERROR_SELECTORS[selector]) {
    const sig = ERROR_SELECTORS[selector];
    const args = decodeArgs(sig, data.slice(8));
    return { selector, sig, args };
  }
  return { selector, sig: "Unknown", args: [] };
}

function decodeArgs(sig, hex) {
  if (!hex || hex.length === 0) return [];
  const match = sig.match(/\(([^)]*)\)/);
  if (!match || !match[1]) return [];
  const types = match[1].split(",").map((t) => t.trim());
  const results = [];
  let offset = 0;
  for (const type of types) {
    if (hex.length < offset + 64) break;
    const word = hex.slice(offset, offset + 64);
    offset += 64;
    if (type === "string" || type === "bytes") {
      results.push(`(${type}) 0x${word}`);
    } else if (type === "address") {
      results.push(`(address) 0x${word.slice(24)}`);
    } else if (type === "bytes32") {
      results.push(`(bytes32) 0x${word}`);
    } else if (type.startsWith("uint") || type.startsWith("int")) {
      const n = BigInt("0x" + word);
      const asDate = new Date(Number(n) * 1000);
      const isTimestamp = n > 1_000_000_000n && n < 9_999_999_999n && /Timestamp|Dates|date|time/i.test(sig);
      results.push(isTimestamp ? `(${type}) ${n} (${asDate.toISOString()})` : `(${type}) ${n}`);
    } else {
      results.push(`(${type}) 0x${word}`);
    }
  }
  return results;
}

function decodeIndexedTopic(typeSpec, rawTopic) {
  // typeSpec: "name:type" e.g. "deployer:address"
  const colonIdx = typeSpec.indexOf(":");
  const name = typeSpec.slice(0, colonIdx);
  const type = typeSpec.slice(colonIdx + 1);
  const hex = rawTopic.startsWith("0x") ? rawTopic.slice(2) : rawTopic;

  if (type === "address") {
    return `    ${name}: 0x${hex.slice(24)}`;
  } else if (type === "bytes32") {
    // Try to decode as ASCII string (role names, partition names etc.)
    const bytes = Buffer.from(hex, "hex");
    const str = bytes.toString("utf8").replace(/\x00/g, "");
    const printable = str.replace(/[^\x20-\x7e]/g, "");
    if (printable.length > 2) return `    ${name}: 0x${hex}  ("${printable}")`;
    return `    ${name}: 0x${hex}`;
  } else if (type === "uint256" || type === "uint") {
    const n = BigInt("0x" + hex);
    return `    ${name}: ${n}`;
  } else if (type === "bool") {
    return `    ${name}: ${BigInt("0x" + hex) !== 0n}`;
  }
  return `    ${name}: 0x${hex}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const rawId = process.argv[2];
  if (!rawId) {
    console.error("Usage: node analyze-tx.js <transactionId>");
    console.error("  Formats: 0.0.X@sec.nano  |  0.0.X-sec-nano  |  0x<evmHash>");
    process.exit(1);
  }

  const txId = normalizeTxId(rawId);
  console.log(`\nAnalyzing transaction: ${txId}`);
  console.log(`Mirror node: ${MIRROR_BASE}\n`);

  // ── 1. Fetch transaction ──────────────────────────────────────────────────
  let tx;
  try {
    const res = await get(`${MIRROR_BASE}/transactions/${txId}`);
    tx = res.transactions?.[0] ?? res;
  } catch (e) {
    console.error("Failed to fetch transaction:", e.message);
    process.exit(1);
  }

  const status = tx.result ?? tx.status ?? "unknown";
  const charged = tx.charged_tx_fee ?? 0;
  const consensus = tx.consensus_timestamp ?? "";

  console.log(`Status         : ${status}`);
  console.log(`Consensus time : ${consensus}`);
  console.log(`Fee (tinybar)  : ${charged}`);

  if (tx.transfers?.length) {
    console.log(`\nHBAR transfers:`);
    for (const t of tx.transfers) {
      if (t.amount !== 0) {
        const sign = t.amount > 0 ? "+" : "";
        console.log(`  ${t.account.padEnd(20)} ${sign}${t.amount} tinybar`);
      }
    }
  }

  // ── 2. Fetch EVM contract result ──────────────────────────────────────────
  let cr;
  try {
    cr = await get(`${MIRROR_BASE}/contracts/results/${txId}`);
  } catch (_) {
    cr = null;
  }

  if (!cr) {
    console.log("\nNo EVM contract result found (non-contract transaction).");
    return;
  }

  console.log(`\nEVM contract result:`);
  console.log(`  From     : ${cr.from ?? "n/a"}`);
  console.log(`  To       : ${cr.to ?? "n/a"}`);
  console.log(`  Gas used : ${cr.gas_used ?? "n/a"}`);
  console.log(`  Block    : ${cr.block_number ?? "n/a"}`);

  // ── 3. Revert / error decoding ────────────────────────────────────────────
  if (status !== "SUCCESS") {
    console.log(`\n--- REVERT ---`);
    const errorMsg = cr.error_message ?? cr.revert_reason ?? null;
    if (errorMsg) {
      console.log(`Raw error data : ${errorMsg}`);
      const decoded = decodeRevertReason(errorMsg);
      if (decoded) {
        if (decoded.sig !== "Unknown") {
          console.log(`Decoded error  : ${decoded.sig}`);
          if (decoded.args.length) {
            console.log(`Arguments:`);
            decoded.args.forEach((a) => console.log(`  ${a}`));
          }
        } else {
          console.log(`Selector       : 0x${decoded.selector}  (not in known list)`);
          console.log(`Full data      : ${errorMsg}`);
        }
      }
    } else {
      console.log("No error data returned.");
    }

    if (cr.call_result && cr.call_result !== "0x") {
      const decoded = decodeRevertReason(cr.call_result);
      if (decoded && decoded.sig !== "Unknown") {
        console.log(`\nCall result decoded: ${decoded.sig}`);
        decoded.args.forEach((a) => console.log(`  ${a}`));
      }
    }

    // ── call trace (internal subcalls) ───────────────────────────────────────
    let actions;
    try {
      const res = await get(`${MIRROR_BASE}/contracts/results/${txId}/actions`);
      actions = res.actions ?? [];
    } catch (_) {
      actions = [];
    }

    const failedActions = actions.filter(
      (a) => a.result_data_type === "REVERT_REASON" && a.result_data && a.result_data !== "0x",
    );

    if (failedActions.length > 0) {
      console.log(`\n--- CALL TRACE (${failedActions.length} reverted subcalls) ---`);
      for (const a of failedActions) {
        const depth = "  ".repeat(a.call_depth ?? 0);
        console.log(
          `\n${depth}[depth ${a.call_depth ?? 0}] ${a.call_type ?? "CALL"}: ${a.from ?? "?"} → ${a.to ?? "?"}`,
        );
        const decoded = decodeRevertReason(a.result_data);
        if (decoded && decoded.sig !== "Unknown") {
          console.log(`${depth}  Error: ${decoded.sig}`);
          decoded.args.forEach((arg) => console.log(`${depth}    ${arg}`));
        } else if (decoded) {
          console.log(`${depth}  Selector: 0x${decoded.selector}  (unknown)`);
          console.log(`${depth}  Data: ${a.result_data}`);
        }
      }
    } else if (actions.length > 0) {
      console.log(`\n(${actions.length} internal calls — none with revert data)`);
    }

    return;
  }

  // ── 4. Success — show logs ────────────────────────────────────────────────
  console.log(`\n--- LOGS (${cr.logs?.length ?? 0} events) ---`);

  if (!cr.logs || cr.logs.length === 0) {
    console.log("No logs emitted.");
    return;
  }

  for (let i = 0; i < cr.logs.length; i++) {
    const log = cr.logs[i];
    const topic0 = log.topics?.[0] ?? null;
    const t0clean = topic0 ? topic0.replace(/^0x/, "") : null;
    const eventDef = t0clean ? KNOWN_EVENTS[t0clean] : null;

    console.log(`\n  Log #${i + 1}`);
    console.log(`    Contract : ${log.address ?? "n/a"}`);

    if (eventDef) {
      console.log(`    Event    : ${eventDef.sig}`);
      // Decode indexed topics (topic1, topic2, topic3)
      for (let t = 0; t < eventDef.topics.length; t++) {
        if (log.topics?.[t + 1]) {
          console.log(decodeIndexedTopic(eventDef.topics[t], log.topics[t + 1]));
        }
      }
    } else if (topic0) {
      console.log(`    Topic0   : ${topic0}  (unknown event)`);
      for (let t = 1; t < (log.topics?.length ?? 0); t++) {
        console.log(`    Topic${t + 1}   : ${log.topics[t]}`);
      }
    }

    if (log.data && log.data !== "0x") {
      const d = log.data;
      if (d.length <= 130) {
        console.log(`    Data     : ${d}`);
      } else {
        console.log(`    Data     : ${d.slice(0, 66)}... (${Math.floor((d.length - 2) / 2)} bytes)`);
      }
    }
  }

  // ── 5. EVM tx hash ───────────────────────────────────────────────────────
  if (cr.hash) {
    console.log(`\nEVM tx hash: ${cr.hash}`);
  }
}

main().catch((e) => {
  console.error("Unexpected error:", e.message);
  process.exit(1);
});

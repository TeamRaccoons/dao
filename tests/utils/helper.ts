import { AnchorError, BN, Program, Wallet, web3 } from "@coral-xyz/anchor";
import { Govern } from "../../target/types/govern";
import { SmartWallet } from "../../target/types/smart_wallet";
import { MetVoter } from "../../target/types/met_voter";
import { LockedVoter } from "../../target/types/locked_voter";
import {
  GOVERN_PROGRAM_ID,
  MERKLE_DISTRIBUTOR_PROGRAM_ID,
  SMART_WALLET_PROGRAM_ID,
  MET_VOTER_PROGRAM_ID,
} from "./program";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";
import { MerkleDistributor } from "../../target/types/merkle_distributor";

export interface IProposalInstruction {
  programId: web3.PublicKey;
  keys: web3.AccountMeta[];
  data: Buffer;
}

export async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function getOnChainTime(
  connection: web3.Connection
): Promise<number> {
  const parsedClock = await connection.getParsedAccountInfo(
    web3.SYSVAR_CLOCK_PUBKEY
  );

  const parsedClockAccount = (parsedClock.value!.data as web3.ParsedAccountData)
    .parsed as any;

  const currentTime = parsedClockAccount.info.unixTimestamp;
  return currentTime as number;
}

export function deriveVote(voter: web3.PublicKey, proposal: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("Vote"), proposal.toBytes(), voter.toBytes()],
    GOVERN_PROGRAM_ID
  );
}

export function deriveDistributor(basePubkey: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("MerkleDistributor"), basePubkey.toBytes()],
    MERKLE_DISTRIBUTOR_PROGRAM_ID
  );
}

export function deriveSmartWallet(basePubkey: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SmartWallet"), basePubkey.toBytes()],
    SMART_WALLET_PROGRAM_ID
  );
}

export function deriveGovern(basePubkey: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("Governor"), basePubkey.toBytes()],
    GOVERN_PROGRAM_ID
  );
}

export function deriveLocker(basePubkey: web3.PublicKey, programId: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("Locker"), basePubkey.toBytes()],
    programId
  );
}

export function deriveClaimStatus(index: BN, distributor: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ClaimStatus"),
      new Uint8Array(index.toBuffer("le", 8)),
      distributor.toBytes(),
    ],
    MERKLE_DISTRIBUTOR_PROGRAM_ID
  );
}

export function deriveEscrow(
  locker: web3.PublicKey,
  escrowOwner: web3.PublicKey,
  voterProgram: web3.PublicKey,
) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("Escrow"), locker.toBytes(), escrowOwner.toBytes()],
    voterProgram
  );
}

export function deriveTransaction(smartWallet: web3.PublicKey, txNo: BN) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("Transaction"),
      smartWallet.toBytes(),
      new Uint8Array(txNo.toBuffer("le", 8)),
    ],
    SMART_WALLET_PROGRAM_ID
  );
}

export function deriveProposal(governor: web3.PublicKey, proposalCount: BN) {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("Proposal"),
      governor.toBytes(),
      new Uint8Array(proposalCount.toBuffer("le", 8)),
    ],
    GOVERN_PROGRAM_ID
  );
}

export function deriveProposalMeta(proposal: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("ProposalMeta"), proposal.toBytes()],
    GOVERN_PROGRAM_ID
  );
}

export function deriveOptionProposalMeta(proposal: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("OptionProposalMeta"), proposal.toBytes()],
    GOVERN_PROGRAM_ID
  );
}

export async function createProposal(
  governor: web3.PublicKey,
  instruction: IProposalInstruction[],
  governProgram: Program<Govern>
) {
  const governState = await governProgram.account.governor.fetch(governor);
  const [proposal, _bump] = deriveProposal(governor, governState.proposalCount);

  console.log("Creating proposal", proposal.toBase58());

  const tx = await governProgram.methods
    .createProposal(0, 2, instruction)
    .accounts({
      governor,
      payer: governProgram.provider.publicKey,
      smartWallet: governState.smartWallet,
      proposal,
      proposer: governProgram.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Create proposal tx", tx);

  return proposal;
}

export async function createOptionProposal(
  governor: web3.PublicKey,
  instruction: IProposalInstruction[],
  governProgram: Program<Govern>,
  maxOption: number,
) {
  const governState = await governProgram.account.governor.fetch(governor);
  const [proposal, _bump] = deriveProposal(governor, governState.proposalCount);

  console.log("Creating option proposal", proposal.toBase58());

  const tx = await governProgram.methods
    .createProposal(1, maxOption, instruction)
    .accounts({
      governor,
      smartWallet: governState.smartWallet,
      payer: governProgram.provider.publicKey,
      proposal,
      proposer: governProgram.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Create option proposal tx", tx);

  return proposal;
}


export async function createOptionProposalMeta(
  proposal: web3.PublicKey,
  optionDesciptions: string[],
  governProgram: Program<Govern>
) {
  const [optionProposalMeta, bump] = deriveOptionProposalMeta(proposal);

  console.log("Creating option proposal meta", optionProposalMeta.toBase58());

  const tx = await governProgram.methods
    .createOptionProposalMeta(bump, optionDesciptions)
    .accounts({
      payer: governProgram.provider.publicKey,
      proposal,
      optionProposalMeta,
      proposer: governProgram.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Create option proposal meta tx", tx);

  return optionProposalMeta;
}

export async function createProposalMeta(
  proposal: web3.PublicKey,
  title: string,
  descriptionLink: string,
  governProgram: Program<Govern>
) {
  const [proposalMeta, bump] = deriveProposalMeta(proposal);

  console.log("Creating proposal meta", proposalMeta.toBase58());

  const tx = await governProgram.methods
    .createProposalMeta(bump, title, descriptionLink)
    .accounts({
      payer: governProgram.provider.publicKey,
      proposal,
      proposalMeta,
      proposer: governProgram.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Create proposal meta tx", tx);

  return proposalMeta;
}

export async function createDistributor(
  baseKeypair: web3.Keypair,
  locker: web3.PublicKey,
  maxTotalClaim: BN,
  maxNodesClaimed: BN,
  root: Buffer,
  rewardMint: web3.PublicKey,
  mdProgram: Program<MerkleDistributor>
) {
  const [distributor, _bump] = deriveDistributor(baseKeypair.publicKey);
  const tokenVault = getAssociatedTokenAddressSync(rewardMint, distributor, true);
  const clawbackReceiver = await getOrCreateATA(rewardMint, baseKeypair.publicKey, baseKeypair, mdProgram.provider.connection);
  console.log("Creating distributor", distributor.toBase58());

  const tx = await mdProgram.methods
    .newDistributor(
      locker,
      Array.from(new Uint8Array(root)),
      maxTotalClaim,
      maxNodesClaimed,
      new BN(999999999999),
    )
    .accounts({
      base: baseKeypair.publicKey,
      distributor,
      mint: rewardMint,
      tokenVault,
      admin: mdProgram.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      clawbackReceiver,
    })
    .signers([baseKeypair])
    .rpc();

  console.log("Create distributor tx", tx);

  return distributor;
}

export async function createSmartWallet(
  owners: web3.PublicKey[],
  maxOwners: number,
  delay: BN,
  threshold: BN,
  baseKeypair: web3.Keypair,
  smartWalletProgram: Program<SmartWallet>
) {
  const [smartWallet, bump] = deriveSmartWallet(baseKeypair.publicKey);

  console.log("Creating smart wallet", smartWallet.toBase58());

  const tx = await smartWalletProgram.methods
    .createSmartWallet(maxOwners, owners, threshold, delay)
    .accounts({
      base: baseKeypair.publicKey,
      payer: smartWalletProgram.provider.publicKey,
      smartWallet,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([baseKeypair])
    .rpc();

  console.log("Create smart wallet tx", tx);

  return smartWallet;
}

export async function createAndFundWallet(
  connection: web3.Connection,
  keypair?: web3.Keypair
) {
  if (!keypair) {
    keypair = web3.Keypair.generate();
    console.log("Creating wallet", keypair.publicKey.toBase58());
  }

  console.log("Funding wallet");

  const tx = await connection.requestAirdrop(
    keypair.publicKey,
    1000 * web3.LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(tx);

  console.log("Funded wallet 1000 SOL");

  const wallet = new Wallet(keypair);
  return {
    keypair,
    wallet,
  };
}

export async function createGovernor(
  votingDelay: BN,
  votingPeriod: BN,
  quorumVotes: BN,
  timelockDelaySeconds: BN,
  baseKeypair: web3.Keypair,
  smartWallet: web3.PublicKey,
  governProgram: Program<Govern>,
  voterProgram: web3.PublicKey
) {
  const [governor, gBump] = deriveGovern(baseKeypair.publicKey);
  const [locker, lBump] = deriveLocker(baseKeypair.publicKey, voterProgram);

  console.log("Creating governor", governor.toBase58());

  const tx = await governProgram.methods
    .createGovernor(locker, {
      votingDelay,
      votingPeriod,
      quorumVotes,
      timelockDelaySeconds,
    })
    .accounts({
      base: baseKeypair.publicKey,
      governor,
      payer: governProgram.provider.publicKey,
      smartWallet,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([baseKeypair])
    .rpc();

  console.log("Create governor tx", tx);

  return governor;
}

export async function createMetLocker(
  expiration: BN,
  maxStakeDuration: BN,
  maxStakeVoteMultiplier: number,
  minStakeDuration: BN,
  proposalActivationMinVotes: BN,
  baseKeypair: web3.Keypair,
  tokenMint: web3.PublicKey,
  governor: web3.PublicKey,
  voterProgram: Program<MetVoter>
) {
  const [locker, _bump] = deriveLocker(baseKeypair.publicKey, voterProgram.programId);

  console.log("Creating locker", locker.toBase58());

  const onchainTimestamp = await getOnChainTime(
    voterProgram.provider.connection
  );
  const expireTimestamp = new BN(onchainTimestamp).add(expiration);

  const tx = await voterProgram.methods
    .newLocker(expireTimestamp, {
      maxStakeDuration,
      maxStakeVoteMultiplier,
      minStakeDuration,
      proposalActivationMinVotes,
    })
    .accounts({
      locker,
      tokenMint,
      governor,
      payer: voterProgram.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Create locker tx", tx);

  return locker;
}


export async function createLocker(
  maxStakeDuration: BN,
  maxStakeVoteMultiplier: number,
  minStakeDuration: BN,
  proposalActivationMinVotes: BN,
  baseKeypair: web3.Keypair,
  tokenMint: web3.PublicKey,
  governor: web3.PublicKey,
  voterProgram: Program<LockedVoter>
) {
  const [locker, _bump] = deriveLocker(baseKeypair.publicKey, voterProgram.programId);

  console.log("Creating locker", locker.toBase58());


  const tx = await voterProgram.methods
    .newLocker({
      maxStakeDuration,
      maxStakeVoteMultiplier,
      minStakeDuration,
      proposalActivationMinVotes,
    })
    .accounts({
      locker,
      tokenMint,
      governor,
      payer: voterProgram.provider.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Create locker tx", tx);

  return locker;
}

export async function getOrCreateVote(
  proposal: web3.PublicKey,
  governProgram: Program<Govern>
) {
  const [vote, _bump] = deriveVote(governProgram.provider.publicKey, proposal);

  const voteAccount = await governProgram.provider.connection.getAccountInfo(
    vote
  );

  if (!voteAccount) {
    await governProgram.methods
      .newVote(governProgram.provider.publicKey)
      .accounts({
        payer: governProgram.provider.publicKey,
        proposal,
        systemProgram: web3.SystemProgram.programId,
        vote,
      })
      .rpc();
  }

  return vote;
}

export async function getOrCreateATA(
  mint: web3.PublicKey,
  owner: web3.PublicKey,
  payer: web3.Keypair,
  connection: web3.Connection
) {
  const ata = getAssociatedTokenAddressSync(mint, owner, true);

  const account = await connection.getAccountInfo(ata);

  if (!account) {
    const tx = await web3.sendAndConfirmTransaction(
      connection,
      new web3.Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          ata,
          owner,
          mint
        )
      ),
      [payer]
    );

    await connection.confirmTransaction(tx, "confirmed");
  }

  return ata;
}

export async function invokeAndAssertError(
  cb: () => Promise<string>,
  message: string,
  isAnchorError: boolean
) {
  let error = null;

  try {
    await cb();
  } catch (err) {
    error = err;

    if (isAnchorError) {
      expect(error instanceof AnchorError).to.be.true;

      const anchorError: AnchorError = error;
      expect(anchorError.error.errorMessage.toLowerCase()).to.be.equal(
        message.toLowerCase()
      );
    } else {
      const logs: string[] = error.logs;
      expect(logs.find((s) => s.toLowerCase().includes(message.toLowerCase())))
        .to.be.not.undefined;
    }
  }

  expect(error).not.null;
}

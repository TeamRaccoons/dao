import * as anchor from "@coral-xyz/anchor";
import { BN, Wallet, web3 } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, createMint, mintTo } from "@solana/spl-token";
import {
  GOVERN_PROGRAM_ID,
  IProposalInstruction,
  SMART_WALLET_PROGRAM_ID,
  LOCKED_VOTER_PROGRAM_ID,
  VoteSide,
  createAndFundWallet,
  createGovernProgram,
  createGovernor,
  createProposal,
  createProposalMeta,
  createSmartWallet,
  createSmartWalletProgram,
  createLockedVoterProgram,
  deriveEscrow,
  deriveGovern,
  deriveLocker,
  deriveSmartWallet,
  deriveVote,
  getOnChainTime,
  getOrCreateATA,
  getOrCreateVote,
  invokeAndAssertError,
  sleep,
  deriveTransaction,
} from "../utils";
import { expect } from "chai";

const provider = anchor.AnchorProvider.env();

const userCount = 3;
const lockAmount = new BN(100);

describe("Locked voter", () => {
  let locker: web3.PublicKey;
  let govern: web3.PublicKey;
  let smartWallet: web3.PublicKey;
  let proposal: web3.PublicKey;

  let wallet: Wallet;
  let keypair: web3.Keypair;

  let rewardMint: web3.PublicKey;
  let userKeypairs: web3.Keypair[] = [];

  // Smart wallet config
  let smartWalletOwners: web3.PublicKey[] = [];
  let smartWalletThreshold: BN = new BN(1);

  // Govern config
  const votingPeriod: BN = new BN(10); // 10 seconds duration of voting on proposal
  const quorumVotes: BN = new BN(2); // 2 vote to pass

  // Voter config
  const maxStakeDuration: BN = new BN(20); // 20 seconds
  const minStakeDuration: BN = new BN(10); // 10 seconds
  const maxStakeVoteMultiplier: number = 1;
  const proposalActivationMinVotes: BN = new BN(2); // min 2 vote to activate proposal

  async function createSetLockerParamsProposal() {
    const governProgram = createGovernProgram(wallet, GOVERN_PROGRAM_ID);
    const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
    const ixData = voterProgram.coder.instruction.encode("set_locker_params", {
      params: {
        maxStakeVoteMultiplier,
        minStakeDuration,
        maxStakeDuration,
        proposalActivationMinVotes,
      },
    });
    const ix: IProposalInstruction = {
      data: ixData,
      programId: LOCKED_VOTER_PROGRAM_ID,
      keys: [
        {
          isSigner: false,
          isWritable: true,
          pubkey: locker,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: govern,
        },
        {
          isSigner: true,
          isWritable: false,
          pubkey: smartWallet,
        },
      ],
    };
    const proposal = await createProposal(govern, [ix], governProgram);
    await createProposalMeta(
      proposal,
      "Update locker params",
      "Update locker params proposal test",
      governProgram
    );

    return proposal;
  }

  async function initializeLocker() {
    const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
    await voterProgram.methods
      .newLocker({
        maxStakeDuration,
        maxStakeVoteMultiplier,
        minStakeDuration,
        proposalActivationMinVotes,
      })
      .accounts({
        base: keypair.publicKey,
        locker,
        tokenMint: rewardMint,
        governor: govern,
        payer: voterProgram.provider.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  before(async () => {
    const result = await createAndFundWallet(provider.connection);
    keypair = result.keypair;
    wallet = result.wallet;

    const [lockerPda, lBump] = deriveLocker(keypair.publicKey, LOCKED_VOTER_PROGRAM_ID);
    locker = lockerPda;

    const [governPda, gBump] = deriveGovern(keypair.publicKey);
    govern = governPda;

    const [smartWalletPda, sBump] = deriveSmartWallet(keypair.publicKey);
    smartWallet = smartWalletPda;

    smartWalletOwners.push(governPda);
    smartWalletOwners.push(wallet.publicKey);

    await createSmartWallet(
      smartWalletOwners,
      smartWalletOwners.length,
      new BN(0),
      smartWalletThreshold,
      keypair,
      createSmartWalletProgram(wallet, SMART_WALLET_PROGRAM_ID)
    );

    await createGovernor(
      new BN(0),
      votingPeriod,
      quorumVotes,
      new BN(0),
      keypair,
      smartWallet,
      createGovernProgram(wallet, GOVERN_PROGRAM_ID),
      LOCKED_VOTER_PROGRAM_ID,
    );

    rewardMint = await createMint(
      provider.connection,
      keypair,
      keypair.publicKey,
      null,
      9
    );

    for (let i = 0; i < userCount; i++) {
      const result = await createAndFundWallet(provider.connection);
      userKeypairs.push(result.keypair);

      const userATA = await getOrCreateATA(
        rewardMint,
        result.keypair.publicKey,
        result.keypair,
        provider.connection
      );

      await mintTo(
        provider.connection,
        keypair,
        rewardMint,
        userATA,
        keypair.publicKey,
        lockAmount.toNumber()
      );
    }

    proposal = await createSetLockerParamsProposal();

    await initializeLocker();
  });

  it("users initialize new escrow", async () => {
    for (const keypair of userKeypairs) {
      const wallet = new Wallet(keypair);
      const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
      const [escrow, _bump] = deriveEscrow(locker, wallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

      await voterProgram.methods
        .newEscrow()
        .accounts({
          escrow,
          escrowOwner: wallet.publicKey,
          locker,
          payer: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      const escrowATA = await getOrCreateATA(
        rewardMint,
        escrow,
        keypair,
        voterProgram.provider.connection
      );
      const escrowState = await voterProgram.account.escrow.fetch(escrow);
      expect(escrowState.locker.toBase58()).to.be.equal(locker.toBase58());
      expect(escrowState.owner.toBase58()).to.be.equal(
        wallet.publicKey.toBase58()
      );
      expect(escrowState.tokens.toBase58()).to.be.equal(escrowATA.toBase58());
      expect(escrowState.amount.toString()).to.be.equal("0");
      expect(escrowState.escrowStartedAt.toString()).to.be.equal("0");
      expect(escrowState.escrowEndsAt.toString()).to.be.equal("0");
      expect(escrowState.voteDelegate.toBase58()).to.be.equal(
        wallet.publicKey.toBase58()
      );
    }
  });

  it("cannot extend lock duration more than max stake duration", async () => {
    const keypair = userKeypairs[0];
    const userWallet = new Wallet(keypair);
    const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);
    const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    invokeAndAssertError(
      () => {
        return voterProgram.methods
          .extendLockDuration(maxStakeDuration.add(new BN(1)))
          .accounts({
            escrow,
            escrowOwner: userWallet.publicKey,
            locker,
          })
          .rpc();
      },
      "Lockup duration must at most be the max stake duration",
      true
    );
  });

  it("cannot extend lock duration lesser than min stake duration", async () => {
    const keypair = userKeypairs[0];
    const userWallet = new Wallet(keypair);
    const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);
    const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    invokeAndAssertError(
      () => {
        return voterProgram.methods
          .extendLockDuration(minStakeDuration.sub(new BN(1)))
          .accounts({
            escrow,
            escrowOwner: userWallet.publicKey,
            locker,
          })
          .rpc();
      },
      "Lockup duration must at least be the min stake duration",
      true
    );
  });

  it("users extend lock duration", async () => {
    for (const keypair of userKeypairs) {
      const userWallet = new Wallet(keypair);
      const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);
      const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

      let escrowState = await voterProgram.account.escrow.fetch(escrow);

      expect(escrowState.escrowEndsAt.toString()).to.equal("0");

      await voterProgram.methods
        .extendLockDuration(maxStakeDuration)
        .accounts({
          escrow,
          escrowOwner: userWallet.publicKey,
          locker,
        })
        .rpc();

      escrowState = await voterProgram.account.escrow.fetch(escrow);

      expect(escrowState.escrowEndsAt.toString()).not.equal("0");
    }
  });

  it("users lock token", async () => {
    for (const keypair of userKeypairs) {
      const wallet = new Wallet(keypair);

      const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
      const [escrow, _bump] = deriveEscrow(locker, wallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

      const escrowATA = await getOrCreateATA(
        rewardMint,
        escrow,
        keypair,
        provider.connection
      );

      const rewardATA = await getOrCreateATA(
        rewardMint,
        wallet.publicKey,
        keypair,
        provider.connection
      );

      await voterProgram.methods
        .increaseLockedAmount(lockAmount)
        .accounts({
          escrow,
          escrowTokens: escrowATA,
          locker,
          payer: voterProgram.provider.publicKey,
          sourceTokens: rewardATA,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const escrowState = await voterProgram.account.escrow.fetch(escrow);
      const escrowATABalance = await provider.connection
        .getTokenAccountBalance(escrowATA)
        .then((b) => b.value.amount);

      expect(escrowState.amount.toString()).to.be.equal(lockAmount.toString());
      expect(escrowATABalance).to.be.equal(lockAmount.toString());
    }
  });

  it("cannot shorten lock duration", async () => {
    const keypair = userKeypairs[0];
    const userWallet = new Wallet(keypair);
    const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);
    const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    invokeAndAssertError(
      () => {
        return voterProgram.methods
          .extendLockDuration(minStakeDuration)
          .accounts({
            escrow,
            escrowOwner: userWallet.publicKey,
            locker,
          })
          .rpc();
      },
      "A voting escrow refresh cannot shorten the escrow time remaining",
      true
    );
  });

  it("cannot vote on inactive proposal", async () => {
    const keypair = userKeypairs[0];
    const userWallet = new Wallet(keypair);

    const governProgram = createGovernProgram(userWallet, GOVERN_PROGRAM_ID);
    const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);

    const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    const vote = await getOrCreateVote(proposal, governProgram);

    invokeAndAssertError(
      () => {
        return voterProgram.methods
          .castVote(VoteSide.For)
          .accounts({
            escrow,
            locker,
            governor: govern,
            governProgram: GOVERN_PROGRAM_ID,
            proposal,
            vote,
            voteDelegate: userWallet.publicKey,
          })
          .rpc();
      },
      "Invariant failed: proposal must be active",
      false
    );
  });


  it("only protocol team able to activate proposal", async () => {
    const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);

    const ixData = voterProgram.coder.instruction.encode(
      "activate_proposal",
      {}
    );

    const smartWalletProgram = createSmartWalletProgram(
      wallet,
      SMART_WALLET_PROGRAM_ID
    );

    const smartWalletState = await smartWalletProgram.account.smartWallet.fetch(
      smartWallet
    );

    const [transaction, txBump] = deriveTransaction(
      smartWallet,
      smartWalletState.numTransactions
    );

    const activateProposalIx = {
      programId: LOCKED_VOTER_PROGRAM_ID,
      data: ixData,
      keys: [
        {
          isSigner: false,
          isWritable: false,
          pubkey: locker,
        },
        {
          isSigner: false,
          isWritable: true,
          pubkey: govern,
        },
        {
          isSigner: false,
          isWritable: true,
          pubkey: proposal,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: GOVERN_PROGRAM_ID,
        },
        {
          isSigner: true,
          isWritable: false,
          pubkey: smartWallet,
        },
      ],
    };

    await smartWalletProgram.methods
      .createTransaction(txBump, [activateProposalIx])
      .accounts({
        payer: smartWalletProgram.provider.publicKey,
        proposer: smartWalletProgram.provider.publicKey,
        smartWallet,
        systemProgram: web3.SystemProgram.programId,
        transaction,
      })
      .rpc();

    // Smart wallet execute activate proposal transaction
    await smartWalletProgram.methods
      .executeTransaction()
      .accounts({
        owner: smartWalletProgram.provider.publicKey,
        smartWallet,
        transaction,
      })
      .remainingAccounts([
        {
          isSigner: false,
          isWritable: false,
          pubkey: LOCKED_VOTER_PROGRAM_ID,
        },
        ...activateProposalIx.keys.map((x) => {
          return {
            ...x,
            isSigner: false, // Need to override to false as these are signed by the smart wallet
          };
        }),
      ])
      .rpc();

    const governProgram = createGovernProgram(wallet, GOVERN_PROGRAM_ID);

    const proposalState = await governProgram.account.proposal.fetch(proposal);
    expect(proposalState.activatedAt.toString()).not.equal("0");
    expect(proposalState.votingEndsAt.toString()).not.equal("0");
  });

  it("user #1 delegate voting power to new user and vote against a proposal", async () => {
    const keypair = userKeypairs[0];
    const wallet = new Wallet(keypair);

    const { keypair: delegateKeypair } = await createAndFundWallet(
      provider.connection
    );
    const delegateWallet = new Wallet(delegateKeypair);

    let voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
    const [escrow, _eBump] = deriveEscrow(locker, wallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    // Delegate voting power
    await voterProgram.methods
      .setVoteDelegate(delegateWallet.publicKey)
      .accounts({
        escrow,
        escrowOwner: wallet.publicKey,
      })
      .rpc();

    const escrowState = await voterProgram.account.escrow.fetch(escrow);

    expect(escrowState.voteDelegate.toBase58()).to.be.equal(
      delegateWallet.publicKey.toBase58()
    );

    // Create vote
    const governProgram = createGovernProgram(wallet, GOVERN_PROGRAM_ID);

    const vote = await getOrCreateVote(proposal, governProgram);

    // Delegate wallet cast against a proposal using delegated vote
    voterProgram = createLockedVoterProgram(delegateWallet, LOCKED_VOTER_PROGRAM_ID);

    await voterProgram.methods
      .castVote(VoteSide.Against)
      .accounts({
        escrow, // Use delegated escrow,
        governor: govern,
        governProgram: GOVERN_PROGRAM_ID,
        locker,
        proposal,
        vote, // Use delegated vote
        voteDelegate: voterProgram.provider.publicKey,
      })
      .rpc();

    const voteState = await governProgram.account.vote.fetch(vote);
    const proposalState = await governProgram.account.proposal.fetch(proposal);

    expect(voteState.side.toString()).to.be.equal(VoteSide.Against.toString());
    expect(proposalState.optionVotes[1].toString()).to.be.equal(
      voteState.votingPower.toString()
    );
  });

  it("cannot vote anymore if delegated to other user", async () => {
    const keypair = userKeypairs[0];
    const wallet = new Wallet(keypair);

    const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
    const [escrow, _eBump] = deriveEscrow(locker, wallet.publicKey, LOCKED_VOTER_PROGRAM_ID);
    const [vote, _vBump] = deriveVote(wallet.publicKey, proposal);

    invokeAndAssertError(
      () => {
        return voterProgram.methods
          .castVote(VoteSide.Against)
          .accounts({
            escrow,
            governor: govern,
            governProgram: GOVERN_PROGRAM_ID,
            locker,
            proposal,
            vote,
            voteDelegate: voterProgram.provider.publicKey,
          })
          .rpc();
      },
      "self.escrow.vote_delegate != self.vote_delegate",
      false
    );
  });

  it("user #2 cast for proposal", async () => {
    const keypair = userKeypairs[1];
    const wallet = new Wallet(keypair);

    const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
    const governProgram = createGovernProgram(wallet, GOVERN_PROGRAM_ID);

    const [escrow, _eBump] = deriveEscrow(locker, wallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    const beforeProposalState = await governProgram.account.proposal.fetch(
      proposal
    );

    const vote = await getOrCreateVote(proposal, governProgram);

    await voterProgram.methods
      .castVote(VoteSide.For)
      .accounts({
        escrow,
        governor: govern,
        governProgram: GOVERN_PROGRAM_ID,
        locker,
        proposal,
        vote,
        voteDelegate: voterProgram.provider.publicKey,
      })
      .rpc();

    const voteState = await governProgram.account.vote.fetch(vote);
    const afterProposalState = await governProgram.account.proposal.fetch(
      proposal
    );

    const proposalForVoteDelta = afterProposalState.optionVotes[2]
      .sub(beforeProposalState.optionVotes[2])
      .toString();

    expect(voteState.side.toString()).to.be.equal(VoteSide.For.toString());
    expect(proposalForVoteDelta).to.be.equal(voteState.votingPower.toString());
  });

  it("user #3 cast abstain proposal", async () => {
    const keypair = userKeypairs[2];
    const wallet = new Wallet(keypair);

    const voterProgram = createLockedVoterProgram(wallet, LOCKED_VOTER_PROGRAM_ID);
    const governProgram = createGovernProgram(wallet, GOVERN_PROGRAM_ID);

    const [escrow, _eBump] = deriveEscrow(locker, wallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    const beforeProposalState = await governProgram.account.proposal.fetch(
      proposal
    );

    const vote = await getOrCreateVote(proposal, governProgram);

    await voterProgram.methods
      .castVote(VoteSide.Abstain)
      .accounts({
        escrow,
        governor: govern,
        governProgram: GOVERN_PROGRAM_ID,
        locker,
        proposal,
        vote,
        voteDelegate: voterProgram.provider.publicKey,
      })
      .rpc();

    const voteState = await governProgram.account.vote.fetch(vote);
    const afterProposalState = await governProgram.account.proposal.fetch(
      proposal
    );

    const proposalAbstainVoteDelta = afterProposalState.optionVotes[0]
      .sub(beforeProposalState.optionVotes[0])
      .toString();

    expect(voteState.side.toString()).to.be.equal(VoteSide.Abstain.toString());
    expect(proposalAbstainVoteDelta).to.be.equal(voteState.votingPower.toString());
  });

  it("users able to exit when escrow ended", async () => {
    for (const keypair of userKeypairs) {
      const userWallet = new Wallet(keypair);
      const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);

      const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

      while (true) {
        const [escrowState, onchainTimestamp] = await Promise.all([
          voterProgram.account.escrow.fetch(escrow),
          getOnChainTime(provider.connection),
        ]);

        if (escrowState.escrowEndsAt.toNumber() > onchainTimestamp) {
          console.log(
            `${escrowState.escrowEndsAt.toNumber() - onchainTimestamp
            } seconds until escrow expire`
          );
          await sleep(1000);
        } else {
          break;
        }
      }

      await sleep(1000);

      const userATA = await getOrCreateATA(
        rewardMint,
        userWallet.publicKey,
        keypair,
        provider.connection
      );

      const escrowATA = await getOrCreateATA(
        rewardMint,
        escrow,
        keypair,
        provider.connection
      );

      await voterProgram.methods
        .withdraw()
        .accounts({
          destinationTokens: userATA,
          escrow,
          escrowOwner: voterProgram.provider.publicKey,
          escrowTokens: escrowATA,
          locker,
          payer: voterProgram.provider.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // Escrow account closed
    }
  });

  it("can toggle max lock", async () => {
    const keypair = userKeypairs[0];
    const userWallet = new Wallet(keypair);
    const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);
    const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

    await voterProgram.methods
      .newEscrow()
      .accounts({
        escrow,
        escrowOwner: userWallet.publicKey,
        locker,
        payer: userWallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    await voterProgram.methods
      .toggleMaxLock(true)
      .accounts({
        escrow,
        locker,
        escrowOwner: userWallet.publicKey,
      })
      .rpc();

    let escrowState = await voterProgram.account.escrow.fetch(escrow);
    expect(escrowState.isMaxLock).to.be.equal(true);


    const userATA = await getOrCreateATA(
      rewardMint,
      userWallet.publicKey,
      keypair,
      provider.connection
    );

    const escrowATA = await getOrCreateATA(
      rewardMint,
      escrow,
      keypair,
      provider.connection
    );

    // cannot withdraw
    invokeAndAssertError(
      () => {
        return voterProgram.methods
          .withdraw()
          .accounts({
            destinationTokens: userATA,
            escrow,
            escrowOwner: voterProgram.provider.publicKey,
            escrowTokens: escrowATA,
            locker,
            payer: voterProgram.provider.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
      },
      "Invariant failed: must need to set max lock to false",
      false
    );

    await voterProgram.methods
      .toggleMaxLock(false)
      .accounts({
        escrow,
        locker,
        escrowOwner: userWallet.publicKey,
      })
      .rpc();

    escrowState = await voterProgram.account.escrow.fetch(escrow);
    expect(escrowState.isMaxLock).to.be.equal(false);

    const lockerState = await voterProgram.account.locker.fetch(locker);
    expect(escrowState.escrowEndsAt.toNumber() - escrowState.escrowStartedAt.toNumber()).to.be.equal(lockerState.params.maxStakeDuration.toNumber());

    while (true) {
      const [escrowState, onchainTimestamp] = await Promise.all([
        voterProgram.account.escrow.fetch(escrow),
        getOnChainTime(provider.connection),
      ]);

      if (escrowState.escrowEndsAt.toNumber() > onchainTimestamp) {
        console.log(
          `${escrowState.escrowEndsAt.toNumber() - onchainTimestamp
          } seconds until escrow expire`
        );
        await sleep(1000);
      } else {
        break;
      }
    }
    await sleep(1000);
    // can withdraw
    await voterProgram.methods
      .withdraw()
      .accounts({
        destinationTokens: userATA,
        escrow,
        escrowOwner: voterProgram.provider.publicKey,
        escrowTokens: escrowATA,
        locker,
        payer: voterProgram.provider.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

  });

});

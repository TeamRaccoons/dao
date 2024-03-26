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

const lockAmount = new BN(1000);
const partialUnstakingAmount = new BN(100);

describe("Partial unstaking", () => {
    let locker: web3.PublicKey;
    let govern: web3.PublicKey;
    let smartWallet: web3.PublicKey;
    let proposal: web3.PublicKey;

    let wallet: Wallet;
    let keypair: web3.Keypair;

    let rewardMint: web3.PublicKey;
    let userKeypair: web3.Keypair;

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

        {
            const result = await createAndFundWallet(provider.connection);
            userKeypair = result.keypair;

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


    before(async () => {
        const wallet = new Wallet(userKeypair);
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

        await voterProgram.methods
            .extendLockDuration(maxStakeDuration)
            .accounts({
                escrow,
                escrowOwner: wallet.publicKey,
                locker,
            })
            .rpc();
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
    });


    it("users open partial unstaking and merge it", async () => {
        const userWallet = new Wallet(userKeypair);
        const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);
        const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);

        {
            let escrowState = await voterProgram.account.escrow.fetch(escrow);
            expect(escrowState.amount.toString()).to.equal(lockAmount.toString());
            expect(escrowState.partialUnstakingAmount.toString()).to.equal("0");
        }


        const partialUnstakeKP = web3.Keypair.generate();
        // open partial unstaking
        await voterProgram.methods.openPartialUnstaking(partialUnstakingAmount).accounts({
            escrow,
            locker,
            partialUnstake: partialUnstakeKP.publicKey,
            owner: userKeypair.publicKey,
            systemProgram: web3.SystemProgram.programId,
        }).signers([
            partialUnstakeKP, userKeypair
        ]).rpc();
        {
            let escrowState = await voterProgram.account.escrow.fetch(escrow);
            expect(escrowState.amount.toString()).to.equal(lockAmount.sub(partialUnstakingAmount).toString());
            expect(escrowState.partialUnstakingAmount.toString()).to.equal(partialUnstakingAmount.toString());

            let partialUnstakingState = await voterProgram.account.partialUnstaking.fetch(partialUnstakeKP.publicKey);
            expect(partialUnstakingState.amount.toString()).to.equal(partialUnstakingAmount.toString());
            expect(partialUnstakingState.escrow.toString()).to.equal(escrow.toString());
            expect(partialUnstakingState.expiration.toString()).to.not.equal("0");
        }

        // merge 
        await voterProgram.methods.mergePartialUnstaking().accounts({
            escrow,
            locker,
            partialUnstake: partialUnstakeKP.publicKey,
            owner: userKeypair.publicKey,
        }).signers([
            userKeypair
        ]).rpc();

        {
            let escrowState = await voterProgram.account.escrow.fetch(escrow);
            expect(escrowState.amount.toString()).to.equal(lockAmount.toString());
            expect(escrowState.partialUnstakingAmount.toString()).to.equal("0");
        }

    });


    it("users open partial unstaking and withdraw it", async () => {
        const userWallet = new Wallet(userKeypair);
        const voterProgram = createLockedVoterProgram(userWallet, LOCKED_VOTER_PROGRAM_ID);
        const [escrow, _bump] = deriveEscrow(locker, userWallet.publicKey, LOCKED_VOTER_PROGRAM_ID);


        const partialUnstakeKP = web3.Keypair.generate();
        // open partial unstaking
        await voterProgram.methods.openPartialUnstaking(partialUnstakingAmount).accounts({
            escrow,
            locker,
            partialUnstake: partialUnstakeKP.publicKey,
            owner: userKeypair.publicKey,
            systemProgram: web3.SystemProgram.programId,
        }).signers([
            partialUnstakeKP, userKeypair
        ]).rpc();


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

        const userATABalanceBefore = await provider.connection
            .getTokenAccountBalance(userATA)
            .then((b) => b.value.amount);

        // withdraw partial unstaking
        await voterProgram.methods.withdrawPartialUnstaking().accounts({
            escrow,
            locker,
            partialUnstake: partialUnstakeKP.publicKey,
            owner: userKeypair.publicKey,
            payer: userKeypair.publicKey,
            escrowTokens: escrowATA,
            destinationTokens: userATA,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).signers([
            userKeypair
        ]).rpc();

        {
            let escrowState = await voterProgram.account.escrow.fetch(escrow);
            expect(escrowState.partialUnstakingAmount.toString()).to.equal("0");

            const userATABalance = await provider.connection
                .getTokenAccountBalance(userATA)
                .then((b) => b.value.amount);
            expect(+userATABalance).to.equal(+userATABalanceBefore + partialUnstakingAmount.toNumber());
        }

        // withdraw escrow
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

        {
            const userATABalance = await provider.connection
                .getTokenAccountBalance(userATA)
                .then((b) => b.value.amount);
            expect(+userATABalance).to.equal(+userATABalanceBefore + lockAmount.toNumber());
        }

    });

});

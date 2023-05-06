mod args;

use crate::args::*;
use anyhow::Result;

use anchor_client::solana_sdk::commitment_config::CommitmentConfig;
use anchor_client::solana_sdk::pubkey::Pubkey;
use anchor_client::solana_sdk::signer::keypair::*;
use anchor_client::solana_sdk::signer::Signer;
use anchor_client::{Client, Program};
use std::rc::Rc;
use std::str::FromStr;

use clap::*;

fn main() -> Result<()> {
    let opts = Opts::parse();
    let payer =
        read_keypair_file(opts.config_override.wallet_path).expect("Wallet keypair file not found");
    let wallet = payer.pubkey();

    println!("Wallet {:#?}", wallet);
    println!("Program ID: {:#?}", opts.config_override.program_id);

    let program_id = Pubkey::from_str(opts.config_override.program_id.as_str())?;
    let client = Client::new_with_options(
        opts.config_override.cluster,
        Rc::new(Keypair::from_bytes(&payer.to_bytes())?),
        CommitmentConfig::finalized(),
    );

    let program = client.program(program_id);
    match opts.command {
        CliCommand::CreateGovernor {
            electorate,
            voting_delay,
            voting_period,
            quorum_votes,
            timelock_delay_seconds,
        } => {
            create_governor(
                &program,
                electorate,
                voting_delay,
                voting_period,
                quorum_votes,
                timelock_delay_seconds,
            )?;
        }
        CliCommand::CreateDummyProposal { governor } => {
            create_dummy_proposal(&program, governor)?;
        }
        CliCommand::CancelProposal { proposal } => {
            cancel_proposal(&program, proposal)?;
        }
        CliCommand::QueueProposal { proposal } => {
            queue_proposal(&program, proposal)?;
        }
        CliCommand::NewVote { proposal } => {
            new_vote(&program, proposal)?;
        }
        CliCommand::CreateProposalMeta {
            proposal,
            title,
            description_link,
        } => {
            create_proposal_meta(&program, proposal, title, description_link)?;
        }
        CliCommand::ViewGovernor { governor } => {
            view_governor(&program, governor)?;
        }
        CliCommand::ViewProposal { proposal } => {
            view_proposal(&program, proposal)?;
        }
        CliCommand::ViewProposalMeta { proposal } => {
            view_proposal_meta(&program, proposal)?;
        }
        CliCommand::ViewVote { proposal, voter } => {
            let (vote, _bump) = Pubkey::find_program_address(
                &[b"MeteoraVote".as_ref(), proposal.as_ref(), voter.as_ref()],
                &govern::id(),
            );
            let vote_state: govern::Vote = program.account(vote)?;
            println!("{:?}", vote_state);
        }
    }

    Ok(())
}

fn create_governor(
    program: &Program,
    electorate: Pubkey,
    voting_delay: u64,
    voting_period: u64,
    quorum_votes: u64,
    timelock_delay_seconds: i64,
) -> Result<()> {
    let base_keypair = Keypair::new();
    let base = base_keypair.pubkey();

    let (governor, bump) =
        Pubkey::find_program_address(&[b"MeteoraGovernor".as_ref(), base.as_ref()], &govern::id());
    println!("governor address {}", governor);

    let builder = program
        .request()
        .accounts(govern::accounts::CreateGovernor {
            base,
            governor,
            smart_wallet: electorate,
            payer: program.payer(),
            system_program: solana_program::system_program::ID,
        })
        .args(govern::instruction::CreateGovernor {
            electorate,
            params: govern::GovernanceParameters {
                voting_delay,
                voting_period,
                quorum_votes,
                timelock_delay_seconds,
            },
        })
        .signer(&base_keypair);
    let signature = builder.send()?;
    println!("Signature {:?}", signature);
    Ok(())
}

fn create_dummy_proposal(program: &Program, governor: Pubkey) -> Result<()> {
    let governor_state: govern::Governor = program.account(governor)?;

    let (proposal, bump) = Pubkey::find_program_address(
        &[
            b"MeteoraProposal".as_ref(),
            governor.as_ref(),
            governor_state.proposal_count.to_le_bytes().as_ref(),
        ],
        &govern::id(),
    );
    println!("proposal address {}", proposal);

    let builder = program
        .request()
        .accounts(govern::accounts::CreateProposal {
            governor,
            proposal,
            proposer: program.payer(),
            payer: program.payer(),
            system_program: solana_program::system_program::ID,
        })
        .args(govern::instruction::CreateProposal {
            bump: 0,
            instructions: vec![],
        });
    let signature = builder.send()?;
    println!("Signature {:?}", signature);
    Ok(())
}

fn cancel_proposal(program: &Program, proposal: Pubkey) -> Result<()> {
    let proposal_state: govern::Proposal = program.account(proposal)?;

    let builder = program
        .request()
        .accounts(govern::accounts::CancelProposal {
            governor: proposal_state.governor,
            proposal,
            proposer: program.payer(),
        })
        .args(govern::instruction::CancelProposal {});
    let signature = builder.send()?;
    println!("Signature {:?}", signature);
    Ok(())
}

fn queue_proposal(program: &Program, proposal: Pubkey) -> Result<()> {
    let proposal_state: govern::Proposal = program.account(proposal)?;
    let governor_state: govern::Governor = program.account(proposal_state.governor)?;
    let smart_wallet_state: smart_wallet::SmartWallet =
        program.account(governor_state.smart_wallet)?;
    let (transaction, _bump) = Pubkey::find_program_address(
        &[
            b"Transaction".as_ref(),
            governor_state.smart_wallet.as_ref(),
            smart_wallet_state.num_transactions.to_le_bytes().as_ref(),
        ],
        &smart_wallet::id(),
    );
    let builder = program
        .request()
        .accounts(govern::accounts::QueueProposal {
            governor: proposal_state.governor,
            proposal,
            transaction,
            smart_wallet: governor_state.smart_wallet,
            smart_wallet_program: smart_wallet::id(),
            payer: program.payer(),
            system_program: solana_program::system_program::ID,
        })
        .args(govern::instruction::QueueProposal {});
    let signature = builder.send()?;
    println!("Signature {:?}", signature);
    Ok(())
}

fn new_vote(program: &Program, proposal: Pubkey) -> Result<()> {
    let (vote, _bump) = Pubkey::find_program_address(
        &[
            b"MeteoraVote".as_ref(),
            proposal.as_ref(),
            program.payer().as_ref(),
        ],
        &govern::id(),
    );
    let builder = program
        .request()
        .accounts(govern::accounts::NewVote {
            proposal,
            vote,
            payer: program.payer(),
            system_program: solana_program::system_program::ID,
        })
        .args(govern::instruction::NewVote {
            voter: program.payer(),
        });
    let signature = builder.send()?;
    println!("Signature {:?}", signature);
    Ok(())
}

fn create_proposal_meta(
    program: &Program,
    proposal: Pubkey,
    title: String,
    description_link: String,
) -> Result<()> {
    let (proposal_meta, _bump) = Pubkey::find_program_address(
        &[b"MeteoraProposalMeta".as_ref(), proposal.as_ref()],
        &govern::id(),
    );
    let builder = program
        .request()
        .accounts(govern::accounts::CreateProposalMeta {
            proposal,
            proposal_meta,
            proposer: program.payer(),
            payer: program.payer(),
            system_program: solana_program::system_program::ID,
        })
        .args(govern::instruction::CreateProposalMeta {
            bump: 0,
            title,
            description_link,
        });
    let signature = builder.send()?;
    println!("Signature {:?}", signature);
    Ok(())
}

fn view_governor(program: &Program, governor: Pubkey) -> Result<()> {
    let state: govern::Governor = program.account(governor)?;
    println!("{:?}", state);
    Ok(())
}
fn view_proposal(program: &Program, proposal: Pubkey) -> Result<()> {
    let state: govern::Proposal = program.account(proposal)?;
    println!("{:?}", state);
    Ok(())
}
fn view_proposal_meta(program: &Program, proposal: Pubkey) -> Result<()> {
    let (proposal_meta, _bump) = Pubkey::find_program_address(
        &[b"MeteoraProposalMeta".as_ref(), proposal.as_ref()],
        &govern::id(),
    );
    let state: govern::ProposalMeta = program.account(proposal_meta)?;
    println!("{:?}", state);
    Ok(())
}
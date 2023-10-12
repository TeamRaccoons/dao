//! Commits the votes for a [Gauge].

use crate::*;

/// Accounts for [gauge::gauge_epoch_commit_vote].
#[derive(Accounts)]
pub struct GaugeEpochCommitVote<'info> {
    /// The [GaugeFactory].
    pub gauge_factory: Account<'info, GaugeFactory>,
    /// The [Gauge].
    pub gauge: Account<'info, Gauge>,
    /// The [GaugeVoter].
    pub gauge_voter: Account<'info, GaugeVoter>,
    /// The [GaugeVote] containing the vote weights.
    pub gauge_vote: Box<Account<'info, GaugeVote>>,

    /// The [EpochGauge].
    #[account(mut)]
    pub epoch_gauge: Account<'info, EpochGauge>,
    /// The [EpochGaugeVoter].
    #[account(mut)]
    pub epoch_gauge_voter: Account<'info, EpochGaugeVoter>,

    /// The [EpochGaugeVote] to create.
    // #[account(
    //     init,
    //     seeds = [
    //         b"EpochGaugeVote".as_ref(),
    //         gauge_vote.key().as_ref(),
    //         epoch_gauge_voter.voting_epoch.to_le_bytes().as_ref(),
    //     ],
    //     bump,
    //     space = 8 + std::mem::size_of::<EpochGaugeVote>(),
    //     payer = payer
    // )]
    // pub epoch_gauge_vote: Account<'info, EpochGaugeVote>,

    /// Funder of the [EpochGaugeVote] to create.
    #[account(mut)]
    pub payer: Signer<'info>,
    /// The [System] program.
    pub system_program: Program<'info, System>,
}

fn mul_div_u64(x: u64, y: u64, z: u64) -> Option<u64> {
    let x: u128 = x.into();
    let y: u128 = y.into();
    let z: u128 = z.into();
    u64::try_from(x.checked_mul(y)?.checked_div(z)?).ok()
}
impl<'info> GaugeEpochCommitVote<'info> {
    fn vote_shares_for_next_epoch(&self) -> Option<u64> {
        if self.gauge_vote.weight == 0 {
            return Some(0);
        }
        let power: u64 = self.epoch_gauge_voter.voting_power;
        let total_shares = mul_div_u64(
            power,
            self.gauge_vote.weight.into(),
            self.gauge_voter.total_weight.into(),
        )?;
        msg!("power: {}, shares: {}", power, total_shares);
        Some(total_shares)
    }
}

pub fn handler(ctx: Context<GaugeEpochCommitVote>) -> Result<()> {
    let next_vote_shares = unwrap_int!(ctx.accounts.vote_shares_for_next_epoch());
    // if zero vote shares, don't do anything
    if next_vote_shares == 0 {
        return Ok(());
    }
    let gauge_factory = &ctx.accounts.gauge_factory;
    let epoch_gauge = &mut ctx.accounts.epoch_gauge;
    let epoch_gauge_voter = &mut ctx.accounts.epoch_gauge_voter;
    let gauge_vote = &mut ctx.accounts.gauge_vote;

    let current_vote_index =
        gauge_vote.pump_and_get_index_for_lastest_voting_epoch(gauge_factory.current_voting_epoch);

    let epoch_gauge_vote = &mut gauge_vote.vote_epochs[current_vote_index];

    // let epoch_gauge_vote = &mut ctx.accounts.epoch_gauge_vote;

    epoch_gauge_voter.allocated_power = unwrap_int!(epoch_gauge_voter
        .allocated_power
        .checked_add(next_vote_shares));
    epoch_gauge_vote.allocated_power = next_vote_shares;

    epoch_gauge.total_power = unwrap_int!(epoch_gauge.total_power.checked_add(next_vote_shares));

    emit!(GaugeEpochCommitVoteEvent {
        gauge_factory: ctx.accounts.gauge.gauge_factory,
        gauge: ctx.accounts.gauge.key(),
        gauge_voter_owner: ctx.accounts.gauge_voter.owner,
        vote_shares_for_next_epoch: next_vote_shares,
        voting_epoch: epoch_gauge_voter.voting_epoch,
        updated_allocated_power: epoch_gauge_voter.allocated_power,
        updated_total_power: epoch_gauge.total_power,
    });

    Ok(())
}

impl<'info> Validate<'info> for GaugeEpochCommitVote<'info> {
    fn validate(&self) -> Result<()> {
        assert_keys_eq!(self.gauge_factory, self.gauge.gauge_factory);
        assert_keys_eq!(self.gauge, self.gauge_vote.gauge);
        assert_keys_eq!(self.gauge_voter, self.gauge_vote.gauge_voter);

        assert_keys_eq!(self.epoch_gauge.gauge, self.gauge);
        assert_keys_eq!(self.epoch_gauge_voter.gauge_voter, self.gauge_voter);

        invariant!(!self.gauge.is_disabled, CannotCommitGaugeDisabled);
        invariant!(
            self.epoch_gauge_voter.weight_change_seqno == self.gauge_voter.weight_change_seqno,
            WeightSeqnoChanged
        );

        let voting_epoch = self.gauge_factory.current_voting_epoch;
        invariant!(
            self.epoch_gauge_voter.voting_epoch == voting_epoch,
            EpochGaugeNotVoting
        );

        Ok(())
    }
}

/// Event called in [gauge::gauge_epoch_commit_vote].
#[event]
pub struct GaugeEpochCommitVoteEvent {
    #[index]
    /// The [GaugeFactory].
    pub gauge_factory: Pubkey,
    #[index]
    /// The [Gauge].
    pub gauge: Pubkey,
    #[index]
    /// Owner of the Escrow of the [GaugeVoter].
    pub gauge_voter_owner: Pubkey,
    /// The epoch that the [GaugeVoter] is voting for.
    pub voting_epoch: u32,
    /// Vote shares for next epoch
    pub vote_shares_for_next_epoch: u64,
    /// The total amount of gauge voting power that has been allocated for the epoch voter.
    pub updated_allocated_power: u64,
    /// The total number of power to be applied to the latest voted epoch gauge.
    pub updated_total_power: u64,
}

//! Votes for a [Gauge].

use crate::*;

/// Accounts for [gauge::gauge_set_vote].
#[derive(Accounts)]
pub struct GaugeSetVote<'info> {
    /// The [GaugeFactory].
    pub gauge_factory: Account<'info, GaugeFactory>,
    /// The [Gauge].
    pub gauge: Account<'info, Gauge>,

    /// The [GaugeVoter].
    #[account(mut)]
    pub gauge_voter: Account<'info, GaugeVoter>,
    /// The [GaugeVote].
    #[account(mut, has_one = gauge_voter, has_one = gauge)]
    pub gauge_vote: AccountLoader<'info, GaugeVote>,

    /// The escrow.
    #[account(has_one = vote_delegate @ crate::ErrorCode::UnauthorizedNotDelegate)]
    pub escrow: Account<'info, voter::Escrow>,

    /// The vote delegate.
    pub vote_delegate: Signer<'info>,
}

impl<'info> GaugeSetVote<'info> {
    fn next_total_weight(&self, current_weight: u32, new_weight: u32) -> Option<u32> {
        let total_weight = self
            .gauge_voter
            .total_weight
            .checked_sub(current_weight)?
            .checked_add(new_weight)?;
        Some(total_weight)
    }

    /// Sets a non-zero vote.
    fn set_vote(&mut self, weight: u32) -> Result<()> {
        if weight != 0 {
            invariant!(!self.gauge.is_disabled, CannotVoteGaugeDisabled);
        }

        let mut gauge_vote = self.gauge_vote.load_mut()?;

        // assert_keys_eq!(self.gauge, gauge_vote.gauge);
        // assert_keys_eq!(self.gauge_voter, gauge_vote.gauge_voter);

        if gauge_vote.weight == weight {
            // Don't do anything if the weight is not changed.
            return Ok(());
        }

        let next_total_weight = unwrap_int!(self.next_total_weight(gauge_vote.weight, weight));

        let gauge_voter = &mut self.gauge_voter;
        // let gauge_vote = &mut self.gauge_vote;

        // update voter
        let prev_total_weight = gauge_voter.total_weight;
        gauge_voter.total_weight = next_total_weight;

        // record that the weights have changed.
        gauge_voter.weight_change_seqno =
            unwrap_int!(gauge_voter.weight_change_seqno.checked_add(1));

        // update vote
        gauge_vote.weight = weight;

        emit!(SetGaugeVoteEvent {
            gauge_factory: self.gauge_factory.key(),
            gauge: self.gauge.key(),
            gauge_voter_owner: gauge_voter.owner,
            vote_delegate: self.vote_delegate.key(),
            prev_total_weight,
            total_weight: gauge_voter.total_weight,
            weight_change_seqno: gauge_voter.weight_change_seqno,
        });

        Ok(())
    }
}

pub fn handler(ctx: Context<GaugeSetVote>, weight: u32) -> Result<()> {
    ctx.accounts.set_vote(weight)
}

impl<'info> Validate<'info> for GaugeSetVote<'info> {
    fn validate(&self) -> Result<()> {
        assert_keys_eq!(self.gauge_factory, self.gauge.gauge_factory);
        // assert_keys_eq!(self.gauge, self.gauge_vote.gauge);
        // assert_keys_eq!(self.gauge_voter, self.gauge_vote.gauge_voter);

        assert_keys_eq!(self.escrow, self.gauge_voter.escrow);
        assert_keys_eq!(self.vote_delegate, self.escrow.vote_delegate);
        Ok(())
    }
}

/// Event called in [gauge::gauge_set_vote].
#[event]
pub struct SetGaugeVoteEvent {
    #[index]
    /// The [GaugeFactory].
    pub gauge_factory: Pubkey,
    #[index]
    /// The [Gauge].
    pub gauge: Pubkey,
    #[index]
    /// Owner of the Escrow of the [GaugeVoter].
    pub gauge_voter_owner: Pubkey,
    #[index]
    pub vote_delegate: Pubkey,
    pub prev_total_weight: u32,
    pub total_weight: u32,
    pub weight_change_seqno: u64,
}

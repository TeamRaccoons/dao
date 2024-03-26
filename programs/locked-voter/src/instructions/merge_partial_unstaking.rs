use crate::*;

/// Accounts for [voter::merge_partial_unstaking].
#[derive(Accounts)]
pub struct MergePartialUnstaking<'info> {
    /// [Locker].
    #[account(mut)]
    pub locker: Box<Account<'info, Locker>>,

    /// [Escrow].
    #[account(mut, has_one = locker, has_one = owner)]
    pub escrow: Box<Account<'info, Escrow>>,

    /// The [PartialUnstaking] that is being merged.
    #[account(mut, has_one = escrow, close = owner)]
    pub partial_unstake: Box<Account<'info, PartialUnstaking>>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

impl<'info> MergePartialUnstaking<'info> {
    pub fn merge_partial_unstaking(&mut self) -> Result<()> {
        let partial_unstake_pk = self.partial_unstake.key();
        let escrow_pk = self.escrow.key();

        let partial_unstake = &self.partial_unstake;
        let escrow = &mut self.escrow;

        unwrap_int!(escrow.merge_partial_unstaking_amount(partial_unstake.amount));

        emit!(MergePartialUnstakingEvent {
            partial_unstake: partial_unstake_pk,
            escrow: escrow_pk,
            amount: partial_unstake.amount,
        });

        Ok(())
    }
}

impl<'info> Validate<'info> for MergePartialUnstaking<'info> {
    fn validate(&self) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;
        let lock_duration = unwrap_int!(self
            .escrow
            .get_remaining_duration_until_expiration(current_time, &self.locker));
        require!(
            lock_duration >= self.locker.params.min_stake_duration,
            crate::ErrorCode::LockupDurationTooShort
        );
        Ok(())
    }
}

#[event]
/// Event called in [voter::merge_partial_unstaking].
pub struct MergePartialUnstakingEvent {
    /// partial_unstake pk
    pub partial_unstake: Pubkey,
    /// ecsrow pk
    pub escrow: Pubkey,
    /// amount for partial unstaking
    pub amount: u64,
}

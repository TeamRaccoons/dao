use crate::*;

/// Accounts for [voter::open_partial_unstaking].
#[derive(Accounts)]
pub struct OpenPartialUnstaking<'info> {
    /// [Locker].
    #[account(mut)]
    pub locker: Box<Account<'info, Locker>>,

    /// [Escrow].
    #[account(mut, has_one = locker, has_one = owner)]
    pub escrow: Box<Account<'info, Escrow>>,

    /// [Escrow].
    #[account(
        init,
        payer = owner,
        space = 8 + PartialUnstaking::LEN
    )]
    pub partial_unstake: Account<'info, PartialUnstaking>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// System program.
    pub system_program: Program<'info, System>,
}

impl<'info> OpenPartialUnstaking<'info> {
    /// Creates a new [Locker].
    pub fn open_partial_unstaking(&mut self, amount: u64) -> Result<()> {
        let partial_unstake_pk = self.partial_unstake.key();
        let escrow_pk = self.escrow.key();

        require!(amount > 0, crate::ErrorCode::AmountIsZero);
        require!(
            amount <= self.escrow.amount, // todo check should be <= or <
            crate::ErrorCode::InvalidAmountForPartialUnstaking
        );

        let partial_unstake = &mut self.partial_unstake;
        let escrow = &mut self.escrow;

        partial_unstake.escrow = escrow_pk;
        partial_unstake.amount = amount;

        let current_time = Clock::get()?.unix_timestamp;
        let remaining_duration =
            unwrap_int!(escrow.get_remaining_duration_until_expiration(current_time, &self.locker));
        require!(remaining_duration > 0, crate::ErrorCode::EscrowHasBeenEnded); // no point for partial unstaking if escrow has been ended
        partial_unstake.expiration =
            unwrap_int!(current_time.checked_add(remaining_duration as i64));

        unwrap_int!(escrow.accumulate_partial_unstaking_amount(amount));

        emit!(OpenPartialStakingEvent {
            partial_unstake: partial_unstake_pk,
            escrow: escrow_pk,
            amount,
            expiration: partial_unstake.expiration,
        });

        Ok(())
    }
}

impl<'info> Validate<'info> for OpenPartialUnstaking<'info> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }
}

#[event]
/// Event called in [voter::open_partial_unstaking].
pub struct OpenPartialStakingEvent {
    /// partial_unstake pk
    pub partial_unstake: Pubkey,
    /// ecsrow pk
    pub escrow: Pubkey,
    /// amount for partial unstaking
    pub amount: u64,
    /// time to withdraw partial unstaking amount
    pub expiration: i64,
}

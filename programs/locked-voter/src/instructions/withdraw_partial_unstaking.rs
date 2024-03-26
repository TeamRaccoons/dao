use crate::*;
use anchor_spl::token;

/// Accounts for [voter::withdraw_partial_unstaking].
#[derive(Accounts)]
pub struct WithdrawPartialUnstaking<'info> {
    /// The [Locker] being exited from.
    #[account(mut)]
    pub locker: Box<Account<'info, Locker>>,

    /// The [Escrow] that is being closed.
    #[account(mut, has_one = locker, has_one= owner)]
    pub escrow: Box<Account<'info, Escrow>>,

    /// The [PartialUnstaking] that is being withdraw.
    #[account(mut, has_one = escrow, close = payer)]
    pub partial_unstake: Box<Account<'info, PartialUnstaking>>,

    /// Authority of the [Escrow].
    pub owner: Signer<'info>,

    /// Tokens locked up in the [Escrow].
    #[account(mut, constraint = escrow.tokens == escrow_tokens.key())]
    pub escrow_tokens: Account<'info, TokenAccount>,
    /// Destination for the tokens to unlock.
    #[account(mut)]
    pub destination_tokens: Account<'info, TokenAccount>,

    /// The payer to receive the rent refund.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Token program.
    pub token_program: Program<'info, Token>,
}

impl<'info> WithdrawPartialUnstaking<'info> {
    pub fn withdraw_partial_unstaking(&mut self) -> Result<()> {
        let seeds: &[&[&[u8]]] = escrow_seeds!(self.escrow);

        // transfer tokens from the escrow
        // if there are zero tokens in the escrow, short-circuit.
        if self.partial_unstake.amount > 0 {
            token::transfer(
                CpiContext::new(
                    self.token_program.to_account_info(),
                    token::Transfer {
                        from: self.escrow_tokens.to_account_info(),
                        to: self.destination_tokens.to_account_info(),
                        authority: self.escrow.to_account_info(),
                    },
                )
                .with_signer(seeds),
                self.partial_unstake.amount,
            )?;
        }

        // update the locker
        let locker = &mut self.locker;
        locker.locked_supply = unwrap_int!(locker
            .locked_supply
            .checked_sub(self.partial_unstake.amount));

        unwrap_int!(self
            .escrow
            .withdraw_partial_unstaking_amount(self.partial_unstake.amount));

        emit!(WithdrawPartialUnstakingEvent {
            escrow_owner: self.escrow.owner,
            locker: locker.key(),
            partial_unstaking: self.partial_unstake.key(),
            locker_supply: locker.locked_supply,
            timestamp: Clock::get()?.unix_timestamp,
            released_amount: self.partial_unstake.amount,
        });

        Ok(())
    }
}

impl<'info> Validate<'info> for WithdrawPartialUnstaking<'info> {
    fn validate(&self) -> Result<()> {
        assert_keys_eq!(self.locker, self.escrow.locker);
        assert_keys_neq!(self.escrow_tokens, self.destination_tokens);

        let expiration = self.partial_unstake.expiration;
        let now = Clock::get()?.unix_timestamp;
        msg!("now: {}; expiration: {}", now, expiration);
        invariant!(expiration <= now, PartialUnstakingIsNotEnded);

        Ok(())
    }
}

#[event]
/// Event called in [voter::withdraw_partial_unstaking].
pub struct WithdrawPartialUnstakingEvent {
    /// The owner of the [Escrow].
    #[index]
    pub escrow_owner: Pubkey,
    /// The locker for the [Escrow].
    #[index]
    pub locker: Pubkey,
    /// address of partial unstaking
    pub partial_unstaking: Pubkey,
    /// Timestamp for the event.
    pub timestamp: i64,
    /// The amount of tokens locked inside the [Locker].
    pub locker_supply: u64,
    /// The amount released from the [Escrow].
    pub released_amount: u64,
}

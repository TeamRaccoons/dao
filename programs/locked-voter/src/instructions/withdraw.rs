use crate::*;
use anchor_spl::token;

/// Accounts for [voter::withdraw].
#[derive(Accounts)]
pub struct Withdraw<'info> {
    /// The [Locker] being exited from.
    #[account(mut)]
    pub locker: Box<Account<'info, Locker>>,

    /// The [Escrow] that is being closed.
    #[account(mut, has_one = locker, close = payer)]
    pub escrow: Box<Account<'info, Escrow>>,

    /// Authority of the [Escrow].
    pub escrow_owner: Signer<'info>,
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

impl<'info> Withdraw<'info> {
    pub fn withdraw(&mut self) -> Result<()> {
        let seeds: &[&[&[u8]]] = escrow_seeds!(self.escrow);

        // transfer tokens from the escrow
        // if there are zero tokens in the escrow, short-circuit.
        if self.escrow.amount > 0 {
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
                self.escrow.amount,
            )?;
        }

        // close escrow_tokens
        token::close_account(
            CpiContext::new(
                self.token_program.to_account_info(),
                token::CloseAccount {
                    account: self.escrow_tokens.to_account_info(),
                    destination: self.payer.to_account_info(),
                    authority: self.escrow.to_account_info(),
                },
            )
            .with_signer(seeds),
        )?;

        // update the locker
        let locker = &mut self.locker;
        locker.locked_supply = unwrap_int!(locker.locked_supply.checked_sub(self.escrow.amount));

        emit!(ExitEscrowEvent {
            escrow_owner: self.escrow.owner,
            locker: locker.key(),
            locker_supply: locker.locked_supply,
            timestamp: Clock::get()?.unix_timestamp,
            released_amount: self.escrow.amount,
        });

        Ok(())
    }
}

impl<'info> Validate<'info> for Withdraw<'info> {
    fn validate(&self) -> Result<()> {
        assert_keys_eq!(self.locker, self.escrow.locker);
        assert_keys_eq!(self.escrow.owner, self.escrow_owner);
        assert_keys_eq!(self.escrow.tokens, self.escrow_tokens);
        assert_keys_neq!(self.escrow_tokens, self.destination_tokens);

        invariant!(!self.escrow.is_max_lock, MaxLockIsSet);
        let expiration = self.escrow.escrow_ends_at;
        let now = Clock::get()?.unix_timestamp;
        msg!("now: {}; escrow_ends_at: {}", now, expiration);
        invariant!(expiration <= now, EscrowNotEnded);

        invariant!(
            self.escrow.partial_unstaking_amount == 0,
            PartialUnstakingAmountIsNotZero
        );

        Ok(())
    }
}

#[event]
/// Event called in [voter::withdraw].
pub struct ExitEscrowEvent {
    /// The owner of the [Escrow].
    #[index]
    pub escrow_owner: Pubkey,
    /// The locker for the [Escrow].
    #[index]
    pub locker: Pubkey,
    /// Timestamp for the event.
    pub timestamp: i64,
    /// The amount of tokens locked inside the [Locker].
    pub locker_supply: u64,
    /// The amount released from the [Escrow].
    pub released_amount: u64,
}

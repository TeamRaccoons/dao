use crate::*;

/// ClaimRewards accounts
#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    /// Mint wrapper.
    #[account(mut)]
    pub mint_wrapper: Box<Account<'info, minter::MintWrapper>>,
    /// Mint wrapper program.
    pub mint_wrapper_program: Program<'info, minter::program::Minter>,
    /// [minter::Minter] information.
    #[account(mut)]
    pub minter: Box<Account<'info, minter::Minter>>,

    /// Mint of the rewards token.
    #[account(mut)]
    pub rewards_token_mint: Box<Account<'info, Mint>>,

    /// Account to claim rewards for.
    #[account(mut)]
    pub rewards_token_account: Box<Account<'info, TokenAccount>>,

    /// Claim accounts
    pub claim: UserClaim<'info>,
}

/// Claim accounts
///
/// This accounts struct is always used in the context of the user authority
/// staking into an account. This is NEVER used by an admin.
///
/// Validation should be extremely conservative.
#[derive(Accounts, Clone)]
pub struct UserClaim<'info> {
    /// Miner authority (i.e. the user).
    pub authority: Signer<'info>,

    /// Miner.
    #[account(mut)]
    pub miner: Account<'info, Miner>,

    /// Quarry to claim from.
    #[account(mut)]
    pub quarry: AccountLoader<'info, Quarry>,

    /// Token program
    pub token_program: Program<'info, Token>,

    /// Rewarder
    pub rewarder: Account<'info, Rewarder>,
}

pub fn handler(ctx: Context<ClaimRewards>) -> Result<()> {
    let miner = &mut ctx.accounts.claim.miner;

    let now = Clock::get()?.unix_timestamp;
    {
        let mut quarry = ctx.accounts.claim.quarry.load_mut()?;
        quarry.update_rewards_and_miner(miner, &ctx.accounts.claim.rewarder, now)?;
    }

    ctx.accounts.calculate_and_claim_rewards()?;

    Ok(())
}

impl<'info> ClaimRewards<'info> {
    /// Calculates rewards and claims them.
    pub fn calculate_and_claim_rewards(&mut self) -> Result<()> {
        let miner = &mut self.claim.miner;
        let quarry = self.claim.quarry.load()?;
        let amount_claimable = miner.rewards_earned;
        if amount_claimable == 0 {
            // 0 claimable -- skip all logic
            return Ok(());
        }

        // Claim all rewards.
        miner.rewards_earned = 0;

        // Setup remaining variables
        self.mint_claimed_tokens(amount_claimable)?;

        let now = Clock::get()?.unix_timestamp;
        emit!(ClaimEvent {
            authority: self.claim.authority.key(),
            staked_token: quarry.token_mint_key,
            timestamp: now,
            rewards_token: self.rewards_token_mint.key(),
            amount: amount_claimable,
        });

        Ok(())
    }

    /// Mints the claimed tokens.
    fn mint_claimed_tokens(&self, amount_claimable_minus_fees: u64) -> Result<()> {
        self.perform_mint(&self.rewards_token_account, amount_claimable_minus_fees)
    }

    fn create_perform_mint_accounts(
        &self,
        destination: &Account<'info, TokenAccount>,
    ) -> minter::cpi::accounts::PerformMint<'info> {
        minter::cpi::accounts::PerformMint {
            mint_wrapper: self.mint_wrapper.to_account_info(),
            minter_authority: self.claim.rewarder.to_account_info(),
            token_mint: self.rewards_token_mint.to_account_info(),
            destination: destination.to_account_info(),
            minter: self.minter.to_account_info(),
            token_program: self.claim.token_program.to_account_info(),
        }
    }

    fn perform_mint(&self, destination: &Account<'info, TokenAccount>, amount: u64) -> Result<()> {
        let claim_mint_accounts = self.create_perform_mint_accounts(destination);

        // Create the signer seeds.
        let seeds = gen_rewarder_signer_seeds!(self.claim.rewarder);
        let signer_seeds = &[&seeds[..]];

        minter::cpi::perform_mint(
            CpiContext::new_with_signer(
                self.mint_wrapper_program.to_account_info(),
                claim_mint_accounts,
                signer_seeds,
            ),
            amount,
        )
    }
}

impl<'info> Validate<'info> for ClaimRewards<'info> {
    /// Validates a [ClaimRewards] accounts struct.
    fn validate(&self) -> Result<()> {
        let quarry = self.claim.quarry.load()?;
        invariant!(quarry.is_lp_pool());
        self.claim.validate()?;
        self.claim.rewarder.assert_not_paused()?;

        assert_keys_eq!(self.mint_wrapper, self.claim.rewarder.mint_wrapper);
        assert_keys_eq!(self.mint_wrapper.token_mint, self.rewards_token_mint);

        assert_keys_eq!(self.minter.mint_wrapper, self.mint_wrapper);
        assert_keys_eq!(self.minter.minter_authority, self.claim.rewarder);

        // rewards_token_mint validate
        assert_keys_eq!(
            self.rewards_token_mint,
            self.claim.rewarder.rewards_token_mint
        );
        assert_keys_eq!(
            self.rewards_token_mint.mint_authority.unwrap(),
            self.mint_wrapper
        );

        // rewards_token_account validate
        assert_keys_eq!(self.rewards_token_account.mint, self.rewards_token_mint);

        Ok(())
    }
}

impl<'info> Validate<'info> for UserClaim<'info> {
    fn validate(&self) -> Result<()> {
        let quarry = self.quarry.load()?;
        invariant!(!self.rewarder.is_paused, Paused);
        // authority
        invariant!(self.authority.is_signer, Unauthorized);
        assert_keys_eq!(self.authority, self.miner.authority);

        // quarry
        assert_keys_eq!(self.miner.quarry, self.quarry);

        // rewarder
        assert_keys_eq!(quarry.rewarder, self.rewarder);

        Ok(())
    }
}

/// Emitted when reward tokens are claimed.
#[event]
pub struct ClaimEvent {
    /// Authority staking.
    #[index]
    pub authority: Pubkey,
    /// Token of the pool staked into.
    #[index]
    pub staked_token: Pubkey,
    /// Token received as rewards.
    pub rewards_token: Pubkey,
    /// Amount of rewards token received.
    pub amount: u64,
    /// When the event occurred.
    pub timestamp: i64,
}

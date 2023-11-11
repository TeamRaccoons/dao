use crate::ErrorCode::TypeCastFailed;
use crate::*;
use amm::AmmType;

/// Accounts for [quarry::create_quarry].
#[derive(Accounts)]
pub struct CreateQuarry<'info> {
    /// [Quarry].
    #[account(
        init,
        seeds = [
            b"Quarry".as_ref(),
            auth.rewarder.key().to_bytes().as_ref(),
            amm_pool.key().to_bytes().as_ref()
        ],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<Quarry>()
    )]
    pub quarry: Account<'info, Quarry>,

    /// CHECK:
    pub amm_pool: UncheckedAccount<'info>,

    /// [Rewarder] authority.
    pub auth: MutableRewarderWithAuthority<'info>,

    // /// [Mint] of the token to create a [Quarry] for.
    // pub token_mint: Account<'info, Mint>,
    /// Payer of [Quarry] creation.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateQuarry>, amm_type: u32) -> Result<()> {
    let amm_type = AmmType::get_amm_type(amm_type).ok_or(TypeCastFailed)?;
    #[cfg(feature = "mainnet")]
    invariant!(amm_type == AmmType::MeteoraAmm || amm_type == AmmType::LbClmm);

    let rewarder = &mut ctx.accounts.auth.rewarder;
    // Update rewarder's quarry stats
    let index = rewarder.num_quarries;
    rewarder.num_quarries = unwrap_int!(rewarder.num_quarries.checked_add(1));

    let quarry = &mut ctx.accounts.quarry;
    quarry.bump = unwrap_bump!(ctx, "quarry");

    let amm_pool = amm_type.get_amm(ctx.accounts.amm_pool.to_account_info())?;

    quarry.token_mint_key = amm_pool.get_lp_token_account();

    // Set quarry params
    quarry.amm_pool = ctx.accounts.amm_pool.key();
    quarry.index = index;
    quarry.famine_ts = i64::MAX;
    quarry.rewarder = rewarder.key();
    quarry.annual_rewards_rate = 0;
    quarry.rewards_share = 0;
    quarry.amm_type = amm_type.decode();

    quarry.reward_infos = [RewardInfo::default(); MAX_REWARD];

    let current_ts = Clock::get()?.unix_timestamp;
    emit!(QuarryCreateEvent {
        amm_pool: quarry.amm_pool,
        timestamp: current_ts,
    });

    Ok(())
}

impl<'info> Validate<'info> for CreateQuarry<'info> {
    fn validate(&self) -> Result<()> {
        self.auth.validate()?;
        invariant!(!self.auth.rewarder.is_paused, Paused);
        Ok(())
    }
}

/// Emitted when a new quarry is created.
#[event]
pub struct QuarryCreateEvent {
    /// Amm pool
    pub amm_pool: Pubkey,
    /// When the event took place.
    pub timestamp: i64,
}

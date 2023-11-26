export type Vault = {
  version: "0.7.2";
  name: "vault";
  docs: ["Program for vault"];
  instructions: [
    {
      name: "initialize";
      docs: ["initialize new vault"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: [
            "This is base account for all vault",
            "No need base key now because we only allow 1 vault per token now",
            "Vault account"
          ];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["Payer can be anyone"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["Token vault account"];
        },
        {
          name: "tokenMint";
          isMut: false;
          isSigner: false;
          docs: ["Token mint account"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["LP mint account"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["rent"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["system_program"];
        }
      ];
      args: [];
    },
    {
      name: "initializeIdleVault";
      docs: ["initialize idle vault the vault that cannot be rebalanced"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
          docs: ["Payer can be anyone"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["Token vault account"];
        },
        {
          name: "tokenMint";
          isMut: false;
          isSigner: false;
          docs: ["Token mint account"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["LP mint"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["rent"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["system_program"];
        }
      ];
      args: [];
    },
    {
      name: "enableVault";
      docs: ["enable vault"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["Admin account"];
        }
      ];
      args: [
        {
          name: "enabled";
          type: "u8";
        }
      ];
    },
    {
      name: "setOperator";
      docs: ["set new operator"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "operator";
          isMut: false;
          isSigner: false;
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["admin"];
        }
      ];
      args: [];
    },
    {
      name: "updateLockedProfitDegradation";
      docs: ["update locked profit degradation"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["Admin account"];
        }
      ];
      args: [
        {
          name: "lockedProfitDegradation";
          type: "u64";
        }
      ];
    },
    {
      name: "getUnlockedAmount";
      docs: ["get unlocked amount"];
      accounts: [
        {
          name: "vault";
          isMut: false;
          isSigner: false;
          docs: ["Vault account"];
        }
      ];
      args: [];
    },
    {
      name: "transferAdmin";
      docs: ["transfer admin"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["Admin account"];
        },
        {
          name: "newAdmin";
          isMut: false;
          isSigner: true;
          docs: ["New vault admin"];
        }
      ];
      args: [];
    },
    {
      name: "transferFeeVault";
      docs: ["transfer fee account"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["Admin account"];
        },
        {
          name: "newFeeVault";
          isMut: false;
          isSigner: false;
          docs: ["New fee vault account"];
        }
      ];
      args: [];
    },
    {
      name: "initializeStrategy";
      docs: [
        "Initialize a strategy and add strategy to vault.strategies index"
      ];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "strategyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "strategy";
          isMut: true;
          isSigner: false;
          docs: ["Strategy account"];
        },
        {
          name: "reserve";
          isMut: true;
          isSigner: false;
        },
        {
          name: "collateralVault";
          isMut: true;
          isSigner: false;
          docs: ["Collateral vault account"];
        },
        {
          name: "collateralMint";
          isMut: false;
          isSigner: false;
          docs: ["Collateral mint account"];
        },
        {
          name: "admin";
          isMut: true;
          isSigner: true;
          docs: ["Admin account"];
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
          docs: ["System program account"];
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
          docs: ["Rent account"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["Token program account"];
        }
      ];
      args: [
        {
          name: "bumps";
          type: {
            defined: "StrategyBumps";
          };
        },
        {
          name: "strategyType";
          type: {
            defined: "StrategyType";
          };
        }
      ];
    },
    {
      name: "removeStrategy";
      docs: ["remove a strategy"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "strategy";
          isMut: true;
          isSigner: false;
          docs: ["Strategy account"];
        },
        {
          name: "strategyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralVault";
          isMut: true;
          isSigner: false;
          docs: ["Collateral vault account"];
        },
        {
          name: "reserve";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "feeVault";
          isMut: true;
          isSigner: false;
          docs: ["fee_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["admin"];
        }
      ];
      args: [];
    },
    {
      name: "removeStrategy2";
      docs: ["remove a strategy by advance payment"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["Vault account"];
        },
        {
          name: "strategy";
          isMut: true;
          isSigner: false;
          docs: ["Strategy account"];
        },
        {
          name: "strategyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralVault";
          isMut: true;
          isSigner: false;
          docs: ["Collateral vault account"];
        },
        {
          name: "reserve";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "tokenAdminAdvancePayment";
          isMut: true;
          isSigner: false;
          docs: [
            "token_advance_payemnt",
            "the owner of token_advance_payment must be admin"
          ];
        },
        {
          name: "tokenVaultAdvancePayment";
          isMut: true;
          isSigner: false;
          docs: [
            "token_vault_advance_payment",
            "the account must be different from token_vault",
            "the owner of token_advance_payment must be vault"
          ];
        },
        {
          name: "feeVault";
          isMut: true;
          isSigner: false;
          docs: ["fee_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["admin"];
        }
      ];
      args: [
        {
          name: "maxAdminPayAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "collectDust";
      docs: [
        "collect token, that someone send wrongly",
        "also help in case Mango reimbursement"
      ];
      accounts: [
        {
          name: "vault";
          isMut: false;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["Token vault, must be different from vault.token_vault"];
        },
        {
          name: "tokenAdmin";
          isMut: true;
          isSigner: false;
          docs: ["token admin, enforce owner is admin to avoid mistake"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["admin"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        }
      ];
      args: [];
    },
    {
      name: "addStrategy";
      docs: ["add a strategy"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "strategy";
          isMut: false;
          isSigner: false;
          docs: ["strategy"];
        },
        {
          name: "admin";
          isMut: false;
          isSigner: true;
          docs: ["admin"];
        }
      ];
      args: [];
    },
    {
      name: "depositStrategy";
      docs: ["deposit liquidity to a strategy"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "strategy";
          isMut: true;
          isSigner: false;
          docs: ["strategy"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "feeVault";
          isMut: true;
          isSigner: false;
          docs: ["fee_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "strategyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralVault";
          isMut: true;
          isSigner: false;
          docs: ["collateral_vault"];
        },
        {
          name: "reserve";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        },
        {
          name: "operator";
          isMut: false;
          isSigner: true;
          docs: ["operator"];
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "withdrawStrategy";
      docs: ["withdraw liquidity from a strategy"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "strategy";
          isMut: true;
          isSigner: false;
          docs: ["strategy"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "feeVault";
          isMut: true;
          isSigner: false;
          docs: ["fee_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "strategyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralVault";
          isMut: true;
          isSigner: false;
          docs: ["collateral_vault"];
        },
        {
          name: "reserve";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        },
        {
          name: "operator";
          isMut: false;
          isSigner: true;
          docs: ["operator"];
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "claimRewards";
      docs: ["claim rewards from a strategy"];
      accounts: [
        {
          name: "vault";
          isMut: false;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "strategy";
          isMut: false;
          isSigner: false;
          docs: ["strategy"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        },
        {
          name: "tokenRewardAcc";
          isMut: true;
          isSigner: false;
          docs: ["token_reward_acc"];
        },
        {
          name: "operator";
          isMut: false;
          isSigner: true;
          docs: ["operator"];
        }
      ];
      args: [];
    },
    {
      name: "withdraw2";
      docs: [
        "Withdraw v2. Withdraw from token vault if no remaining accounts are available. Else, it will attempt to withdraw from strategy and token vault. This method just proxy between 2 methods. Protocol integration should be using withdraw instead of this function."
      ];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
          docs: ["user_token"];
        },
        {
          name: "userLp";
          isMut: true;
          isSigner: false;
          docs: ["user_lp"];
        },
        {
          name: "user";
          isMut: false;
          isSigner: true;
          docs: ["user"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        }
      ];
      args: [
        {
          name: "unmintAmount";
          type: "u64";
        },
        {
          name: "minOutAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "deposit";
      docs: ["user deposit liquidity to vault"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
          docs: ["user_token"];
        },
        {
          name: "userLp";
          isMut: true;
          isSigner: false;
          docs: ["user_lp"];
        },
        {
          name: "user";
          isMut: false;
          isSigner: true;
          docs: ["user"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        }
      ];
      args: [
        {
          name: "tokenAmount";
          type: "u64";
        },
        {
          name: "minimumLpTokenAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "withdraw";
      docs: ["user withdraw liquidity from vault"];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
          docs: ["user_token"];
        },
        {
          name: "userLp";
          isMut: true;
          isSigner: false;
          docs: ["user_lp"];
        },
        {
          name: "user";
          isMut: false;
          isSigner: true;
          docs: ["user"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        }
      ];
      args: [
        {
          name: "unmintAmount";
          type: "u64";
        },
        {
          name: "minOutAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "withdrawDirectlyFromStrategy";
      docs: [
        "user withdraw liquidity from vault, if vault reserve doesn't have enough liquidity, it will withdraw from the strategy firstly"
      ];
      accounts: [
        {
          name: "vault";
          isMut: true;
          isSigner: false;
          docs: ["vault"];
        },
        {
          name: "strategy";
          isMut: true;
          isSigner: false;
          docs: ["strategy"];
        },
        {
          name: "reserve";
          isMut: true;
          isSigner: false;
        },
        {
          name: "strategyProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "collateralVault";
          isMut: true;
          isSigner: false;
          docs: ["collateral_vault"];
        },
        {
          name: "tokenVault";
          isMut: true;
          isSigner: false;
          docs: ["token_vault"];
        },
        {
          name: "lpMint";
          isMut: true;
          isSigner: false;
          docs: ["lp_mint"];
        },
        {
          name: "feeVault";
          isMut: true;
          isSigner: false;
          docs: ["fee_vault"];
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
          docs: ["user_token"];
        },
        {
          name: "userLp";
          isMut: true;
          isSigner: false;
          docs: ["user_lp"];
        },
        {
          name: "user";
          isMut: false;
          isSigner: true;
          docs: ["user"];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
          docs: ["token_program"];
        }
      ];
      args: [
        {
          name: "unmintAmount";
          type: "u64";
        },
        {
          name: "minOutAmount";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "vault";
      docs: ["Vault struct"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "enabled";
            docs: [
              "The flag, if admin set enable = false, then the user can only withdraw and cannot deposit in the vault."
            ];
            type: "u8";
          },
          {
            name: "bumps";
            docs: ["Vault nonce, to create vault seeds"];
            type: {
              defined: "VaultBumps";
            };
          },
          {
            name: "totalAmount";
            docs: [
              "The total liquidity of the vault, including remaining tokens in token_vault and the liquidity in all strategies."
            ];
            type: "u64";
          },
          {
            name: "tokenVault";
            docs: ["Token account, hold liquidity in vault reserve"];
            type: "publicKey";
          },
          {
            name: "feeVault";
            docs: [
              "Hold lp token of vault, each time rebalance crank is called, vault calculate performance fee and mint corresponding lp token amount to fee_vault. fee_vault is owned by treasury address"
            ];
            type: "publicKey";
          },
          {
            name: "tokenMint";
            docs: ["Token mint that vault supports"];
            type: "publicKey";
          },
          {
            name: "lpMint";
            docs: ["Lp mint of vault"];
            type: "publicKey";
          },
          {
            name: "strategies";
            docs: [
              "The list of strategy addresses that vault supports, vault can support up to MAX_STRATEGY strategies at the same time."
            ];
            type: {
              array: ["publicKey", 30];
            };
          },
          {
            name: "base";
            docs: ["The base address to create vault seeds"];
            type: "publicKey";
          },
          {
            name: "admin";
            docs: ["Admin of vault"];
            type: "publicKey";
          },
          {
            name: "operator";
            docs: [
              "Person who can send the crank. Operator can only send liquidity to strategies that admin defined, and claim reward to account of treasury address"
            ];
            type: "publicKey";
          },
          {
            name: "lockedProfitTracker";
            docs: ["Stores information for locked profit."];
            type: {
              defined: "LockedProfitTracker";
            };
          }
        ];
      };
    },
    {
      name: "strategy";
      docs: ["Strategy struct"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "reserve";
            docs: [
              "Lending pool address, that the strategy will deposit/withdraw balance"
            ];
            type: "publicKey";
          },
          {
            name: "collateralVault";
            docs: ["The token account, that holds the collateral token"];
            type: "publicKey";
          },
          {
            name: "strategyType";
            docs: ["Specify type of strategy"];
            type: {
              defined: "StrategyType";
            };
          },
          {
            name: "currentLiquidity";
            docs: [
              "The liquidity in strategy at the time vault deposit/withdraw from a lending protocol"
            ];
            type: "u64";
          },
          {
            name: "bumps";
            docs: [
              "Hold some bumps, in case the strategy needs to use other seeds to sign a CPI call."
            ];
            type: {
              array: ["u8", 10];
            };
          },
          {
            name: "vault";
            docs: ["Vault address, that the strategy belongs"];
            type: "publicKey";
          },
          {
            name: "isDisable";
            docs: [
              "If we remove strategy by remove_strategy2 endpoint, this account will be never added again"
            ];
            type: "u8";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "LockedProfitTracker";
      docs: ["LockedProfitTracker struct"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "lastUpdatedLockedProfit";
            docs: ["The total locked profit from the last report"];
            type: "u64";
          },
          {
            name: "lastReport";
            docs: ["The last timestamp (in seconds) rebalancing"];
            type: "u64";
          },
          {
            name: "lockedProfitDegradation";
            docs: ["Rate per second of degradation"];
            type: "u64";
          }
        ];
      };
    },
    {
      name: "VaultBumps";
      docs: ["Vault bumps struct"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "vaultBump";
            docs: ["vault_bump"];
            type: "u8";
          },
          {
            name: "tokenVaultBump";
            docs: ["token_vault_bump"];
            type: "u8";
          }
        ];
      };
    },
    {
      name: "StrategyBumps";
      docs: ["Strategy bumps struct"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "strategyIndex";
            docs: ["strategy_index"];
            type: "u8";
          },
          {
            name: "otherBumps";
            docs: ["Bumps of PDAs for the integrated protocol."];
            type: {
              array: ["u8", 10];
            };
          }
        ];
      };
    },
    {
      name: "StrategyType";
      docs: ["StrategyType struct"];
      type: {
        kind: "enum";
        variants: [
          {
            name: "PortFinanceWithoutLM";
          },
          {
            name: "PortFinanceWithLM";
          },
          {
            name: "SolendWithoutLM";
          },
          {
            name: "Mango";
          },
          {
            name: "SolendWithLM";
          },
          {
            name: "ApricotWithoutLM";
          },
          {
            name: "Francium";
          },
          {
            name: "Tulip";
          },
          {
            name: "Vault";
          },
          {
            name: "Drift";
          },
          {
            name: "Frakt";
          },
          {
            name: "Marginfi";
          }
        ];
      };
    },
    {
      name: "VaultType";
      docs: ["Vault type"];
      type: {
        kind: "enum";
        variants: [
          {
            name: "IdleVault";
          },
          {
            name: "RebalanceVault";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "AddLiquidity";
      fields: [
        {
          name: "lpMintAmount";
          type: "u64";
          index: false;
        },
        {
          name: "tokenAmount";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "RemoveLiquidity";
      fields: [
        {
          name: "lpUnmintAmount";
          type: "u64";
          index: false;
        },
        {
          name: "tokenAmount";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "StrategyDeposit";
      fields: [
        {
          name: "strategyType";
          type: {
            defined: "StrategyType";
          };
          index: false;
        },
        {
          name: "tokenAmount";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "StrategyWithdraw";
      fields: [
        {
          name: "strategyType";
          type: {
            defined: "StrategyType";
          };
          index: false;
        },
        {
          name: "collateralAmount";
          type: "u64";
          index: false;
        },
        {
          name: "estimatedTokenAmount";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "ClaimReward";
      fields: [
        {
          name: "strategyType";
          type: {
            defined: "StrategyType";
          };
          index: false;
        },
        {
          name: "tokenAmount";
          type: "u64";
          index: false;
        },
        {
          name: "mintAccount";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "PerformanceFee";
      fields: [
        {
          name: "lpMintMore";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "ReportLoss";
      fields: [
        {
          name: "strategy";
          type: "publicKey";
          index: false;
        },
        {
          name: "loss";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "TotalAmount";
      fields: [
        {
          name: "totalAmount";
          type: "u64";
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "VaultIsDisabled";
      msg: "Vault is disabled";
    },
    {
      code: 6001;
      name: "ExceededSlippage";
      msg: "Exceeded slippage tolerance";
    },
    {
      code: 6002;
      name: "StrategyIsNotExisted";
      msg: "Strategy is not existed";
    },
    {
      code: 6003;
      name: "UnAuthorized";
      msg: "UnAuthorized";
    },
    {
      code: 6004;
      name: "MathOverflow";
      msg: "Math operation overflow";
    },
    {
      code: 6005;
      name: "ProtocolIsNotSupported";
      msg: "Protocol is not supported";
    },
    {
      code: 6006;
      name: "UnMatchReserve";
      msg: "Reserve does not support token mint";
    },
    {
      code: 6007;
      name: "InvalidLockedProfitDegradation";
      msg: "lockedProfitDegradation is invalid";
    },
    {
      code: 6008;
      name: "MaxStrategyReached";
      msg: "Maximum number of strategies have been reached";
    },
    {
      code: 6009;
      name: "StrategyExisted";
      msg: "Strategy existed";
    },
    {
      code: 6010;
      name: "InvalidUnmintAmount";
      msg: "Invalid unmint amount";
    },
    {
      code: 6011;
      name: "InvalidAccountsForStrategy";
      msg: "Invalid accounts for strategy";
    },
    {
      code: 6012;
      name: "InvalidBump";
      msg: "Invalid bump";
    },
    {
      code: 6013;
      name: "AmountMustGreaterThanZero";
      msg: "Amount must be greater than 0";
    },
    {
      code: 6014;
      name: "MangoIsNotSupportedAnymore";
      msg: "Mango is not supported anymore";
    },
    {
      code: 6015;
      name: "StrategyIsNotSupported";
      msg: "Strategy is not supported";
    },
    {
      code: 6016;
      name: "PayAmountIsExeeced";
      msg: "Pay amount is exceeded";
    },
    {
      code: 6017;
      name: "FeeVaultIsNotSet";
      msg: "Fee vault is not set";
    },
    {
      code: 6018;
      name: "LendingAssertionViolation";
      msg: "deposit amount in lending is not matched";
    },
    {
      code: 6019;
      name: "HaveMoneyInLending";
      msg: "Cannot remove strategy becase we have some in lending";
    }
  ];
};

export const IDL: Vault = {
  version: "0.7.2",
  name: "vault",
  docs: ["Program for vault"],
  instructions: [
    {
      name: "initialize",
      docs: ["initialize new vault"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: [
            "This is base account for all vault",
            "No need base key now because we only allow 1 vault per token now",
            "Vault account",
          ],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["Payer can be anyone"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["Token vault account"],
        },
        {
          name: "tokenMint",
          isMut: false,
          isSigner: false,
          docs: ["Token mint account"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["LP mint account"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["rent"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["system_program"],
        },
      ],
      args: [],
    },
    {
      name: "initializeIdleVault",
      docs: ["initialize idle vault the vault that cannot be rebalanced"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
          docs: ["Payer can be anyone"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["Token vault account"],
        },
        {
          name: "tokenMint",
          isMut: false,
          isSigner: false,
          docs: ["Token mint account"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["LP mint"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["rent"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["system_program"],
        },
      ],
      args: [],
    },
    {
      name: "enableVault",
      docs: ["enable vault"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["Admin account"],
        },
      ],
      args: [
        {
          name: "enabled",
          type: "u8",
        },
      ],
    },
    {
      name: "setOperator",
      docs: ["set new operator"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "operator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["admin"],
        },
      ],
      args: [],
    },
    {
      name: "updateLockedProfitDegradation",
      docs: ["update locked profit degradation"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["Admin account"],
        },
      ],
      args: [
        {
          name: "lockedProfitDegradation",
          type: "u64",
        },
      ],
    },
    {
      name: "getUnlockedAmount",
      docs: ["get unlocked amount"],
      accounts: [
        {
          name: "vault",
          isMut: false,
          isSigner: false,
          docs: ["Vault account"],
        },
      ],
      args: [],
    },
    {
      name: "transferAdmin",
      docs: ["transfer admin"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["Admin account"],
        },
        {
          name: "newAdmin",
          isMut: false,
          isSigner: true,
          docs: ["New vault admin"],
        },
      ],
      args: [],
    },
    {
      name: "transferFeeVault",
      docs: ["transfer fee account"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["Admin account"],
        },
        {
          name: "newFeeVault",
          isMut: false,
          isSigner: false,
          docs: ["New fee vault account"],
        },
      ],
      args: [],
    },
    {
      name: "initializeStrategy",
      docs: [
        "Initialize a strategy and add strategy to vault.strategies index",
      ],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "strategyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "strategy",
          isMut: true,
          isSigner: false,
          docs: ["Strategy account"],
        },
        {
          name: "reserve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collateralVault",
          isMut: true,
          isSigner: false,
          docs: ["Collateral vault account"],
        },
        {
          name: "collateralMint",
          isMut: false,
          isSigner: false,
          docs: ["Collateral mint account"],
        },
        {
          name: "admin",
          isMut: true,
          isSigner: true,
          docs: ["Admin account"],
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
          docs: ["System program account"],
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
          docs: ["Rent account"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["Token program account"],
        },
      ],
      args: [
        {
          name: "bumps",
          type: {
            defined: "StrategyBumps",
          },
        },
        {
          name: "strategyType",
          type: {
            defined: "StrategyType",
          },
        },
      ],
    },
    {
      name: "removeStrategy",
      docs: ["remove a strategy"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "strategy",
          isMut: true,
          isSigner: false,
          docs: ["Strategy account"],
        },
        {
          name: "strategyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralVault",
          isMut: true,
          isSigner: false,
          docs: ["Collateral vault account"],
        },
        {
          name: "reserve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "feeVault",
          isMut: true,
          isSigner: false,
          docs: ["fee_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["admin"],
        },
      ],
      args: [],
    },
    {
      name: "removeStrategy2",
      docs: ["remove a strategy by advance payment"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["Vault account"],
        },
        {
          name: "strategy",
          isMut: true,
          isSigner: false,
          docs: ["Strategy account"],
        },
        {
          name: "strategyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralVault",
          isMut: true,
          isSigner: false,
          docs: ["Collateral vault account"],
        },
        {
          name: "reserve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "tokenAdminAdvancePayment",
          isMut: true,
          isSigner: false,
          docs: [
            "token_advance_payemnt",
            "the owner of token_advance_payment must be admin",
          ],
        },
        {
          name: "tokenVaultAdvancePayment",
          isMut: true,
          isSigner: false,
          docs: [
            "token_vault_advance_payment",
            "the account must be different from token_vault",
            "the owner of token_advance_payment must be vault",
          ],
        },
        {
          name: "feeVault",
          isMut: true,
          isSigner: false,
          docs: ["fee_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["admin"],
        },
      ],
      args: [
        {
          name: "maxAdminPayAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "collectDust",
      docs: [
        "collect token, that someone send wrongly",
        "also help in case Mango reimbursement",
      ],
      accounts: [
        {
          name: "vault",
          isMut: false,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["Token vault, must be different from vault.token_vault"],
        },
        {
          name: "tokenAdmin",
          isMut: true,
          isSigner: false,
          docs: ["token admin, enforce owner is admin to avoid mistake"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["admin"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
      ],
      args: [],
    },
    {
      name: "addStrategy",
      docs: ["add a strategy"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "strategy",
          isMut: false,
          isSigner: false,
          docs: ["strategy"],
        },
        {
          name: "admin",
          isMut: false,
          isSigner: true,
          docs: ["admin"],
        },
      ],
      args: [],
    },
    {
      name: "depositStrategy",
      docs: ["deposit liquidity to a strategy"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "strategy",
          isMut: true,
          isSigner: false,
          docs: ["strategy"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "feeVault",
          isMut: true,
          isSigner: false,
          docs: ["fee_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "strategyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralVault",
          isMut: true,
          isSigner: false,
          docs: ["collateral_vault"],
        },
        {
          name: "reserve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
        {
          name: "operator",
          isMut: false,
          isSigner: true,
          docs: ["operator"],
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdrawStrategy",
      docs: ["withdraw liquidity from a strategy"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "strategy",
          isMut: true,
          isSigner: false,
          docs: ["strategy"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "feeVault",
          isMut: true,
          isSigner: false,
          docs: ["fee_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "strategyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralVault",
          isMut: true,
          isSigner: false,
          docs: ["collateral_vault"],
        },
        {
          name: "reserve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
        {
          name: "operator",
          isMut: false,
          isSigner: true,
          docs: ["operator"],
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "claimRewards",
      docs: ["claim rewards from a strategy"],
      accounts: [
        {
          name: "vault",
          isMut: false,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "strategy",
          isMut: false,
          isSigner: false,
          docs: ["strategy"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
        {
          name: "tokenRewardAcc",
          isMut: true,
          isSigner: false,
          docs: ["token_reward_acc"],
        },
        {
          name: "operator",
          isMut: false,
          isSigner: true,
          docs: ["operator"],
        },
      ],
      args: [],
    },
    {
      name: "withdraw2",
      docs: [
        "Withdraw v2. Withdraw from token vault if no remaining accounts are available. Else, it will attempt to withdraw from strategy and token vault. This method just proxy between 2 methods. Protocol integration should be using withdraw instead of this function.",
      ],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
          docs: ["user_token"],
        },
        {
          name: "userLp",
          isMut: true,
          isSigner: false,
          docs: ["user_lp"],
        },
        {
          name: "user",
          isMut: false,
          isSigner: true,
          docs: ["user"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
      ],
      args: [
        {
          name: "unmintAmount",
          type: "u64",
        },
        {
          name: "minOutAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "deposit",
      docs: ["user deposit liquidity to vault"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
          docs: ["user_token"],
        },
        {
          name: "userLp",
          isMut: true,
          isSigner: false,
          docs: ["user_lp"],
        },
        {
          name: "user",
          isMut: false,
          isSigner: true,
          docs: ["user"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
      ],
      args: [
        {
          name: "tokenAmount",
          type: "u64",
        },
        {
          name: "minimumLpTokenAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdraw",
      docs: ["user withdraw liquidity from vault"],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
          docs: ["user_token"],
        },
        {
          name: "userLp",
          isMut: true,
          isSigner: false,
          docs: ["user_lp"],
        },
        {
          name: "user",
          isMut: false,
          isSigner: true,
          docs: ["user"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
      ],
      args: [
        {
          name: "unmintAmount",
          type: "u64",
        },
        {
          name: "minOutAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdrawDirectlyFromStrategy",
      docs: [
        "user withdraw liquidity from vault, if vault reserve doesn't have enough liquidity, it will withdraw from the strategy firstly",
      ],
      accounts: [
        {
          name: "vault",
          isMut: true,
          isSigner: false,
          docs: ["vault"],
        },
        {
          name: "strategy",
          isMut: true,
          isSigner: false,
          docs: ["strategy"],
        },
        {
          name: "reserve",
          isMut: true,
          isSigner: false,
        },
        {
          name: "strategyProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "collateralVault",
          isMut: true,
          isSigner: false,
          docs: ["collateral_vault"],
        },
        {
          name: "tokenVault",
          isMut: true,
          isSigner: false,
          docs: ["token_vault"],
        },
        {
          name: "lpMint",
          isMut: true,
          isSigner: false,
          docs: ["lp_mint"],
        },
        {
          name: "feeVault",
          isMut: true,
          isSigner: false,
          docs: ["fee_vault"],
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
          docs: ["user_token"],
        },
        {
          name: "userLp",
          isMut: true,
          isSigner: false,
          docs: ["user_lp"],
        },
        {
          name: "user",
          isMut: false,
          isSigner: true,
          docs: ["user"],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
          docs: ["token_program"],
        },
      ],
      args: [
        {
          name: "unmintAmount",
          type: "u64",
        },
        {
          name: "minOutAmount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "vault",
      docs: ["Vault struct"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "enabled",
            docs: [
              "The flag, if admin set enable = false, then the user can only withdraw and cannot deposit in the vault.",
            ],
            type: "u8",
          },
          {
            name: "bumps",
            docs: ["Vault nonce, to create vault seeds"],
            type: {
              defined: "VaultBumps",
            },
          },
          {
            name: "totalAmount",
            docs: [
              "The total liquidity of the vault, including remaining tokens in token_vault and the liquidity in all strategies.",
            ],
            type: "u64",
          },
          {
            name: "tokenVault",
            docs: ["Token account, hold liquidity in vault reserve"],
            type: "publicKey",
          },
          {
            name: "feeVault",
            docs: [
              "Hold lp token of vault, each time rebalance crank is called, vault calculate performance fee and mint corresponding lp token amount to fee_vault. fee_vault is owned by treasury address",
            ],
            type: "publicKey",
          },
          {
            name: "tokenMint",
            docs: ["Token mint that vault supports"],
            type: "publicKey",
          },
          {
            name: "lpMint",
            docs: ["Lp mint of vault"],
            type: "publicKey",
          },
          {
            name: "strategies",
            docs: [
              "The list of strategy addresses that vault supports, vault can support up to MAX_STRATEGY strategies at the same time.",
            ],
            type: {
              array: ["publicKey", 30],
            },
          },
          {
            name: "base",
            docs: ["The base address to create vault seeds"],
            type: "publicKey",
          },
          {
            name: "admin",
            docs: ["Admin of vault"],
            type: "publicKey",
          },
          {
            name: "operator",
            docs: [
              "Person who can send the crank. Operator can only send liquidity to strategies that admin defined, and claim reward to account of treasury address",
            ],
            type: "publicKey",
          },
          {
            name: "lockedProfitTracker",
            docs: ["Stores information for locked profit."],
            type: {
              defined: "LockedProfitTracker",
            },
          },
        ],
      },
    },
    {
      name: "strategy",
      docs: ["Strategy struct"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "reserve",
            docs: [
              "Lending pool address, that the strategy will deposit/withdraw balance",
            ],
            type: "publicKey",
          },
          {
            name: "collateralVault",
            docs: ["The token account, that holds the collateral token"],
            type: "publicKey",
          },
          {
            name: "strategyType",
            docs: ["Specify type of strategy"],
            type: {
              defined: "StrategyType",
            },
          },
          {
            name: "currentLiquidity",
            docs: [
              "The liquidity in strategy at the time vault deposit/withdraw from a lending protocol",
            ],
            type: "u64",
          },
          {
            name: "bumps",
            docs: [
              "Hold some bumps, in case the strategy needs to use other seeds to sign a CPI call.",
            ],
            type: {
              array: ["u8", 10],
            },
          },
          {
            name: "vault",
            docs: ["Vault address, that the strategy belongs"],
            type: "publicKey",
          },
          {
            name: "isDisable",
            docs: [
              "If we remove strategy by remove_strategy2 endpoint, this account will be never added again",
            ],
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "LockedProfitTracker",
      docs: ["LockedProfitTracker struct"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "lastUpdatedLockedProfit",
            docs: ["The total locked profit from the last report"],
            type: "u64",
          },
          {
            name: "lastReport",
            docs: ["The last timestamp (in seconds) rebalancing"],
            type: "u64",
          },
          {
            name: "lockedProfitDegradation",
            docs: ["Rate per second of degradation"],
            type: "u64",
          },
        ],
      },
    },
    {
      name: "VaultBumps",
      docs: ["Vault bumps struct"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "vaultBump",
            docs: ["vault_bump"],
            type: "u8",
          },
          {
            name: "tokenVaultBump",
            docs: ["token_vault_bump"],
            type: "u8",
          },
        ],
      },
    },
    {
      name: "StrategyBumps",
      docs: ["Strategy bumps struct"],
      type: {
        kind: "struct",
        fields: [
          {
            name: "strategyIndex",
            docs: ["strategy_index"],
            type: "u8",
          },
          {
            name: "otherBumps",
            docs: ["Bumps of PDAs for the integrated protocol."],
            type: {
              array: ["u8", 10],
            },
          },
        ],
      },
    },
    {
      name: "StrategyType",
      docs: ["StrategyType struct"],
      type: {
        kind: "enum",
        variants: [
          {
            name: "PortFinanceWithoutLM",
          },
          {
            name: "PortFinanceWithLM",
          },
          {
            name: "SolendWithoutLM",
          },
          {
            name: "Mango",
          },
          {
            name: "SolendWithLM",
          },
          {
            name: "ApricotWithoutLM",
          },
          {
            name: "Francium",
          },
          {
            name: "Tulip",
          },
          {
            name: "Vault",
          },
          {
            name: "Drift",
          },
          {
            name: "Frakt",
          },
          {
            name: "Marginfi",
          },
        ],
      },
    },
    {
      name: "VaultType",
      docs: ["Vault type"],
      type: {
        kind: "enum",
        variants: [
          {
            name: "IdleVault",
          },
          {
            name: "RebalanceVault",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "AddLiquidity",
      fields: [
        {
          name: "lpMintAmount",
          type: "u64",
          index: false,
        },
        {
          name: "tokenAmount",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "RemoveLiquidity",
      fields: [
        {
          name: "lpUnmintAmount",
          type: "u64",
          index: false,
        },
        {
          name: "tokenAmount",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "StrategyDeposit",
      fields: [
        {
          name: "strategyType",
          type: {
            defined: "StrategyType",
          },
          index: false,
        },
        {
          name: "tokenAmount",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "StrategyWithdraw",
      fields: [
        {
          name: "strategyType",
          type: {
            defined: "StrategyType",
          },
          index: false,
        },
        {
          name: "collateralAmount",
          type: "u64",
          index: false,
        },
        {
          name: "estimatedTokenAmount",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "ClaimReward",
      fields: [
        {
          name: "strategyType",
          type: {
            defined: "StrategyType",
          },
          index: false,
        },
        {
          name: "tokenAmount",
          type: "u64",
          index: false,
        },
        {
          name: "mintAccount",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "PerformanceFee",
      fields: [
        {
          name: "lpMintMore",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "ReportLoss",
      fields: [
        {
          name: "strategy",
          type: "publicKey",
          index: false,
        },
        {
          name: "loss",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "TotalAmount",
      fields: [
        {
          name: "totalAmount",
          type: "u64",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "VaultIsDisabled",
      msg: "Vault is disabled",
    },
    {
      code: 6001,
      name: "ExceededSlippage",
      msg: "Exceeded slippage tolerance",
    },
    {
      code: 6002,
      name: "StrategyIsNotExisted",
      msg: "Strategy is not existed",
    },
    {
      code: 6003,
      name: "UnAuthorized",
      msg: "UnAuthorized",
    },
    {
      code: 6004,
      name: "MathOverflow",
      msg: "Math operation overflow",
    },
    {
      code: 6005,
      name: "ProtocolIsNotSupported",
      msg: "Protocol is not supported",
    },
    {
      code: 6006,
      name: "UnMatchReserve",
      msg: "Reserve does not support token mint",
    },
    {
      code: 6007,
      name: "InvalidLockedProfitDegradation",
      msg: "lockedProfitDegradation is invalid",
    },
    {
      code: 6008,
      name: "MaxStrategyReached",
      msg: "Maximum number of strategies have been reached",
    },
    {
      code: 6009,
      name: "StrategyExisted",
      msg: "Strategy existed",
    },
    {
      code: 6010,
      name: "InvalidUnmintAmount",
      msg: "Invalid unmint amount",
    },
    {
      code: 6011,
      name: "InvalidAccountsForStrategy",
      msg: "Invalid accounts for strategy",
    },
    {
      code: 6012,
      name: "InvalidBump",
      msg: "Invalid bump",
    },
    {
      code: 6013,
      name: "AmountMustGreaterThanZero",
      msg: "Amount must be greater than 0",
    },
    {
      code: 6014,
      name: "MangoIsNotSupportedAnymore",
      msg: "Mango is not supported anymore",
    },
    {
      code: 6015,
      name: "StrategyIsNotSupported",
      msg: "Strategy is not supported",
    },
    {
      code: 6016,
      name: "PayAmountIsExeeced",
      msg: "Pay amount is exceeded",
    },
    {
      code: 6017,
      name: "FeeVaultIsNotSet",
      msg: "Fee vault is not set",
    },
    {
      code: 6018,
      name: "LendingAssertionViolation",
      msg: "deposit amount in lending is not matched",
    },
    {
      code: 6019,
      name: "HaveMoneyInLending",
      msg: "Cannot remove strategy becase we have some in lending",
    },
  ],
};
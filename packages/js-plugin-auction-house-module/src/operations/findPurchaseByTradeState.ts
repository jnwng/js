import type { Commitment, PublicKey } from '@solana/web3.js';
import { AuctionHouse, Purchase } from '../models';
import { findPurchaseReceiptPda } from '../pdas';
import type { Metaplex } from '@metaplex-foundation/js';

import {
  useOperation,
  Operation,
  OperationHandler,
} from '@metaplex-foundation/js';
import { DisposableScope } from '@metaplex-foundation/js';

// -----------------
// Operation
// -----------------

const Key = 'FindPurchaseByTradeStateOperation' as const;

/**
 * @group Operations
 * @category Constructors
 */
export const findPurchaseByTradeStateOperation =
  useOperation<FindPurchaseByTradeStateOperation>(Key);

/**
 * @group Operations
 * @category Types
 */
export type FindPurchaseByTradeStateOperation = Operation<
  typeof Key,
  FindPurchaseByTradeStateInput,
  Purchase
>;

/**
 * @group Operations
 * @category Inputs
 */
export type FindPurchaseByTradeStateInput = {
  sellerTradeState: PublicKey;
  buyerTradeState: PublicKey;
  auctionHouse: AuctionHouse;
  loadJsonMetadata?: boolean; // Default: true
  commitment?: Commitment;
};

/**
 * @group Operations
 * @category Handlers
 */
export const findPurchaseByTradeStateOperationHandler: OperationHandler<FindPurchaseByTradeStateOperation> =
  {
    handle: async (
      operation: FindPurchaseByTradeStateOperation,
      metaplex: Metaplex,
      scope: DisposableScope
    ) => {
      const { sellerTradeState, buyerTradeState } = operation.input;

      const receiptAddress = findPurchaseReceiptPda(
        sellerTradeState,
        buyerTradeState
      );

      return metaplex
        .auctionHouse()
        .findPurchaseByReceipt({ receiptAddress, ...operation.input })
        .run(scope);
    },
  };

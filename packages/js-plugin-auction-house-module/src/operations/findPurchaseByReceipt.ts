import type { Commitment, PublicKey } from '@solana/web3.js';
import { toPurchaseReceiptAccount } from '../accounts';
import { AuctionHouse, Purchase, toLazyPurchase } from '../models';
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

const Key = 'FindPurchaseByReceiptOperation' as const;

/**
 * @group Operations
 * @category Constructors
 */
export const findPurchaseByReceiptOperation =
  useOperation<FindPurchaseByReceiptOperation>(Key);

/**
 * @group Operations
 * @category Types
 */
export type FindPurchaseByReceiptOperation = Operation<
  typeof Key,
  FindPurchaseByReceiptInput,
  Purchase
>;

/**
 * @group Operations
 * @category Inputs
 */
export type FindPurchaseByReceiptInput = {
  receiptAddress: PublicKey;
  auctionHouse: AuctionHouse;
  loadJsonMetadata?: boolean; // Default: true

  /** The level of commitment desired when querying the blockchain. */
  commitment?: Commitment;
};

/**
 * @group Operations
 * @category Handlers
 */
export const findPurchaseByReceiptOperationHandler: OperationHandler<FindPurchaseByReceiptOperation> =
  {
    handle: async (
      operation: FindPurchaseByReceiptOperation,
      metaplex: Metaplex,
      scope: DisposableScope
    ) => {
      const { receiptAddress, auctionHouse, commitment } = operation.input;

      const account = toPurchaseReceiptAccount(
        await metaplex.rpc().getAccount(receiptAddress, commitment)
      );
      scope.throwIfCanceled();

      const lazyPurchase = toLazyPurchase(account, auctionHouse);
      return metaplex
        .auctionHouse()
        .loadPurchase({ lazyPurchase, ...operation.input })
        .run(scope);
    },
  };

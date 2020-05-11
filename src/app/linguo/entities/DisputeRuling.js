import Enum from './utils/Enum';

/**
 * Dispute Ruling.
 *
 * Includes the representation from the smart contract,
 * plus a UI-only None status.
 *
 * @readonly
 * @enum {number}
 */
const DisputeRuling = Enum(
  'DisputeRuling',
  {
    None: undefined,
    RefuseToRule: 0,
    TranslationApproved: 1,
    TranslationRejected: 2,
  },
  {
    parseValue: v => (v === undefined ? v : Number.parseInt(v, 10)),
  }
);

export default DisputeRuling;

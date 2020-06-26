import { ADDRESS_ZERO } from './constants';
import { createEthContractApi, createTokenContractApi } from './createContractApi';

export default function createApiFacade({ web3, withEtherPayments, withTokenPayments }) {
  const linguoEtherAddress = withEtherPayments.linguo?.options.address;
  const linguoTokenAddress = withTokenPayments.linguo?.options.address;

  const interfaces = {
    [linguoEtherAddress]: createEthContractApi({ web3, ...withEtherPayments }),
    [linguoTokenAddress]: createTokenContractApi({ web3, ...withTokenPayments }),
  };

  const fullApi = {
    getRequesterTasks() {},
    getTranslatorTasks() {},
    getTaskById() {},
    getTaskPrice() {},
    getTranslatorDeposit() {},
    getChallengerDeposit() {},
    getTaskDispute() {},
    createTask() {},
    assignTask() {},
    submitTranslation() {},
    approveTranslation() {},
    reimburseRequester() {},
    acceptTranslation() {},
    challengeTranslation() {},
    fundAppeal() {},
  };

  const propHandler = {
    get: (target, prop) => {
      if (target[prop]) {
        if (['getRequesterTasks', 'getTranslatorTasks'].includes(prop)) {
          return new Proxy(target[prop], callBothIfMissingIDOrToken);
        }

        return new Proxy(target[prop], callDefaultIfMissingIDOrToken);
      }
    },
  };

  const callDefaultIfMissingIDOrToken = {
    apply: (target, thisArg, args) => {
      const { name } = target;
      const ID = args?.[0]?.ID;

      if (!ID) {
        const token = args?.[0]?.token ?? ADDRESS_ZERO;
        const contract = token === ADDRESS_ZERO ? linguoEtherAddress : linguoTokenAddress;

        const [first, ...rest] = args;
        const actualArgs = [
          {
            ...first,
            token,
            contract,
          },
          ...rest,
        ];

        const actualInterface = interfaces[contract];
        return actualInterface[name].apply(actualInterface, actualArgs);
      }

      const [contract, internalID] = String(ID).includes('/') ? String(ID).split('/') : [linguoEtherAddress, ID];

      const [first, ...rest] = args;
      const actualArgs = [
        {
          ...first,
          ID: internalID,
        },
        ...rest,
      ];

      const actualInterface = interfaces[contract];
      return actualInterface[name].apply(actualInterface, actualArgs);
    },
  };

  const callBothIfMissingIDOrToken = {
    apply: async (target, thisArg, args) => {
      const { name } = target;
      const token = args?.[0]?.token;

      if (token) {
        const contract = token === 'ETH' ? linguoEtherAddress : linguoTokenAddress;

        const actualInterface = interfaces[contract];
        return actualInterface[name].apply(actualInterface, args);
      }

      const data = await Promise.all(
        Object.values(interfaces).map(actualInterface => actualInterface[name].apply(actualInterface, args))
      );

      return data.flat();
    },
  };

  return new Proxy(fullApi, propHandler);
}

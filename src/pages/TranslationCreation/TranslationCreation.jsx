import React from 'react';
import styled from 'styled-components';
import { useWeb3React } from '~/app/web3React';
import SingleCardLayout from '~/pages/layouts/SingleCardLayout';
import MissingWalletWarning from '~/components/MissingWalletWarning';
import TranslationCreationForm from './Form';

const StyledOverlayWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledOverlay = styled.div`
  display: ${props => (props.visible ? 'block' : 'none')};
  background-color: ${props => props.theme.hexToRgba('#fff', 0.5)};
  cursor: not-allowed;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
`;

const StyledContentWrapper = styled.div`
  filter: ${props => (props.disabled ? 'blur(1px)' : 'none')};
`;

function TranslationCreation() {
  const { account } = useWeb3React();
  const formBlocked = !account;

  return (
    <SingleCardLayout title="New Translation">
      <MissingWalletWarning message="To request a translation you need an Ethereum wallet." />
      <StyledOverlayWrapper>
        <StyledContentWrapper disabled={formBlocked}>
          <TranslationCreationForm />
        </StyledContentWrapper>
        <StyledOverlay visible={formBlocked} />
      </StyledOverlayWrapper>
    </SingleCardLayout>
  );
}

export default TranslationCreation;

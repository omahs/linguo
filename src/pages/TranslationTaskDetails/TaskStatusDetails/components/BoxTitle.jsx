import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography } from 'antd';

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: 500;
    color: ${props => props.theme.color.primary.default};
  }
`;

function BoxTitle({ children, className }) {
  return (
    <StyledTitle level={3} className={className}>
      {children}
    </StyledTitle>
  );
}

BoxTitle.propTypes = {
  children: t.node,
  className: t.string,
};

BoxTitle.defaultProps = {
  children: null,
  className: '',
};

export default BoxTitle;
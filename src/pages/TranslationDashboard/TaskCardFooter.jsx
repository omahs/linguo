import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as r from '~/app/routes';
import { useWeb3React } from '~/app/web3React';
import { useLinguo, filters, Task, TaskStatus } from '~/api/linguo';
import wrapWithNotification from '~/utils/wrapWithNotification';
import Button from '~/components/Button';
import RemainingTime from '~/components/RemainingTime';
import useFilter from './useFilter';

const withNotification = wrapWithNotification({
  successMessage: 'Reimbursement requested with success!',
  errorMessage: 'Failed to request the reimbursement!',
});

function RequestReimbursementButton({ ID, ...props }) {
  const { library: web3, chainId, account } = useWeb3React();
  const linguo = useLinguo({ web3, chainId });

  const [isLoading, setIsLoading] = React.useState(false);
  const [_, setFilter] = useFilter();

  const handleClick = React.useCallback(
    withNotification(async () => {
      setIsLoading(true);
      try {
        await linguo.api.requestReimbursement({ ID }, { from: account });
        setFilter(filters.incomplete, { refresh: true });
      } finally {
        setIsLoading(false);
      }
    }, [linguo.api, ID, account])
  );

  return (
    <Button
      fullWidth
      variant="outlined"
      {...props}
      onClick={handleClick}
      disabled={isLoading}
      icon={isLoading ? <LoadingOutlined /> : null}
    >
      Reimburse Me
    </Button>
  );
}

RequestReimbursementButton.propTypes = {
  ID: t.number.isRequired,
};

const StyledTaskDeadline = styled.div`
  text-align: center;
  font-weight: 700;
  line-height: 1.33;

  &.ending-soon {
    color: ${props => props.theme.danger.default};
  }

  .title {
    font-size: ${props => props.theme.fontSize.sm};
    margin-bottom: -0.25rem;
  }

  .value {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const StyledCallToAction = styled.div`
  text-align: center;

  .headline {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 700;
  }

  .text {
    font-size: ${props => props.theme.fontSize.xs};
    font-weight: 400;
    color: ${props => props.theme.text.light};
  }
`;

function TaskFooterInfo(task) {
  const { ID, status } = task;

  const TaskFooterInfoPending = () => {
    if (Task.isIncomplete(task)) {
      return <RequestReimbursementButton ID={ID} />;
    }

    const currentDate = new Date();
    const timeout = Task.remainingTimeForSubmission(task, { currentDate });

    return (
      <RemainingTime
        initialValueSeconds={timeout}
        render={({ formattedValue, endingSoon }) => (
          <StyledTaskDeadline className={clsx({ 'ending-soon': endingSoon })}>
            <div className="title">Deadline</div>
            <div className="value">{formattedValue}</div>
          </StyledTaskDeadline>
        )}
      />
    );
  };

  const TaskFooterInfoAwaitingReview = () => {
    const currentDate = new Date();
    const timeout = Task.remainingTimeForReview(task, { currentDate });

    return timeout > 0 ? (
      <RemainingTime
        initialValueSeconds={timeout}
        render={({ formattedValue, endingSoon }) => (
          <StyledTaskDeadline className={clsx({ 'ending-soon': endingSoon })}>
            <div className="title">Deadline</div>
            <div className="value">{formattedValue}</div>
          </StyledTaskDeadline>
        )}
      />
    ) : (
      <StyledCallToAction>
        <div className="headline">Review time is over!</div>
        <div className="text">See details to proceed.</div>
      </StyledCallToAction>
    );
  };

  const taskFooterInfoByStatusMap = {
    [TaskStatus.Created]: TaskFooterInfoPending,
    [TaskStatus.Assigned]: TaskFooterInfoPending,
    [TaskStatus.AwaitingReview]: TaskFooterInfoAwaitingReview,
    [TaskStatus.DisputeCreated]: () => null,
    [TaskStatus.Resolved]: () => null,
  };

  const Component = taskFooterInfoByStatusMap[status];
  return <Component />;
}

const getTaskDetailsRoute = r.withParamSubtitution(r.TRANSLATION_TASK_DETAILS);

function TaskCardFooter(task) {
  const { ID } = task;

  return (
    <Row gutter={30} align="middle">
      <Col span={12}>
        {/* <TaskDeadline {...task} /> */}
        <TaskFooterInfo {...task} />
      </Col>
      <Col span={12}>
        <Link to={getTaskDetailsRoute({ id: ID })}>
          <Button fullWidth variant="filled" color="primary">
            See details
          </Button>
        </Link>
      </Col>
    </Row>
  );
}

TaskCardFooter.propTypes = {
  ID: t.number.isRequired,
};

export default TaskCardFooter;

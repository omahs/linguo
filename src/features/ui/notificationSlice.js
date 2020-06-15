import { createSlice, createAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { eventChannel, END } from 'redux-saga';
import { call, put, take, cancelled } from 'redux-saga/effects';
import { nanoid } from 'nanoid';
import createWatchSaga from '~/features/shared/createWatchSaga';

export const NotificationLevel = {
  info: 'info',
  warn: 'warn',
  error: 'error',
  success: 'success',
};

export const notify = createAction(
  'ui/notification/notify',
  ({ key = nanoid(10), duration = 10, placement = 'bottomRight', level = 'info', ...rest }) => ({
    payload: {
      key,
      duration,
      placement,
      level,
      ...rest,
    },
  })
);
export const close = createAction('ui/notification/close');

const notificationSlice = createSlice({
  name: 'ui/notification',
  initialState: {},
  extraReducers: {
    [notify]: (state, action) => {
      const { key } = action.payload;
      state[key] = key;
    },
    [close]: (state, action) => {
      const { key } = action.payload;
      delete state[key];
    },
  },
});

export default notificationSlice.reducer;

const createNotificationChannel = ({ method, key, ...params }) =>
  eventChannel(emit => {
    const onClose = () => emit(END);

    notification[method]({
      ...params,
      key,
      onClose,
    });

    return () => notification.close(key);
  });

export function* notifySaga(action) {
  const { key, level, ...rest } = action.payload;
  const method = NotificationLevel[level] ?? 'info';

  const chan = yield call(createNotificationChannel, {
    method,
    key,
    ...rest,
  });

  try {
    yield take(chan);
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
    yield put(close({ key }));
  }
}

export function* closeSaga(action) {
  const { key } = action.payload;

  yield call([notification, 'close'], key);
}

export const sagas = {
  watchNotifiySaga: createWatchSaga(notifySaga, notify),
  watchCloseSaga: createWatchSaga(closeSaga, close),
};

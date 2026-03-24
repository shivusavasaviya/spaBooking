import React from 'react';
import { TIME_SLOTS, ROW_HEIGHT } from '../../utils/constants';

const TimeGrid = () => (
  <div style={{
    width: 72,
    flexShrink: 0,
    borderRight: '1px solid #e5e7eb',
    background: '#fafafa',
    overflowY: 'hidden',
  }}>
    {TIME_SLOTS.map((time, i) => {
      const isHour = i % 2 === 0;  // Every 2 slots = 1 hour (30-min slots)
      return (
        <div key={time} style={{
          height: ROW_HEIGHT,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 2,
          borderBottom: `1px solid ${isHour ? '#ebebeb' : '#f7f7f7'}`,
          fontSize: 10,
          fontWeight: isHour ? 600 : 400,
          color: isHour ? '#6b7280' : 'transparent',
          userSelect: 'none',
        }}>
          {isHour ? time : ''}
        </div>
      );
    })}
  </div>
);

export default TimeGrid;

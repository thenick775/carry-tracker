import { Timeline, Text } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import dayjs from 'dayjs';
import { useEffect, useRef } from 'react';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useActiveRotations, type Rotation } from '../hooks/use-rotations.ts';

type TimelineNode = {
  carryItemIdentifier?: {
    id: string;
    name: string;
  };
  itemStartedAt: dayjs.Dayjs;
  rotationName: string;
};

const HEIGHT_ESTIMATE = 100;

const generateTimelineNodesForDay = (
  rotations: Rotation[],
  carryItemIdentifiers: { id: string; name: string }[],
  day: dayjs.Dayjs
): TimelineNode[] => {
  const nodes: TimelineNode[] = [];

  for (const rotation of rotations) {
    const start = day.startOf('day');
    const end = day.endOf('day');

    const rotationStart = dayjs(rotation.activeAt);
    if (end.isBefore(rotationStart)) continue;

    const { duration, unit } = rotation.stepDuration;
    const rotationLength = rotation.orderedCarryItemIds.length;

    let idx = 0;
    let current = rotationStart;

    while (current.isBefore(end)) {
      const carryItemId = rotation.orderedCarryItemIds[idx % rotationLength];
      const carryItemIdentifier = carryItemIdentifiers.find(
        ({ id }) => id === carryItemId
      );

      if (current.isBetween(start, end, null, '[)'))
        nodes.push({
          rotationName: rotation.name,
          carryItemIdentifier,
          itemStartedAt: current
        });

      idx++;
      current = rotationStart.add(idx * duration, unit);
    }
  }

  return nodes.sort((a, b) => a.itemStartedAt.diff(b.itemStartedAt));
};

export const TimelineView = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeRotations = useActiveRotations();
  const { carryItems } = useCarryItems();

  const startDate = activeRotations
    ?.map((r) => dayjs(r.activeAt))
    .sort((a, b) => a.diff(b))[0];

  const carryItemIdentifiers =
    carryItems?.map(({ id, name }) => ({ id, name })) ?? [];

  const todayIndex =
    dayjs().startOf('day').diff(startDate?.startOf('day'), 'day') + 1;

  const virtualizer = useVirtualizer({
    count: todayIndex + 365,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => HEIGHT_ESTIMATE,
    overscan: 10
  });

  useEffect(() => {
    if (virtualizer)
      virtualizer.scrollToIndex(todayIndex + 1, { align: 'start' });
  }, [todayIndex, virtualizer]);

  return (
    <ResponsiveScrollArea viewportRef={scrollRef}>
      <Timeline active={todayIndex} bulletSize={24} lineWidth={2}>
        <div style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }} />

        {virtualizer.getVirtualItems().map((v) => {
          const date = startDate?.add(v.index, 'day');
          const dayKey = date?.format('YYYY-MM-DD');
          const now = dayjs();

          if (!date) return null;

          const items = generateTimelineNodesForDay(
            activeRotations ?? [],
            carryItemIdentifiers,
            date
          );

          return (
            <Timeline.Item
              key={dayKey}
              data-index={v.index}
              ref={virtualizer.measureElement}
              title={date.format('dddd, MMM D, YYYY')}
              lineVariant={date.endOf('day').isBefore(now) ? 'solid' : 'dotted'}
            >
              {items.map((item) => (
                <Text key={item.itemStartedAt.toISOString()}>
                  <Text span size="sm">
                    {item.itemStartedAt.format('h:mm A')} –{' '}
                  </Text>
                  <Text span>{item.carryItemIdentifier?.name}</Text>{' '}
                  <Text c="dimmed" span>
                    {item.rotationName}
                  </Text>
                </Text>
              ))}
            </Timeline.Item>
          );
        })}

        <div
          style={{
            height:
              virtualizer.getTotalSize() -
              (virtualizer.getVirtualItems().at(-1)?.end ?? 0)
          }}
        />
      </Timeline>
    </ResponsiveScrollArea>
  );
};

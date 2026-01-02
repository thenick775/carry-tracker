import { Timeline, Text } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';

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

const HEIGHT_ESTIMATE = 50;

const estimateSize = () => HEIGHT_ESTIMATE;

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

  const startDate = useMemo(
    () =>
      activeRotations
        ?.map((r) => dayjs(r.activeAt))
        .sort((a, b) => a.diff(b))[0],
    [activeRotations]
  );

  const carryItemIdentifiers =
    carryItems?.map(({ id, name }) => ({ id, name })) ?? [];

  const todayIndex = useMemo(
    () => dayjs().startOf('day').diff(startDate?.startOf('day'), 'day'),
    [startDate]
  );

  const virtualizer = useVirtualizer({
    count: todayIndex + 365,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    overscan: 10,
    // see: https://github.com/TanStack/virtual/issues/659
    measureElement: (element, _entry, instance) => {
      const direction = instance.scrollDirection;
      if (direction === 'forward' || direction === null) {
        // Allow remeasuring when scrolling down or direction is null
        return element.getBoundingClientRect().height;
      } else {
        // When scrolling up, use cached measurement to prevent stuttering
        const indexKey = Number(element.getAttribute('data-index'));
        const cachedMeasurement = instance.measurementsCache[indexKey]?.size;
        return cachedMeasurement || element.getBoundingClientRect().height;
      }
    }
  });

  const isLoading = activeRotations === undefined || carryItems === undefined;

  const virtualItems = virtualizer.getVirtualItems();

  const shouldRenderTimeline = !isLoading && virtualItems.length > 0;

  useEffect(() => {
    if (shouldRenderTimeline && todayIndex > 4)
      virtualizer.scrollToIndex(todayIndex, { align: 'start' });
  }, [shouldRenderTimeline, todayIndex, virtualizer]);

  const virtualNumActive =
    virtualItems.reduce((acc, v) => {
      return v.index <= todayIndex ? acc + 1 : acc;
    }, 0) - 1;

  return (
    <ResponsiveScrollArea viewportRef={scrollRef}>
      <AnimatePresence>
        {shouldRenderTimeline && (
          <motion.div
            key="items"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'relative',
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%'
            }}
          >
            <Timeline active={virtualNumActive} bulletSize={24} lineWidth={2}>
              {virtualItems.map((v) => {
                const date = startDate?.add(v.index, 'day');
                const dayKey = date?.format('YYYY-MM-DD');

                if (!date) return null;

                const items = generateTimelineNodesForDay(
                  activeRotations,
                  carryItemIdentifiers,
                  date
                );

                const showDottedLine = v.index >= todayIndex;

                return (
                  <Timeline.Item
                    key={dayKey}
                    data-index={v.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '1em',
                      width: '100%',
                      transform: `translateY(${v.start}px)`,
                      willChange: 'transform',
                      paddingBottom: 35
                    }}
                    ref={virtualizer.measureElement}
                    title={date.format('dddd, MMM D, YYYY')}
                    lineVariant={showDottedLine ? 'dotted' : 'solid'}
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
            </Timeline>
          </motion.div>
        )}
      </AnimatePresence>
    </ResponsiveScrollArea>
  );
};

import { Timeline, Text } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';

import { ResponsiveScrollArea } from './common/responsive-scroll-area.tsx';
import { NoTimeline } from './timeline/no-timeline.tsx';
import { useCarryItems } from '../hooks/use-carry-items.ts';
import { useActiveRotations, type Rotation } from '../hooks/use-rotations.ts';
import { TimelineSkeleton } from './timeline/timeline-skeleton.tsx';

type TimelineContentProps = {
  carryItemIdentifiers: { id: string; name: string }[];
  startDate: dayjs.Dayjs;
  timelineRotations: Rotation[];
  todayIndex: number;
};

type TimelineNode = {
  carryItemIdentifier?: {
    id: string;
    name: string;
  };
  itemStartedAt: dayjs.Dayjs;
  rotationName: string;
};

const TIMELINE_DAY_BASE_HEIGHT = 56;
const TIMELINE_DAY_ITEM_HEIGHT = 22;

const getFirstTimelineOccurrenceForDay = (
  rotation: Rotation,
  day: dayjs.Dayjs
): { index: number; itemStartedAt: dayjs.Dayjs } | null => {
  const dayStart = day.startOf('day');
  const dayEnd = dayStart.add(1, 'day');
  const rotationStart = dayjs(rotation.activeAt);
  const { duration, unit } = rotation.stepDuration;

  if (!rotationStart.isBefore(dayEnd)) {
    return null;
  }

  const index = Math.max(
    0,
    Math.ceil(dayStart.diff(rotationStart, unit, true) / duration)
  );
  const itemStartedAt = rotationStart.add(index * duration, unit);

  return itemStartedAt.isBefore(dayEnd) ? { index, itemStartedAt } : null;
};

const countTimelineNodesForDay = (rotations: Rotation[], day: dayjs.Dayjs) => {
  const dayEnd = day.startOf('day').add(1, 'day');

  return rotations.reduce((count, rotation) => {
    const firstOccurrence = getFirstTimelineOccurrenceForDay(rotation, day);

    if (!firstOccurrence) {
      return count;
    }

    const { duration, unit } = rotation.stepDuration;

    return (
      count +
      Math.max(
        0,
        // Partial intervals still occupy a node in the current day.
        Math.ceil(
          dayEnd.diff(firstOccurrence.itemStartedAt, unit, true) / duration
        )
      )
    );
  }, 0);
};

const estimateTimelineDaySize = (
  rotations: Rotation[],
  startDate: dayjs.Dayjs | undefined,
  index: number
) => {
  if (!startDate) {
    return TIMELINE_DAY_BASE_HEIGHT;
  }

  const day = startDate.add(index, 'day');
  const nodeCount = countTimelineNodesForDay(rotations, day);

  return TIMELINE_DAY_BASE_HEIGHT + nodeCount * TIMELINE_DAY_ITEM_HEIGHT;
};

const getInitialTimelineOffset = (
  rotations: Rotation[],
  startDate: dayjs.Dayjs | undefined,
  todayIndex: number
) => {
  if (todayIndex <= 4) {
    return 0;
  }

  return Array.from({ length: todayIndex }, (_, index) =>
    estimateTimelineDaySize(rotations, startDate, index)
  ).reduce((total, size) => total + size, 0);
};

const generateTimelineNodesForDay = (
  rotations: Rotation[],
  carryItemIdentifiers: { id: string; name: string }[],
  day: dayjs.Dayjs
): TimelineNode[] => {
  const dayEnd = day.startOf('day').add(1, 'day');

  return rotations
    .flatMap((rotation) => {
      const firstOccurrence = getFirstTimelineOccurrenceForDay(rotation, day);

      if (!firstOccurrence) {
        return [];
      }

      const { duration, unit } = rotation.stepDuration;
      const rotationLength = rotation.orderedCarryItemIds.length;
      const occurrenceCount = Math.max(
        0,
        Math.ceil(
          dayEnd.diff(firstOccurrence.itemStartedAt, unit, true) / duration
        )
      );

      return Array.from({ length: occurrenceCount }, (_, offset) => {
        const occurrenceIndex = firstOccurrence.index + offset;
        const carryItemId =
          rotation.orderedCarryItemIds[occurrenceIndex % rotationLength];
        const carryItemIdentifier = carryItemIdentifiers.find(
          ({ id }) => id === carryItemId
        );

        return {
          rotationName: rotation.name,
          carryItemIdentifier,
          itemStartedAt: firstOccurrence.itemStartedAt.add(
            offset * duration,
            unit
          )
        };
      });
    })
    .sort((a, b) => a.itemStartedAt.diff(b.itemStartedAt));
};

const TimelineContent = ({
  carryItemIdentifiers,
  startDate,
  timelineRotations,
  todayIndex
}: TimelineContentProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library -- opting out since this will be ignored by react compiler, and seems fine for now
  const virtualizer = useVirtualizer({
    count: todayIndex + 365,
    getScrollElement: () => scrollRef.current,
    initialOffset: getInitialTimelineOffset(
      timelineRotations,
      startDate,
      todayIndex
    ),
    estimateSize: (index) =>
      estimateTimelineDaySize(timelineRotations, startDate, index),
    overscan: 10,
    // see: https://github.com/TanStack/virtual/issues/659
    measureElement: (element, _entry, instance) => {
      const direction = instance.scrollDirection;
      if (direction === 'forward' || direction === null) {
        // Allow remeasuring when scrolling down or direction is null
        return element.getBoundingClientRect().height;
      }
      // When scrolling up, use cached measurement to prevent stuttering
      const indexKey = Number(element.getAttribute('data-index'));
      const cachedMeasurement = instance.measurementsCache[indexKey]?.size;
      return cachedMeasurement || element.getBoundingClientRect().height;
    }
  });

  const virtualItems = virtualizer.getVirtualItems();
  const virtualNumActive =
    virtualItems.reduce((acc, v) => {
      return v.index <= todayIndex ? acc + 1 : acc;
    }, 0) - 1;

  return (
    <ResponsiveScrollArea viewportRef={scrollRef}>
      <AnimatePresence>
<<<<<<< HEAD
        {virtualItems.length > 0 && (
=======
        {isLoading && <TimelineSkeleton />}
        {hasNoTimeline && <NoTimeline />}
        {shouldRenderTimeline && (
>>>>>>> ff91d1a (chore: rename files, split timeline skeleton to new file)
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
                const date = startDate.add(v.index, 'day');
                const dayKey = date.format('YYYY-MM-DD');
                const items = generateTimelineNodesForDay(
                  timelineRotations,
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
                      left: '1em',
                      marginTop: 0,
                      right: 0,
                      transform: `translateY(${v.start}px)`,
                      willChange: 'transform',
                      paddingBottom: 35
                    }}
                    ref={virtualizer.measureElement}
                    title={date.format('dddd, MMM D, YYYY')}
                    lineVariant={showDottedLine ? 'dotted' : 'solid'}
                  >
                    {items.map((item) => (
                      <Text
                        key={item.itemStartedAt.toISOString()}
                        textWrap="nowrap"
                        truncate="end"
                      >
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

export const TimelineView = () => {
  const activeRotations = useActiveRotations();
  const { carryItems } = useCarryItems();

  const startDate = activeRotations
    ?.map((r) => dayjs(r.activeAt))
    .sort((a, b) => a.diff(b))[0];

  const carryItemIdentifiers = carryItems?.map(({ id, name }) => ({
    id,
    name
  }));

  const todayIndex = dayjs()
    .startOf('day')
    .diff(startDate?.startOf('day'), 'day');

  const isLoading = activeRotations === undefined || carryItems === undefined;
  const hasNoTimeline = !isLoading && !startDate;
  const hasRotationsAndIdentifiers =
    activeRotations &&
    activeRotations.length > 0 &&
    startDate &&
    carryItemIdentifiers;

  return (
    <>
      {isLoading && <TimelineViewSkeleton />}
      {hasNoTimeline && <NoTimeline />}
      {!isLoading && hasRotationsAndIdentifiers && (
        <TimelineContent
          carryItemIdentifiers={carryItemIdentifiers}
          startDate={startDate}
          timelineRotations={activeRotations}
          todayIndex={todayIndex}
        />
      )}
    </>
  );
};

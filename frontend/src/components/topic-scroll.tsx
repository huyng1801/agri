'use client';

import { useRef, type PointerEvent, type ReactNode, type WheelEvent } from 'react';
import { cn } from './ui';

type TopicScrollProps = {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
};

export function TopicScroll({ children, className, 'aria-label': ariaLabel }: TopicScrollProps) {
  const ref = useRef<HTMLElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !ref.current) return;
    drag.current = { active: true, startX: event.clientX, startScroll: ref.current.scrollLeft };
    ref.current.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!drag.current.active || !ref.current) return;
    ref.current.scrollLeft = drag.current.startScroll - (event.clientX - drag.current.startX);
  }

  function stopDragging(event: PointerEvent<HTMLElement>) {
    if (!drag.current.active || !ref.current) return;
    drag.current.active = false;
    if (ref.current.hasPointerCapture(event.pointerId)) ref.current.releasePointerCapture(event.pointerId);
  }

  function handleWheel(event: WheelEvent<HTMLElement>) {
    if (!ref.current || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    ref.current.scrollLeft += event.deltaY;
  }

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn('topic-scroll', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onWheel={handleWheel}
    >
      {children}
    </nav>
  );
}

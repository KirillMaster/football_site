'use client';

import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { reachGoal } from '@/lib/analytics';
import DonateModal from './DonateModal';

export default function DonateButton({
  place,
  className,
  children,
  onOpen,
}: {
  place: string;
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reachGoal('donate_click', { place });
          onOpen?.();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>
      {open && createPortal(<DonateModal onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

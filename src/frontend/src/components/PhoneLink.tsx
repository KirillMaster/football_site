'use client';

import type { ReactNode } from 'react';
import { reachGoal } from '@/lib/analytics';

export type PhonePlace = 'header' | 'contacts' | 'footer' | 'other';

interface PhoneLinkProps {
  phone: string;
  place: PhonePlace;
  className?: string;
  children?: ReactNode;
}

export default function PhoneLink({ phone, place, className, children }: PhoneLinkProps) {
  return (
    <a
      href={`tel:${phone.replace(/[^+\d]/g, '')}`}
      className={className}
      onClick={() => reachGoal('phone_click', { place })}
    >
      {children ?? phone}
    </a>
  );
}

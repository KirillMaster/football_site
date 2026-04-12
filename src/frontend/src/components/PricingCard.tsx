import Link from 'next/link';
import type { PricingPlan } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  plan: PricingPlan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <article
      className={cn(
        'relative rounded-2xl p-8 flex flex-col',
        plan.isPopular
          ? 'bg-brand-blue text-white shadow-2xl scale-105'
          : 'bg-white border-2 border-gray-200 shadow-md'
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-brand-red text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
            Популярный
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3
          className={cn(
            'text-xl font-bold mb-2',
            plan.isPopular ? 'text-white' : 'text-brand-blue'
          )}
        >
          {plan.name}
        </h3>
        <div className="flex items-end gap-1">
          <span
            className={cn(
              'text-4xl font-black',
              plan.isPopular ? 'text-white' : 'text-brand-red'
            )}
          >
            {formatPrice(plan.priceRub)}
          </span>
          <span
            className={cn(
              'text-sm mb-1',
              plan.isPopular ? 'text-blue-300' : 'text-gray-500'
            )}
          >
            /мес
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <svg
              className={cn(
                'w-5 h-5 mt-0.5 flex-shrink-0',
                plan.isPopular ? 'text-green-400' : 'text-green-500'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span
              className={cn(
                'text-sm',
                plan.isPopular ? 'text-blue-100' : 'text-gray-600'
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/zapísatsya"
        className={cn(
          'block text-center font-semibold py-3 px-6 rounded-lg transition-colors',
          plan.isPopular
            ? 'bg-brand-red hover:bg-red-700 text-white'
            : 'bg-brand-blue hover:bg-blue-900 text-white'
        )}
      >
        Записаться
      </Link>
    </article>
  );
}

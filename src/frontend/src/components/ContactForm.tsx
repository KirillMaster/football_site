'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { submitContactMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Введите ваше имя').max(100),
  phone: z.string().regex(/^[\d\s\+\-\(\)]{7,20}$/, 'Введите корректный номер'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  message: z.string().min(10, 'Сообщение слишком короткое').max(1000),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const ok = await submitContactMessage({
      name: data.name,
      phone: data.phone,
      email: data.email ?? '',
      message: data.message,
    });
    if (ok) {
      setSuccess(true);
      reset();
    } else {
      setServerError('Ошибка отправки. Пожалуйста, позвоните нам.');
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-gray-800">Сообщение отправлено!</p>
        <p className="text-sm text-gray-500 mt-1">Мы ответим вам в ближайшее время.</p>
        <button onClick={() => setSuccess(false)} className="mt-3 text-brand-red text-sm hover:underline">
          Написать снова
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
          Имя *
        </label>
        <input
          id="contact-name"
          type="text"
          {...register('name')}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
            errors.name ? 'border-red-500' : 'border-gray-300'
          )}
          placeholder="Ваше имя"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
          Телефон *
        </label>
        <input
          id="contact-phone"
          type="tel"
          {...register('phone')}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
            errors.phone ? 'border-red-500' : 'border-gray-300'
          )}
          placeholder="+7-978-000-00-00"
        />
        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email (необязательно)
        </label>
        <input
          id="contact-email"
          type="email"
          {...register('email')}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
            errors.email ? 'border-red-500' : 'border-gray-300'
          )}
          placeholder="email@example.com"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
          Сообщение *
        </label>
        <textarea
          id="contact-message"
          rows={4}
          {...register('message')}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none',
            errors.message ? 'border-red-500' : 'border-gray-300'
          )}
          placeholder="Ваш вопрос или сообщение..."
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      {serverError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary py-3 disabled:opacity-60"
      >
        {isSubmitting ? 'Отправляем...' : 'Отправить сообщение'}
      </button>
    </form>
  );
}

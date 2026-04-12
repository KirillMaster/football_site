'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { submitTryoutRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  childName: z.string().min(2, 'Введите имя ребёнка').max(100),
  age: z
    .number({ invalid_type_error: 'Введите возраст' })
    .min(5, 'Минимальный возраст: 5 лет')
    .max(17, 'Максимальный возраст: 17 лет'),
  parentName: z.string().min(2, 'Введите ваше имя').max(100),
  phone: z.string().regex(/^[\d\s\+\-\(\)]{7,20}$/, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  message: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export default function TryoutForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const ok = await submitTryoutRequest({
      childName: data.childName,
      age: data.age,
      parentName: data.parentName,
      phone: data.phone,
      email: data.email ?? '',
      message: data.message,
    });
    if (ok) {
      setSuccess(true);
      reset();
    } else {
      setServerError('Произошла ошибка. Пожалуйста, позвоните нам напрямую.');
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка отправлена!</h3>
        <p className="text-gray-600">Мы свяжемся с вами в ближайшее время для подтверждения записи.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-brand-red hover:underline text-sm"
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
            Имя ребёнка *
          </label>
          <input
            id="childName"
            type="text"
            {...register('childName')}
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
              errors.childName ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="Иван Иванов"
          />
          {errors.childName && (
            <p className="mt-1 text-xs text-red-600">{errors.childName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Возраст ребёнка *
          </label>
          <input
            id="age"
            type="number"
            min={5}
            max={17}
            {...register('age', { valueAsNumber: true })}
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
              errors.age ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="10"
          />
          {errors.age && (
            <p className="mt-1 text-xs text-red-600">{errors.age.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
          Ваше имя (родитель/опекун) *
        </label>
        <input
          id="parentName"
          type="text"
          {...register('parentName')}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
            errors.parentName ? 'border-red-500' : 'border-gray-300'
          )}
          placeholder="Мария Иванова"
        />
        {errors.parentName && (
          <p className="mt-1 text-xs text-red-600">{errors.parentName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Телефон *
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
              errors.phone ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="+7-978-000-00-00"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email (необязательно)
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red',
              errors.email ? 'border-red-500' : 'border-gray-300'
            )}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Комментарий (необязательно)
        </label>
        <textarea
          id="message"
          rows={3}
          {...register('message')}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
          placeholder="Например, интересующая группа или вопросы..."
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Отправляем...' : 'Записаться на пробное занятие'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Нажимая «Записаться», вы соглашаетесь с обработкой персональных данных.
      </p>
    </form>
  );
}

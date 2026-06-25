'use client';

import React from 'react';

interface BigButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}

const VARIANTS = {
  primary: 'bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white shadow-lg',
  secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 border-2 border-gray-200 shadow-md',
  ghost: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-lg',
};

export default function BigButton({
  onClick,
  disabled,
  loading,
  variant = 'primary',
  icon,
  children,
  className = '',
  type = 'button',
  fullWidth = true,
}: BigButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${VARIANTS[variant]}
        ${fullWidth ? 'w-full' : ''}
        flex items-center justify-center gap-3
        px-6 py-4 rounded-2xl
        text-base font-semibold
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        select-none
        ${className}
      `}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="text-xl">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}

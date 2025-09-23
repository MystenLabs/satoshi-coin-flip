import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'contained' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    children: string | React.ReactNode;
    className?: string;
}

const buttonVariantClasses = {
    contained: 'bg-white hover:bg-gray-100 text-black',
    contained_disabled: 'bg-gray-200 text-gray-400',
    outlined: 'border border-primary hover:border-light text-white hover:text-white',
    outlined_disabled: 'border border-gray-200 text-gray-400',
    text: 'text-primary hover:text-light',
    text_disabled: 'text-gray-400',
};

const buttonSizeClasses = {
    small: 'py-2 px-4 text-md',
    medium: 'py-2 px-4 text-md md:py-4 md:px-14 md:text-xl',
    large: 'py-4 px-14 text-xl md:py-6 md:px-20 md:text-2xl',
};

export const Button = ({
    variant = 'contained',
    size = 'medium',
    children,
    className,
    disabled,
    ...props
}: ButtonProps) => {
    const variantName:
        | 'contained'
        | 'contained_disabled'
        | 'outlined'
        | 'outlined_disabled'
        | 'text'
        | 'text_disabled' = disabled ? `${variant}_disabled` : `${variant}`;

    return (
        <button
            className={`${buttonVariantClasses[variantName]} ${
                buttonSizeClasses[size]
            } rounded-full font-bold ${disabled ? '' : 'hover:cursor-pointer'} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

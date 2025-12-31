"use client";

import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  appName: string;
}

export const Button = ({ children, className, appName, ...props }: ButtonProps) => {
  return (
    <button
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

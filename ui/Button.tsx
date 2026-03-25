import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
};

export default function Button({ children, className }: ButtonProps) {
  return (
    <button
      className={`bg-orange-500 text-white px-4 py-2 rounded-full ${className}`}
    >
      {children}
    </button>
  );
}
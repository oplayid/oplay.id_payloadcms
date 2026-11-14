import React from "react";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  containerClass?: string;
};

export default function Container({
  children,
  className = "",
  containerClass = "w-full max-w-[1600px] mx-auto px-6 md:px-12", // Lebar maksimal luas dengan padding kiri-kanan yang pas
}: ContainerProps) {
  return <div className={`${containerClass} ${className}`}>{children}</div>;
}

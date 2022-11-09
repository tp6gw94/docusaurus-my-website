import React from 'react';

export default function Highlight({
  children,
  color = '#fcba03',
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        borderRadius: '2px',
        color: color,
        padding: '0.05rem 0.2rem',
        fontWeight: 'bold',
      }}
    >
      {children}
    </span>
  );
}

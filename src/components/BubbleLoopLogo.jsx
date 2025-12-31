import React from 'react';

export default function BubbleLoopLogo({
  size = 120,
  showLabel = true,
  className = '',
}) {
  return (
    <svg
      className={`bbl-logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BubbleLoop"
      style={{
        '--logo-ink': 'var(--slate-800)',
        '--logo-ink-2': 'var(--primary-dark)',
        '--logo-track': 'rgba(99, 102, 241, 0.18)',
        '--logo-bg': 'var(--slate-50)',
        '--logo-cycle': '15s',
      }}
    >
      <style>
        {`
          .bbl-logo .progress {
            transform-origin: 110px 110px;
            transform: rotate(-90deg);
            stroke-dasharray: 490;
            animation: cycle var(--logo-cycle) cubic-bezier(.45,0,.55,1) infinite;
          }
          @keyframes cycle{
            0%   { stroke-dashoffset: 490; }
            42%  { stroke-dashoffset: 0; }
            56%  { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 490; }
          }

          .bbl-logo .bubble{
            opacity: 0;
            animation: popOut var(--logo-cycle) ease-out infinite;
          }
          @keyframes popOut{
            0%   { opacity: 0; transform: translateY(0) scale(.95); }
            58%  { opacity: 0; transform: translateY(0) scale(.95); }
            63%  { opacity: 1; transform: translateY(-6px) scale(1); }
            85%  { opacity: .55; transform: translateY(-30px) scale(1.02); }
            100% { opacity: 0; transform: translateY(-44px) scale(1.04); }
          }
          .bbl-logo .b1{ animation-delay: 0s; }
          .bbl-logo .b2{ animation-delay: .25s; }
          .bbl-logo .b3{ animation-delay: .5s; }

          .bbl-logo .core{ transform-origin:110px 110px; animation: corePulse var(--logo-cycle) ease-in-out infinite; }
          @keyframes corePulse{
            0%,100%{ transform: scale(1); opacity:.12; }
            50%{ transform: scale(1.02); opacity:.18; }
          }

          .bbl-logo text {
            font-family: 'Outfit', ui-serif, 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
            letter-spacing: 0.6;
          }
        `}
      </style>

      <circle cx="110" cy="110" r="110" fill="var(--logo-bg)" />

      <circle cx="110" cy="110" r="78" fill="none" stroke="var(--logo-track)" strokeWidth="14" />

      <circle
        cx="110"
        cy="110"
        r="78"
        fill="none"
        stroke="var(--logo-ink)"
        strokeWidth="14"
        strokeLinecap="round"
        className="progress"
      />

      <circle className="core" cx="110" cy="110" r="44" fill="var(--logo-ink)" />

      {showLabel && (
        <text x="110" y="116" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--logo-ink)">
          BubbleLoop
        </text>
      )}

      <g fill="none" stroke="var(--logo-ink-2)" strokeWidth="3">
        <g className="bubble b1">
          <circle cx="110" cy="28" r="9" fill="var(--logo-bg)" />
          <circle cx="110" cy="28" r="9" />
        </g>
        <g className="bubble b2">
          <circle cx="88" cy="36" r="7.5" fill="var(--logo-bg)" />
          <circle cx="88" cy="36" r="7.5" />
        </g>
        <g className="bubble b3">
          <circle cx="132" cy="40" r="6.5" fill="var(--logo-bg)" />
          <circle cx="132" cy="40" r="6.5" />
        </g>
      </g>
    </svg>
  );
}

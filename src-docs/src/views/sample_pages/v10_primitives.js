/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const V10_FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";
const V10_FONT_SANS = "'Outfit', system-ui, sans-serif";

const V10_THEMES = {
  dark: {
    name: 'dark',
    bg: '#0d3057',
    bgDeep: '#0a2545',
    panel: 'rgba(10,37,69,0.55)',
    panelSolid: '#103e6e',
    ink: '#cfe4f7',
    inkBright: '#ffffff',
    inkDim: 'rgba(207,228,247,0.62)',
    inkFade: 'rgba(207,228,247,0.34)',
    inkGhost: 'rgba(207,228,247,0.16)',
    cyan: '#5dd9ff',
    cyanDim: 'rgba(93,217,255,0.45)',
    cyanSoft: 'rgba(93,217,255,0.10)',
    amber: '#ffb86b',
    amberDim: 'rgba(255,184,107,0.45)',
    amberSoft: 'rgba(255,184,107,0.12)',
    green: '#7be0a8',
    greenDim: 'rgba(123,224,168,0.45)',
    greenSoft: 'rgba(123,224,168,0.10)',
    red: '#ff7a7a',
    redDim: 'rgba(255,122,122,0.45)',
    redSoft: 'rgba(255,122,122,0.10)',
    gridFine: 'rgba(207,228,247,0.05)',
    gridMajor: 'rgba(207,228,247,0.10)',
    inputBg: 'rgba(10,37,69,0.45)',
    codeBg: 'rgba(10,37,69,0.70)',
  },
  light: {
    name: 'light',
    bg: '#eef2f7',
    bgDeep: '#dde4ee',
    panel: 'rgba(255,255,255,0.85)',
    panelSolid: '#ffffff',
    ink: '#0d3057',
    inkBright: '#06203f',
    inkDim: 'rgba(13,48,87,0.62)',
    inkFade: 'rgba(13,48,87,0.32)',
    inkGhost: 'rgba(13,48,87,0.14)',
    cyan: '#1f6cb5',
    cyanDim: 'rgba(31,108,181,0.40)',
    cyanSoft: 'rgba(31,108,181,0.08)',
    amber: '#c47a1f',
    amberDim: 'rgba(196,122,31,0.45)',
    amberSoft: 'rgba(196,122,31,0.10)',
    green: '#2e8b6f',
    greenDim: 'rgba(46,139,111,0.45)',
    greenSoft: 'rgba(46,139,111,0.08)',
    red: '#c53961',
    redDim: 'rgba(197,57,97,0.45)',
    redSoft: 'rgba(197,57,97,0.08)',
    gridFine: 'rgba(13,48,87,0.05)',
    gridMajor: 'rgba(13,48,87,0.10)',
    inputBg: 'rgba(255,255,255,0.70)',
    codeBg: 'rgba(13,48,87,0.05)',
  },
};

const V10ThemeContext = createContext(V10_THEMES.dark);
const useV10T = () => useContext(V10ThemeContext);

function useV10Theme() {
  const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem('v10-theme')
    : null;
  const preferLight = typeof window !== 'undefined'
    && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initial = stored || (preferLight ? 'light' : 'dark');
  const [mode, setModeState] = useState(initial);

  const setMode = (next) => {
    setModeState(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('v10-theme', next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = mode;
    }
  }, [mode]);

  return { mode, setMode, T: V10_THEMES[mode] };
}

// ─── Corner Ticks ───────────────────────────────────────────────

function V10CornerTicks({ accent }) {
  const T = useV10T();
  const a = accent || T.cyanDim;
  const f = T.inkFade;
  return (
    <React.Fragment>
      <span style={{ position: 'absolute', top: -1, left: -1, width: 6, height: 6, borderTop: `1px solid ${a}`, borderLeft: `1px solid ${a}`, pointerEvents: 'none' }}/>
      <span style={{ position: 'absolute', top: -1, right: -1, width: 6, height: 6, borderTop: `1px solid ${f}`, borderRight: `1px solid ${f}`, pointerEvents: 'none' }}/>
      <span style={{ position: 'absolute', bottom: -1, left: -1, width: 6, height: 6, borderBottom: `1px solid ${a}`, borderLeft: `1px solid ${a}`, pointerEvents: 'none' }}/>
      <span style={{ position: 'absolute', bottom: -1, right: -1, width: 6, height: 6, borderBottom: `1px solid ${f}`, borderRight: `1px solid ${f}`, pointerEvents: 'none' }}/>
    </React.Fragment>
  );
}

// ─── Olly Avatar ────────────────────────────────────────────────

const EYE_L = "M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z";
const EYE_R = "M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z";

function V10OllyAvatar({ size = 40 }) {
  const T = useV10T();
  const sw = size < 30 ? 1.6 : size < 60 ? 1.2 : 1.0;
  const bodyFill = T.name === 'dark' ? T.bgDeep : '#dde9f5';
  const ringFill = T.name === 'dark' ? 'rgba(93,217,255,0.08)' : 'rgba(31,108,181,0.08)';

  const eyeScale = (() => {
    if (size >= 80) return 1.0;
    if (size <= 20) return 2.0;
    const t = (80 - size) / (80 - 20);
    return 1.0 + Math.pow(t, 1.3) * 1.0;
  })();
  const eyeSpread = (() => {
    let pref;
    if (size >= 80) pref = 1.0;
    else if (size <= 20) pref = 0.85;
    else {
      const t = (80 - size) / (80 - 20);
      pref = 1.0 - Math.pow(t, 1.3) * 0.15;
    }
    const minSpread = (4 + 6 * eyeScale) / 18;
    return Math.max(pref, minSpread);
  })();
  const LEFT_CX = 39, RIGHT_CX = 57, EYE_CY = 31, PAIR_CX = 48;
  const leftDx = (PAIR_CX - LEFT_CX) * (1 - eyeSpread);
  const rightDx = -(RIGHT_CX - PAIR_CX) * (1 - eyeSpread);

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="40" cy="40" r="38" fill={ringFill} stroke={T.cyanDim} strokeWidth={sw * 0.4}/>
      <circle cx="40" cy="40" r="34" fill={bodyFill} stroke={T.cyan} strokeWidth={sw}/>
      {[0, 90, 180, 270].map(a => {
        const r = a * Math.PI / 180;
        const x1 = 40 + Math.cos(r) * 34;
        const y1 = 40 + Math.sin(r) * 34;
        const x2 = 40 + Math.cos(r) * 38;
        const y2 = 40 + Math.sin(r) * 38;
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.cyan} strokeWidth={sw * 0.6}/>;
      })}
      <g transform={`translate(${leftDx} 0) translate(${LEFT_CX} ${EYE_CY}) scale(${eyeScale}) translate(${-LEFT_CX} ${-EYE_CY})`}>
        <path d={EYE_L} fill={T.cyan}/>
      </g>
      <g transform={`translate(${rightDx} 0) translate(${RIGHT_CX} ${EYE_CY}) scale(${eyeScale}) translate(${-RIGHT_CX} ${-EYE_CY})`}>
        <path d={EYE_R} fill={T.cyan}/>
      </g>
    </svg>
  );
}

// ─── Person Avatar ──────────────────────────────────────────────

function V10PersonAvatar({ initial, color, size = 24 }) {
  const T = useV10T();
  const c = color || T.amber;
  const dim = color === T.red ? T.redDim : T.amberDim;
  return (
    <div className="v10-round v10-shadow" style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.4px solid ${c}`,
      display: 'grid', placeItems: 'center',
      color: c, fontWeight: 700,
      fontSize: size * 0.46, fontFamily: V10_FONT_MONO,
      letterSpacing: 0.5, flexShrink: 0,
      boxShadow: `inset 0 0 0 2px ${T.bg}, inset 0 0 0 3px ${dim}`,
    }}>{initial}</div>
  );
}

// ─── Status Pill ────────────────────────────────────────────────

function V10StatusPill({ tone = 'new', children }) {
  const T = useV10T();
  const tones = {
    new: { bg: T.amberSoft, border: T.amberDim, color: T.amber },
    ack: { bg: T.cyanSoft, border: T.cyanDim, color: T.cyan },
    ok: { bg: T.greenSoft, border: T.greenDim, color: T.green },
    resolved: { bg: T.greenSoft, border: T.greenDim, color: T.green },
    alert: { bg: T.redSoft, border: T.redDim, color: T.red },
    critical: { bg: T.redSoft, border: T.redDim, color: T.red },
  };
  const s = tones[tone] || tones.new;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: V10_FONT_MONO,
      fontSize: 9, fontWeight: 700,
      letterSpacing: 1.4, textTransform: 'uppercase',
      padding: '2px 7px',
      border: `1px solid ${s.border}`,
      background: s.bg, color: s.color,
      borderRadius: 0,
      transition: 'background-color 200ms ease, border-color 200ms ease, color 200ms ease',
    }}>
      {'●'} {children}
    </span>
  );
}

// ─── Iso Cubes ──────────────────────────────────────────────────

function V10IsoCube({ x, broken, ok }) {
  const T = useV10T();
  const c = broken ? T.amber : (ok ? T.green : T.cyan);
  const fillBroken = T.name === 'dark' ? 'rgba(255,184,107,0.16)' : 'rgba(196,122,31,0.14)';
  const fillOk = T.name === 'dark' ? 'rgba(123,224,168,0.14)' : 'rgba(46,139,111,0.12)';
  const fillDef = T.name === 'dark' ? 'rgba(93,217,255,0.10)' : 'rgba(31,108,181,0.08)';
  const fill = broken ? fillBroken : (ok ? fillOk : fillDef);
  return (
    <g transform={`translate(${x},0)`}>
      <polygon points="6,2 14,6 8,10 0,6" fill={fill} stroke={c} strokeWidth="0.9"/>
      <polygon points="0,6 8,10 8,18 0,14" fill={fill} stroke={c} strokeWidth="0.9" opacity="0.85"/>
      <polygon points="8,10 14,6 14,14 8,18" fill={fill} stroke={c} strokeWidth="0.9" opacity="0.7"/>
      {broken && <line x1="2" y1="9" x2="12" y2="15" stroke={c} strokeWidth="0.7"/>}
    </g>
  );
}

function V10IsoStack({ total, bad, allOk }) {
  const T = useV10T();
  const shown = Math.min(total, 7);
  const overflow = total - shown;
  const w = shown * 14 + 16 + (overflow ? 22 : 0);
  return (
    <svg width={w} height="22" viewBox={`0 0 ${w} 22`} style={{ flexShrink: 0 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <V10IsoCube key={i} x={i * 14} broken={!allOk && i < bad} ok={allOk}/>
      ))}
      {overflow > 0 && (
        <text x={shown * 14 + 4} y="14" fontFamily={V10_FONT_MONO} fontSize="9" fill={T.inkDim}>+{overflow}</text>
      )}
    </svg>
  );
}

// ─── Latency Bar ────────────────────────────────────────────────

function V10LatencyBar({ tone = 'warn', deltaDir = 'up', solid }) {
  const T = useV10T();
  const col = tone === 'ok' ? T.green : (tone === 'shared' ? T.cyan : T.amber);
  const barH = deltaDir === 'down' ? 5 : 11;
  const barY = 15 - barH;
  return (
    <svg width="32" height="16" viewBox="0 0 32 16" style={{ flexShrink: 0 }}>
      <line x1="0" y1="15" x2="32" y2="15" stroke={T.inkFade} strokeWidth="0.6"/>
      <line x1="0" y1="10" x2="32" y2="10" stroke={col} strokeWidth="0.5" strokeDasharray="2 2"/>
      <rect x="2" y={barY} width="4" height={barH} fill={solid || col} stroke={col} strokeWidth="0.6"/>
      <rect x="8" y={barY + 1} width="4" height={Math.max(2, barH - 2)} fill="none" stroke={col} strokeWidth="0.6" opacity="0.6"/>
      <rect x="14" y={barY + 2} width="4" height={Math.max(2, barH - 4)} fill="none" stroke={col} strokeWidth="0.6" opacity="0.4"/>
    </svg>
  );
}

// ─── Section Label ──────────────────────────────────────────────

function V10SectionLabel({ children, style }) {
  const T = useV10T();
  return (
    <div style={{
      fontFamily: V10_FONT_MONO, fontSize: 10.5, letterSpacing: 1.8,
      color: T.cyan, fontWeight: 700,
      marginBottom: 10, marginTop: 4,
      display: 'flex', alignItems: 'center', gap: 10,
      ...style,
    }}>
      <span>// {children}</span>
      <span style={{ flex: 1, borderTop: `1px dashed ${T.inkGhost}` }}/>
    </div>
  );
}

// ─── Theme Toggle ───────────────────────────────────────────────

function V10ThemeToggle({ mode, setMode, style }) {
  const T = useV10T();
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `1px solid ${T.inkFade}`,
      background: T.panel,
      fontFamily: V10_FONT_MONO, fontSize: 10, letterSpacing: 1.4,
      userSelect: 'none', ...style,
    }}>
      {['light', 'dark'].map((m, i) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              appearance: 'none', border: 'none',
              padding: '6px 12px', cursor: 'pointer',
              background: active ? T.cyanSoft : 'transparent',
              color: active ? T.cyan : T.inkDim,
              fontWeight: active ? 700 : 500,
              fontFamily: V10_FONT_MONO, fontSize: 10, letterSpacing: 1.4,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              borderRight: i === 0 ? `1px solid ${T.inkFade}` : 'none',
            }}
          >
            {m === 'light' ? (
              <svg width="11" height="11" viewBox="0 0 11 11">
                <circle cx="5.5" cy="5.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1"/>
                {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
                  const r = a * Math.PI / 180;
                  return <line key={a}
                    x1={5.5 + Math.cos(r) * 3.8} y1={5.5 + Math.sin(r) * 3.8}
                    x2={5.5 + Math.cos(r) * 5.1} y2={5.5 + Math.sin(r) * 5.1}
                    stroke="currentColor" strokeWidth="1"/>;
                })}
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 11 11">
                <path d="M8 6.4 A3.6 3.6 0 1 1 4.6 3 a2.8 2.8 0 0 0 3.4 3.4 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            )}
            {m.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

// ─── Buttons ────────────────────────────────────────────────────

function V10GhostButton({ children, style, onClick }) {
  const T = useV10T();
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 12px',
        border: `1px solid ${T.inkFade}`,
        color: T.inkDim,
        fontFamily: V10_FONT_MONO, fontSize: 10.5, letterSpacing: 1.2,
        fontWeight: 600, textTransform: 'uppercase',
        cursor: 'pointer', userSelect: 'none',
        borderRadius: 0,
        ...style,
      }}
    >{children}</span>
  );
}

function V10IconButton({ children, active, size = 32, style }) {
  const T = useV10T();
  return (
    <span style={{
      width: size, height: size,
      display: 'grid', placeItems: 'center',
      border: `1px solid ${active ? T.cyanDim : T.inkFade}`,
      background: active ? T.cyanSoft : 'transparent',
      color: active ? T.cyan : T.inkDim,
      cursor: 'pointer', borderRadius: 0,
      ...style,
    }}>{children}</span>
  );
}

// ─── Page Background ────────────────────────────────────────────

const V10_RESET_CSS = `
.v10-root, .v10-root *:not(.v10-round):not(.v10-shadow) {
  border-radius: 0 !important;
  box-shadow: none !important;
  font-family: inherit;
}
.v10-root .v10-round {
  border-radius: 50% !important;
}
.v10-root {
  font-family: 'Outfit', system-ui, sans-serif !important;
  line-height: 1.5;
}
html.v10-active, html.v10-active body {
  background-color: var(--v10-bg, #0d3057) !important;
  overflow: hidden;
}
.v10-root *::-webkit-scrollbar { width: 8px; height: 8px; }
.v10-root *::-webkit-scrollbar-track { background: transparent; }
.v10-root *::-webkit-scrollbar-thumb { background: var(--v10-scroll-thumb, rgba(207,228,247,0.22)); border-radius: 0 !important; }
.v10-root *::-webkit-scrollbar-thumb:hover { background: var(--v10-scroll-thumb-hover, rgba(207,228,247,0.38)); }
`;

function V10PageBackground({ children, marks = true }) {
  const T = useV10T();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('v10-active');
    html.style.setProperty('--v10-bg', T.bg);
    html.style.setProperty('--v10-scroll-thumb', T.name === 'dark' ? 'rgba(207,228,247,0.22)' : 'rgba(13,48,87,0.14)');
    html.style.setProperty('--v10-scroll-thumb-hover', T.name === 'dark' ? 'rgba(207,228,247,0.38)' : 'rgba(13,48,87,0.24)');

    let style = document.getElementById('v10-reset-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'v10-reset-style';
      style.textContent = V10_RESET_CSS;
      document.head.appendChild(style);
    }

    return () => {
      html.classList.remove('v10-active');
      html.style.removeProperty('--v10-bg');
      html.style.removeProperty('--v10-scroll-thumb');
      html.style.removeProperty('--v10-scroll-thumb-hover');
      const s = document.getElementById('v10-reset-style');
      if (s) s.remove();
    };
  }, [T]);

  return (
    <div className="v10-root" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'auto',
      background: T.bg,
      backgroundImage: `
        linear-gradient(to right, ${T.gridFine} 1px, transparent 1px),
        linear-gradient(to bottom, ${T.gridFine} 1px, transparent 1px),
        linear-gradient(to right, ${T.gridMajor} 1px, transparent 1px),
        linear-gradient(to bottom, ${T.gridMajor} 1px, transparent 1px)
      `,
      backgroundSize: '16px 16px, 16px 16px, 80px 80px, 80px 80px',
      color: T.ink,
      fontFamily: V10_FONT_SANS,
      zIndex: 10000,
      transition: 'background-color 200ms ease, color 200ms ease',
    }}>
      {marks && [{top: 14, left: 14}, {top: 14, right: 14}, {bottom: 14, left: 14}, {bottom: 14, right: 14}].map((s, i) => (
        <div key={i} style={{ position: 'fixed', width: 14, height: 14, ...s, pointerEvents: 'none', zIndex: 10050 }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="4" fill="none" stroke={T.cyanDim} strokeWidth="0.7"/>
            <line x1="0" y1="7" x2="14" y2="7" stroke={T.cyanDim} strokeWidth="0.7"/>
            <line x1="7" y1="0" x2="7" y2="14" stroke={T.cyanDim} strokeWidth="0.7"/>
          </svg>
        </div>
      ))}
      {children}
    </div>
  );
}

export {
  V10_FONT_MONO,
  V10_FONT_SANS,
  V10_THEMES,
  V10ThemeContext,
  useV10T,
  useV10Theme,
  V10CornerTicks,
  V10OllyAvatar,
  V10PersonAvatar,
  V10StatusPill,
  V10IsoCube,
  V10IsoStack,
  V10LatencyBar,
  V10SectionLabel,
  V10ThemeToggle,
  V10GhostButton,
  V10IconButton,
  V10PageBackground,
};

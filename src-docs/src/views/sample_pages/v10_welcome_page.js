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

import React, { useState, useCallback, useEffect } from 'react';

import {
  V10_FONT_MONO,
  V10_FONT_SANS,
  V10_THEMES,
  V10ThemeContext,
  useV10T,
  useV10Theme,
  V10CornerTicks,
  V10OllyAvatar,
  V10PersonAvatar,
  V10IsoStack,
  V10LatencyBar,
  V10SectionLabel,
  V10ThemeToggle,
  V10GhostButton,
  V10PageBackground,
} from './v10_primitives';
import { SessionLeftNav } from './session_left_nav';
import { V10DashboardContent } from './v10_dashboard_page';
import {
  createSession,
  setActiveSession,
} from './session_state_manager';
import { LATENCY_SPIKE_SESSION, ERROR_RATE_SPIKE_SESSION } from './session_mock_data';
import { applyTheme } from '../../services';

// ─── Header ────────────────────────────────────────────────────

function Header() {
  const T = useV10T();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
      <V10OllyAvatar size={52}/>
      <div style={{ flex: 1 }}>
        <h1 style={{
          margin: 0,
          fontFamily: V10_FONT_SANS, fontWeight: 600,
          fontSize: 32, letterSpacing: -0.8,
          color: T.inkBright, lineHeight: 1.1,
        }}>Good morning, John</h1>
        <div style={{
          marginTop: 6,
          fontFamily: V10_FONT_SANS, fontSize: 14.5, color: T.inkDim, letterSpacing: -0.05,
        }}>
          All <span style={{ color: T.ink, fontWeight: 600 }}>247</span> services steady.
          {' '}<span style={{ color: T.amber, fontWeight: 600 }}>2</span> activities to review.
        </div>
      </div>
    </div>
  );
}

// ─── Ask Bar ───────────────────────────────────────────────────

function AskBar() {
  const T = useV10T();
  return (
    <div style={{
      position: 'relative',
      background: T.inputBg,
      border: `1px solid ${T.inkGhost}`,
      padding: '14px 16px',
      marginBottom: 22,
    }}>
      <V10CornerTicks accent={T.cyanDim}/>
      <div style={{
        fontFamily: V10_FONT_SANS, fontSize: 15, color: T.inkDim,
        minHeight: 44,
      }}>Ask AI anything, or type to search a page</div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 8,
      }}>
        <span className="v10-round" style={{
          width: 26, height: 26, borderRadius: '50%',
          border: `1px solid ${T.inkFade}`,
          display: 'grid', placeItems: 'center',
          color: T.inkDim, fontSize: 16, lineHeight: 1,
          cursor: 'pointer',
        }}>+</span>
        <span className="v10-round" style={{
          width: 30, height: 30, borderRadius: '50%',
          border: `1px solid ${T.cyanDim}`,
          background: T.cyanSoft,
          display: 'grid', placeItems: 'center',
          color: T.cyan, cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <line x1="7" y1="11" x2="7" y2="3" stroke="currentColor" strokeWidth="1.4"/>
            <polyline points="3,7 7,3 11,7" fill="none" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

// ─── Tab Bar ───────────────────────────────────────────────────

function TabBar({ onOpenDashboard, activeTab, onTabChange }) {
  const T = useV10T();
  const tabs = ['Overview', 'Discover', 'Monitor', 'More'];
  const active = activeTab || 'Overview';
  const setActive = onTabChange || (() => {});
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
      <span style={{
        width: 36, height: 36,
        border: `1px solid ${T.inkFade}`,
        background: T.panel,
        display: 'grid', placeItems: 'center',
        color: T.inkDim, cursor: 'pointer',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/>
          <polyline points="8,4 8,8 11,10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
        </svg>
      </span>
      {tabs.map(label => {
        const isActive = active === label;
        const hasDot = label === 'Overview';
        return (
          <button
            key={label}
            type="button"
            onClick={() => setActive(label)}
            style={{
              appearance: 'none',
              flex: 1,
              padding: '9px 18px',
              border: `1px solid ${isActive ? T.cyanDim : T.inkFade}`,
              background: isActive ? T.cyanSoft : T.panel,
              color: isActive ? T.cyan : T.ink,
              fontFamily: V10_FONT_MONO, fontSize: 11.5,
              letterSpacing: 1.6, fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 0,
            }}
          >
            {label}
            {hasDot && (
              <span style={{
                position: 'absolute', top: 7, right: 9,
                width: 6, height: 6,
                background: T.amber,
                boxShadow: `0 0 0 2px ${isActive ? T.amberSoft : 'transparent'}`,
              }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Finding Cards ─────────────────────────────────────────────

function FindingMeta({ d }) {
  const T = useV10T();
  const tone = d.severity === 'shared' ? 'shared' : 'warn';
  const accent = d.severity === 'shared' ? T.cyan : T.amber;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: V10_FONT_MONO, flexWrap: 'wrap' }}>
      {d.source === 'ai' ? <V10OllyAvatar size={22}/> : <V10PersonAvatar initial={d.sharedInitial} size={22}/>}
      <V10IsoStack total={d.scopeTotal} bad={d.scopeBad}/>
      <span style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 0.5 }}>
        {d.scopeBad}/{d.scopeTotal} {d.scopeUnit}
      </span>
      <span style={{ fontSize: 11, color: T.inkFade }}>{'│'}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <V10LatencyBar tone={tone} deltaDir={d.deltaDir} solid={d.severity === 'shared' ? T.cyanSoft : T.amberSoft}/>
        <span style={{ fontSize: 11.5, color: T.inkBright, fontWeight: 700 }}>{d.metric}</span>
        <span style={{ fontSize: 9.5, color: T.inkFade, letterSpacing: 1, textTransform: 'uppercase' }}>{d.metricLabel}</span>
        <span style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: 0.4 }}>
          {d.deltaDir === 'up' ? '↑' : '↓'} {d.delta}
        </span>
      </span>
      <span style={{ fontSize: 11, color: T.inkFade }}>{'│'}</span>
      <span style={{ fontSize: 10, color: T.inkDim, letterSpacing: 1.2 }}>
        T+{d.ageShort} {'·'} CONF {d.confidence}% {'·'} 3 TABS
      </span>
    </div>
  );
}

function FindingCard({ d, onClick }) {
  const T = useV10T();
  const accent = d.severity === 'shared' ? T.cyan : T.amber;
  return (
    <div onClick={onClick} style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      borderLeft: `2px solid ${accent}`,
      padding: '16px 20px',
      position: 'relative',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <V10CornerTicks accent={accent}/>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: V10_FONT_SANS, fontSize: 17, fontWeight: 600,
            color: T.inkBright, letterSpacing: -0.2, lineHeight: 1.3,
          }}>{d.title}</div>
          <div style={{
            marginTop: 4,
            fontFamily: V10_FONT_MONO, fontSize: 10, letterSpacing: 1.4,
            color: T.inkDim, textTransform: 'uppercase',
          }}>
            {d.source === 'ai' ? 'Created by AI' : `Shared by team · ${d.sharedFrom}`} {'·'} {d.ageLong}
          </div>
        </div>
        <V10GhostButton>Dismiss</V10GhostButton>
      </div>
      <div style={{
        fontFamily: V10_FONT_SANS, fontSize: 14.5, fontWeight: 500,
        color: T.ink, lineHeight: 1.45, letterSpacing: -0.1,
        marginBottom: 12,
      }}>{d.finding}</div>
      <FindingMeta d={d}/>
    </div>
  );
}

function Latest({ onOpenDashboard }) {
  const findings = [
    {
      title: 'Latency Spike Investigation',
      source: 'ai',
      ageLong: '15 min ago',
      finding: 'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
      severity: 'alert',
      metric: '2,140ms', metricLabel: 'P99', delta: '+184%', deltaDir: 'up',
      scopeTotal: 4, scopeBad: 3, scopeUnit: 'pods',
      confidence: 92, ageShort: '15m',
    },
    {
      title: 'Error Rate Spike — Checkout Service',
      source: 'team',
      sharedFrom: 'Sichenl',
      sharedInitial: 'S',
      ageLong: '2 hours ago',
      finding: 'Checkout error rate jumped to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
      severity: 'shared',
      metric: '12.4%', metricLabel: 'err rate', delta: '+12.4 pts', deltaDir: 'up',
      scopeTotal: 1, scopeBad: 1, scopeUnit: 'svc',
      confidence: 88, ageShort: '2h',
    },
  ];
  return (
    <div>
      <V10SectionLabel>LATEST</V10SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {findings.map((f, i) => <FindingCard key={i} d={f} onClick={onOpenDashboard}/>)}
      </div>
    </div>
  );
}

// ─── Top Services ──────────────────────────────────────────────

function FaultBar({ pct }) {
  const T = useV10T();
  const filledW = Math.max(2, pct * 1.6);
  const totalW = 160;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      <div style={{
        height: 12, width: filledW,
        background: T.cyanSoft,
        border: `1px solid ${T.cyan}`,
      }}/>
      <div style={{
        height: 12, width: totalW - filledW,
        background: 'transparent',
        borderTop: `1px solid ${T.inkFade}`,
        borderBottom: `1px solid ${T.inkFade}`,
        borderRight: `1px solid ${T.inkFade}`,
        backgroundImage: `repeating-linear-gradient(45deg, ${T.inkGhost} 0 1px, transparent 1px 6px)`,
      }}/>
    </div>
  );
}

function TopServices() {
  const T = useV10T();
  const rows = [
    { svc: 'checkout', pct: 66.67 },
    { svc: 'frontend', pct: 14.49 },
    { svc: 'frontend-proxy', pct: 14.29 },
  ];
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      padding: '16px 20px',
      position: 'relative',
      height: '100%', boxSizing: 'border-box',
    }}>
      <V10CornerTicks/>
      <div style={{
        fontFamily: V10_FONT_SANS, fontSize: 16, fontWeight: 600,
        color: T.inkBright, letterSpacing: -0.2, marginBottom: 14,
      }}>Top services by fault rate</div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 160px 60px',
        fontFamily: V10_FONT_MONO, fontSize: 9.5, letterSpacing: 1.4,
        color: T.inkFade, textTransform: 'uppercase',
        paddingBottom: 6, borderBottom: `1px solid ${T.inkGhost}`,
        marginBottom: 8, alignItems: 'center',
      }}>
        <span>Service</span>
        <span>Fault rate</span>
        <span style={{ textAlign: 'right' }}>%</span>
      </div>

      {rows.map((r, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 60px',
          alignItems: 'center', padding: '8px 0',
          borderBottom: i < rows.length - 1 ? `1px dashed ${T.inkGhost}` : 'none',
        }}>
          <span style={{ fontFamily: V10_FONT_MONO, fontSize: 12.5, color: T.cyan, fontWeight: 600, letterSpacing: 0.3 }}>{r.svc}</span>
          <FaultBar pct={r.pct}/>
          <span style={{
            fontFamily: V10_FONT_MONO, fontSize: 12, color: T.inkBright,
            fontWeight: 700, textAlign: 'right', letterSpacing: 0.3,
          }}>{r.pct.toFixed(2)}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Connection Timeouts ───────────────────────────────────────

function ConnTimeouts() {
  const T = useV10T();
  const pts = [30, 28, 32, 35, 40, 50, 65, 90, 140, 220, 380, 600, 720, 800, 847];
  const min = Math.min(...pts), max = Math.max(...pts);
  const w = 200, h = 56;
  const sx = w / (pts.length - 1);
  const sy = (v) => h - ((v - min) / (max - min)) * (h - 4) - 2;
  const linePts = pts.map((v, i) => `${i * sx},${sy(v)}`).join(' ');
  const fillPts = `0,${h} ${linePts} ${w},${h}`;
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      padding: '16px 20px',
      position: 'relative',
      height: '100%', boxSizing: 'border-box',
    }}>
      <V10CornerTicks accent={T.amberDim}/>
      <div style={{
        fontFamily: V10_FONT_SANS, fontSize: 16, fontWeight: 600,
        color: T.inkBright, letterSpacing: -0.2, marginBottom: 4,
      }}>Connection timeout errors</div>
      <div style={{
        fontFamily: V10_FONT_MONO, fontSize: 11, color: T.cyan,
        letterSpacing: 0.4, marginBottom: 16,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        <span style={{ color: T.inkFade }}>$</span> source=logs <span style={{ color: T.inkFade }}>|</span> where seve...
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, marginTop: 18, flexWrap: 'wrap' }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
          {[0.25, 0.5, 0.75].map(p => (
            <line key={p} x1="0" y1={h * p} x2={w} y2={h * p} stroke={T.inkGhost} strokeWidth="0.5" strokeDasharray="2 3"/>
          ))}
          <polygon points={fillPts} fill={T.amberSoft}/>
          <polyline points={linePts} fill="none" stroke={T.amber} strokeWidth="1.6"/>
          <circle cx={w} cy={sy(pts[pts.length - 1])} r="3" fill={T.amber}/>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: V10_FONT_MONO, fontSize: 28, color: T.amber, fontWeight: 700, letterSpacing: -0.5 }}>847</span>
          <span style={{ fontFamily: V10_FONT_MONO, fontSize: 11, color: T.amber, fontWeight: 700, letterSpacing: 0.4 }}>{'↑'} +312%</span>
          <span style={{ fontFamily: V10_FONT_MONO, fontSize: 9.5, color: T.inkDim, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>Last 15 min</span>
        </div>
      </div>
    </div>
  );
}

// ─── Favorites ─────────────────────────────────────────────────

function FavoriteRow({ title, kind, icon }) {
  const T = useV10T();
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.inkGhost}`,
      padding: '14px 20px',
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer',
    }}>
      <V10CornerTicks/>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: V10_FONT_SANS, fontSize: 15, fontWeight: 600,
          color: T.inkBright, letterSpacing: -0.2,
        }}>{title}</div>
        <div style={{
          fontFamily: V10_FONT_MONO, fontSize: 10, letterSpacing: 1.4,
          color: T.inkDim, textTransform: 'uppercase', marginTop: 3,
        }}>{kind}</div>
      </div>
      <div style={{ color: T.cyan, opacity: 0.8 }}>{icon}</div>
    </div>
  );
}

function Favorites() {
  return (
    <div>
      <V10SectionLabel>FAVORITES</V10SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FavoriteRow
          title="System overview"
          kind="Dashboard"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="2" y="2" width="7" height="7"/>
              <rect x="11" y="2" width="7" height="7"/>
              <rect x="2" y="11" width="7" height="7"/>
              <rect x="11" y="11" width="7" height="7"/>
            </svg>
          }
        />
        <FavoriteRow
          title="Error rate by service"
          kind="Saved log"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="10" cy="10" r="8"/>
              <polygon points="10,4 13,10 10,16 7,10" fill="currentColor" stroke="none"/>
            </svg>
          }
        />
      </div>
    </div>
  );
}

// ─── Welcome Content (reusable) ────────────────────────────────

// ─── Discover Tab Content ──────────────────────────────────────

function DiscoverContent({ onOpenPage }) {
  const T = useV10T();
  const items = [
    { key: 'logs', label: 'Logs', icon: 'M3,3 H15 V15 H3Z M5,6 H13 M5,9 H13 M5,12 H10' },
    { key: 'metrics', label: 'Metrics', icon: 'M2,14 L5,8 L8,10 L11,4 L14,6' },
    { key: 'dashboards', label: 'Dashboards', icon: 'M2,2 H7 V7 H2Z M9,2 H14 V7 H9Z M2,9 H7 V14 H2Z M9,9 H14 V14 H9Z' },
    { key: 'alerts', label: 'Alerts', icon: 'M8,2 L14,13 H2Z M8,7 V10 M8,11.5 V12' },
  ];
  return (
    <div>
      <V10SectionLabel>OPEN A PAGE TO DISCOVER</V10SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {items.map(item => (
          <div key={item.key} onClick={() => onOpenPage && onOpenPage(item.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '20px 12px',
            border: `1px solid ${T.inkGhost}`,
            background: T.panel,
            cursor: 'pointer', position: 'relative',
          }}>
            <V10CornerTicks/>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke={T.cyan} strokeWidth="1.2">
              <path d={item.icon}/>
            </svg>
            <span style={{ fontFamily: V10_FONT_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: T.ink }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Monitor Tab Content ──────────────────────────────────────

function MonitorContent({ onOpenPage }) {
  const T = useV10T();
  const items = [
    { key: 'app-map', label: 'Application Map', icon: 'M4,8 L8,4 L12,8 L8,12Z' },
    { key: 'app-services', label: 'Services', icon: 'M3,3 H13 V13 H3Z M8,3 V13 M3,8 H13' },
    { key: 'app-traces', label: 'Traces', icon: 'M2,4 H14 M2,8 H10 M2,12 H12' },
    { key: 'forecasting', label: 'Forecasting', icon: 'M2,12 L5,8 L8,10 L11,4 L14,2 M11,4 L14,4 M11,4 V7' },
    { key: 'agent-traces', label: 'Agent Traces', icon: 'M3,8 A5,5 0 1,1 13,8 A5,5 0 1,1 3,8 M8,5 V8 L10,10' },
    { key: 'agent-spans', label: 'Agent Spans', icon: 'M2,3 H14 V5 H2Z M2,7 H10 V9 H2Z M2,11 H12 V13 H2Z' },
  ];
  return (
    <div>
      <V10SectionLabel>OPEN A PAGE TO MONITOR</V10SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {items.map(item => (
          <div key={item.key} onClick={() => onOpenPage && onOpenPage(item.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '20px 12px',
            border: `1px solid ${T.inkGhost}`,
            background: T.panel,
            cursor: 'pointer', position: 'relative',
          }}>
            <V10CornerTicks/>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke={T.cyan} strokeWidth="1.2">
              <path d={item.icon}/>
            </svg>
            <span style={{ fontFamily: V10_FONT_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: T.ink }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── More Tab Content ─────────────────────────────────────────

function MoreContent({ onOpenPage }) {
  const T = useV10T();
  const items = [
    { key: 'notebooks', label: 'Notebook', icon: 'M4,2 H12 V14 H4Z M6,5 H10 M6,7 H10 M6,9 H8' },
    { key: 'alert-rules', label: 'Alert Rules', icon: 'M8,2 L14,13 H2Z M8,7 V10 M8,11.5 V12' },
  ];
  return (
    <div>
      <V10SectionLabel>OPEN A PAGE</V10SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {items.map(item => (
          <div key={item.key} onClick={() => onOpenPage && onOpenPage(item.key)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '20px 12px',
            border: `1px solid ${T.inkGhost}`,
            background: T.panel,
            cursor: 'pointer', position: 'relative',
          }}>
            <V10CornerTicks/>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke={T.inkDim} strokeWidth="1.2">
              <path d={item.icon}/>
            </svg>
            <span style={{ fontFamily: V10_FONT_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: T.inkDim }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Welcome Content (reusable) ────────────────────────────────

export function V10WelcomeContent({ mode, setMode, onOpenDashboard, onOpenPage }) {
  const T = useV10T();
  const [activeTab, setActiveTab] = useState('Overview');
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 28px 80px' }}>

      <Header/>
      <AskBar/>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} onOpenDashboard={onOpenDashboard}/>

      {activeTab === 'Overview' && (
        <>
          <Latest onOpenDashboard={onOpenDashboard}/>
          <div style={{ height: 28 }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <V10SectionLabel>SERVICE</V10SectionLabel>
              <TopServices/>
            </div>
            <div>
              <V10SectionLabel>SAVED QUERY</V10SectionLabel>
              <ConnTimeouts/>
            </div>
          </div>
          <div style={{ height: 36 }}/>

          <Favorites/>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
            <span style={{
              padding: '8px 22px',
              border: `1px solid ${T.inkFade}`,
              background: T.panel,
              color: T.inkDim,
              fontFamily: V10_FONT_MONO, fontSize: 10.5, letterSpacing: 1.6,
              fontWeight: 600, textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: 0,
            }}>{'◷'} Edit overview</span>
          </div>
        </>
      )}

      {activeTab === 'Discover' && <DiscoverContent onOpenPage={onOpenPage}/>}
      {activeTab === 'Monitor' && <MonitorContent onOpenPage={onOpenPage}/>}
      {activeTab === 'More' && <MoreContent onOpenPage={onOpenPage}/>}
    </div>
  );
}

// ─── Welcome Page (standalone route with left nav) ─────────────

function initV10SessionState() {
  const emptySession = {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    threadKey: null,
    pendingThread: null,
    title: 'New Session',
    threadPanelState: 'minimized',
    threadPanelWidth: 30,
    tabs: [],
    activeTabId: null,
    createdAt: Date.now(),
  };
  return {
    sessions: [emptySession, LATENCY_SPIKE_SESSION, ERROR_RATE_SPIKE_SESSION],
    activeSessionId: emptySession.id,
    version: 1,
  };
}

export function V10WelcomePage() {
  const { mode, setMode, T } = useV10Theme();
  const [sessionState, setSessionState] = useState(initV10SessionState);
  const [activeView, setActiveView] = useState('session');
  const [currentView, setCurrentView] = useState('welcome');

  useEffect(() => {
    const themeKey = mode === 'light' ? 'v10-light' : 'v10-dark';
    applyTheme(themeKey);
  }, [mode]);

  const activeSession = sessionState.sessions.find(
    (s) => s.id === sessionState.activeSessionId
  );
  const isEmptySession =
    activeSession &&
    !activeSession.threadKey &&
    !activeSession.pendingThread &&
    activeSession.tabs.length === 0;

  const handleCreateSession = useCallback(() => {
    setSessionState((prev) => {
      const active = prev.sessions.find((s) => s.id === prev.activeSessionId);
      if (active && !active.threadKey && !active.pendingThread && active.tabs.length === 0) {
        return prev;
      }
      return createSession(prev);
    });
    setActiveView('session');
    setCurrentView('welcome');
  }, []);

  const handleBrowseSessions = useCallback(() => {
    setActiveView('session-list');
  }, []);

  const handleBrowseLibrary = useCallback(() => {
    setActiveView('library');
  }, []);

  const handleSelectSession = useCallback((sessionId) => {
    setSessionState((prev) => setActiveSession(prev, sessionId));
    setActiveView('session');
    setCurrentView('dashboard');
  }, []);

  const v10AppearanceOptions = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
  ];

  const handleV10ThemeSelect = useCallback((key) => {
    setMode(key === 'light' ? 'light' : 'dark');
  }, [setMode]);

  const showDashboard = currentView === 'dashboard' || (!isEmptySession && activeView === 'session');

  return (
    <V10ThemeContext.Provider value={T}>
      <V10PageBackground marks={!showDashboard}>
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
          <SessionLeftNav
            sessionCount={sessionState.sessions.filter(
              (s) => s.threadKey || s.pendingThread || s.tabs.length > 0
            ).length}
            sessions={sessionState.sessions.filter(
              (s) => s.threadKey || s.pendingThread || s.tabs.length > 0
            )}
            onCreateSession={handleCreateSession}
            onBrowseSessions={handleBrowseSessions}
            onBrowseLibrary={handleBrowseLibrary}
            onSelectSession={handleSelectSession}
            activeView={activeView}
            isEmptySession={isEmptySession}
            appearanceOptions={v10AppearanceOptions}
            onThemeSelect={handleV10ThemeSelect}
            avatarName="John"
          />
          <div style={{ flex: 1, overflow: showDashboard ? 'hidden' : 'auto', display: 'flex' }}>
            {showDashboard ? (
              <V10DashboardContent mode={mode} setMode={setMode} onBack={() => setCurrentView('welcome')}/>
            ) : (
              <div style={{ flex: 1, overflow: 'auto' }}>
                <V10WelcomeContent mode={mode} setMode={setMode} onOpenDashboard={() => setCurrentView('dashboard')}/>
              </div>
            )}
          </div>
        </div>
      </V10PageBackground>
    </V10ThemeContext.Provider>
  );
}

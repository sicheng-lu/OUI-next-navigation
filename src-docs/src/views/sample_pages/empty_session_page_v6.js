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

import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import {
  OuiButtonIcon,
  OuiContextMenu,
  OuiIcon,
  OuiPopover,
  OuiTitle,
  OuiToolTip,
} from '../../../../src/components';

import { OuiAgenticSpinner } from '../../../../src/components/headless/agentic_spinner';
import { PagePanel } from './page_panel';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';

// ─── SurroundShimmer (copied from v3) ──────────────────────────────────────────

const SurroundShimmer = ({ children, hide }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);
  const fieldRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  if (hide) return <div style={{ width: '100%' }}>{children}</div>;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const isMobile = window.innerWidth <= 768;
    const SP = isMobile ? 5 : 7;
    const SPEED = isMobile ? 0.08 : 0.04;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return null;
      sizeRef.current = { w, h };
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.round((w - SP) / SP));
      const rows = Math.max(1, Math.round((h - SP) / SP));
      const ox = (w - (cols - 1) * SP) / 2, oy = (h - (rows - 1) * SP) / 2;
      const dots = [];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++)
          dots.push({ x: ox + i * SP, y: oy + j * SP, gx: i, gy: j, r: Math.random() });
      const field = { ctx, w, h, sp: SP, dots, cx: w / 2, cy: h / 2 };
      const box = cv.parentElement && cv.parentElement.querySelector('[data-surround-box]');
      if (box) {
        const cr = cv.getBoundingClientRect(), br = box.getBoundingClientRect();
        field.hole = { x0: br.left - cr.left, y0: br.top - cr.top, x1: br.right - cr.left, y1: br.bottom - cr.top };
      }
      return field;
    };

    const draw = (f, t) => {
      const { ctx, w, h, sp, dots } = f;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        let b = 0;
        const hl = f.hole;
        if (!hl) continue;
        if (d.x > hl.x0 && d.x < hl.x1 && d.y > hl.y0 && d.y < hl.y1) continue;
        const sdx = Math.max(hl.x0 - d.x, d.x - hl.x1, 0);
        const sdy = Math.max(hl.y0 - d.y, d.y - hl.y1, 0);
        const sdist = Math.hypot(sdx, sdy);
        const bcx = (hl.x0 + hl.x1) / 2, bcy = (hl.y0 + hl.y1) / 2;
        const sa = (Math.atan2(d.y - bcy, d.x - bcx) / 6.2832) + 0.5;
        const sph = (t * SPEED) % 1;
        const sdm = Math.min(Math.abs(sa - sph), 1 - Math.abs(sa - sph));
        const sph2 = (sph + 0.5) % 1;
        const sd2m = Math.min(Math.abs(sa - sph2), 1 - Math.abs(sa - sph2));
        const near = Math.exp(-Math.pow(sdist / (sp * 2.6), 2));
        const sg = Math.exp(-Math.pow(sdm * 6, 2)) + 0.4 * Math.exp(-Math.pow(sd2m * 6, 2));
        b = 0.07 * Math.exp(-Math.pow(sdist / (sp * 4.5), 2)) + 0.6 * sg * near;
        if (b < 0.01) continue;
        b = Math.max(0, Math.min(1, b));
        const a = (0.10 + 0.60 * b).toFixed(3);
        const r = Math.round(60 + 50 * b), g = Math.round(80 + 50 * b), bl = Math.round(200 + 40 * b);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.6 + b * 1.4, 0, 6.2832);
        ctx.fillStyle = `rgba(${r},${g},${bl},${a})`;
        ctx.fill();
      }
    };

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      // Rebuild if container resized
      const w = cv.clientWidth, h = cv.clientHeight;
      if (w !== sizeRef.current.w || h !== sizeRef.current.h) {
        fieldRef.current = build();
      }
      if (fieldRef.current) draw(fieldRef.current, t);
      rafRef.current = requestAnimationFrame(tick);
    };

    let timeout = setTimeout(() => {
      fieldRef.current = build();
      rafRef.current = requestAnimationFrame(tick);
    }, 100);

    return () => { clearTimeout(timeout); cancelAnimationFrame(rafRef.current); };
  }, []);

  const isMobileShimmer = typeof window !== 'undefined' && window.innerWidth <= 768;
  const hPad = isMobileShimmer ? 20 : 42;
  const vPad = isMobileShimmer ? 20 : 36;

  return (
    <div style={{ position: 'relative', padding: `${vPad}px ${hPad}px`, margin: `-${vPad}px -${hPad}px`, maxHeight: 200, alignSelf: 'center' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, maskImage: `radial-gradient(ellipse ${isMobileShimmer ? '55%' : '80%'} 80% at 50% 50%, black ${isMobileShimmer ? '30%' : '40%'}, transparent 100%)`, WebkitMaskImage: `radial-gradient(ellipse ${isMobileShimmer ? '55%' : '80%'} 80% at 50% 50%, black ${isMobileShimmer ? '30%' : '40%'}, transparent 100%)` }} />
      <div data-surround-box="1" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};



// ─── Scenario data ─────────────────────────────────────────────────────────────

const SCENARIOS = {
  1: {
    statusColor: 'green',
    greeting: 'Good morning, John!',
    summary: '<strong>244 of 247</strong> services healthy. Two anomalies resolved themselves overnight.',
    findings: [
      {
        key: 'resolved-anomalies',
        status: 'Resolved',
        statusColor: 'green',
        title: 'Two anomalies flagged overnight — both recovered on their own',
        widget: { type: 'status', label: 'recovered', color: '#0E6E52' },
        actions: [{ label: 'View details', key: 'see-queries' }],
      },
      {
        key: 'warning-groundedness',
        status: 'Warning',
        statusColor: 'amber',
        title: 'Groundedness drifting toward alert threshold (0.74, alerts at 0.70)',
        widget: { type: 'spark', label: '0.74', color: '#8A5A00' },
        actions: [{ label: 'See trend', key: 'see-trend' }, { label: 'Adjust threshold', key: 'adjust-threshold' }],
      },
      {
        key: 'info-routing',
        status: 'Review',
        statusColor: 'blue',
        title: '38% of simple queries hitting the expensive model — costs up 18%',
        widget: { type: 'bignum', value: '$410', delta: '↑18%', deltaColor: '#B5302E', sub: '/DAY' },
        actions: [{ label: 'Open runbook', key: 'open-runbook' }],
      },
    ],
  },
  2: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: '<strong>Active incident</strong> — checkout-agent is looping. Immediate action needed.',
    findings: [
      {
        key: 'critical-loop',
        status: 'Critical',
        statusColor: 'red',
        title: 'checkout-agent is looping — 1,994 retries in the last 6 minutes',
        widget: { type: 'bignum', value: '1,994', delta: 'retries', deltaColor: '#B5302E', sub: '6 MIN' },
        actions: [{ label: 'Investigate', key: 'investigate' }],
      },
      {
        key: 'critical-root-cause',
        status: 'Critical',
        statusColor: 'red',
        title: 'Root cause: order-db pool at 98%, handler returns 200 on empty',
        widget: { type: 'status', label: 'db 98%', color: '#B5302E' },
        actions: [{ label: 'View code', key: 'see-code' }, { label: 'View traces', key: 'open-trace' }],
      },
      {
        key: 'info-fixes',
        status: 'Review',
        statusColor: 'blue',
        title: 'Three fixes available: cap retries, raise pool, fix 200-on-empty',
        widget: { type: 'status', label: '3 fixes', color: '#1A5DA8' },
        actions: [
          { label: 'Page oncall', key: 'page-oncall' },
          { label: 'Open notebook', key: 'open-notebook' },
        ],
      },
    ],
  },
  3: {
    statusColor: 'red',
    greeting: 'Hey John,',
    summary: '<strong>billing-agent</strong> is giving inaccurate answers to customers. I need your decision.',
    findings: [
      {
        key: 'critical-billing',
        status: 'Critical',
        statusColor: 'red',
        title: 'billing-agent accuracy dropped to 0.58 — customers are affected',
        widget: { type: 'bignum', value: '0.58', delta: '↓0.23', deltaColor: '#B5302E', sub: 'SCORE' },
        actions: [{ label: 'Investigate', key: 'investigate' }],
      },
      {
        key: 'warning-causes',
        status: 'Warning',
        statusColor: 'amber',
        title: 'Two possible causes — prompt change vs stale index (52% / 48% likely)',
        widget: { type: 'status', label: '52 / 48', color: '#8A5A00' },
        actions: [{ label: 'Compare', key: 'open-notebook' }],
      },
      {
        key: 'info-tradeoff',
        status: 'Review',
        statusColor: 'blue',
        title: 'Rollback the prompt (fast, loses tuning) or reindex (20 min offline)',
        widget: { type: 'status', label: '2 options', color: '#1A5DA8' },
        actions: [{ label: 'Rollback now', key: 'rollback' }, { label: 'Page owner', key: 'page-owner' }],
      },
    ],
  },
  4: {
    statusColor: 'green',
    greeting: 'Good morning, John!',
    summary: '<strong>All services healthy.</strong> One quality regression worth reviewing.',
    findings: [
      {
        key: 'warning-tool-selection',
        status: 'Warning',
        statusColor: 'amber',
        title: 'Tool-selection accuracy dropped from 0.71 to 0.58 this week',
        widget: { type: 'bignum', value: '0.58', delta: '↓18%', deltaColor: '#B5302E', sub: 'ACCURACY' },
        actions: [{ label: 'Investigate', key: 'investigate' }],
      },
      {
        key: 'resolved-infra',
        status: 'Resolved',
        statusColor: 'green',
        title: 'Infrastructure is clean — all golden signals normal',
        widget: { type: 'status', label: 'all green', color: '#0E6E52' },
        actions: [],
      },
      {
        key: 'info-next-steps',
        status: 'Review',
        statusColor: 'blue',
        title: 'Likely correlated with Tuesday\'s prompt deploy — read-only analysis ready',
        widget: { type: 'status', label: 'ready', color: '#1A5DA8' },
        actions: [{ label: 'Run analysis', key: 'run-investigation' }],
      },
    ],
  },
  5: {
    statusColor: 'amber',
    greeting: 'Hey John,',
    summary: '<strong>Services healthy</strong>, but a familiar issue is back — 5th time in 30 days.',
    findings: [
      {
        key: 'warning-pattern',
        status: 'Warning',
        statusColor: 'amber',
        title: 'research-agent retry loop triggered again — same pattern as last 4 times',
        widget: { type: 'spark', label: '5th', color: '#8A5A00' },
        actions: [{ label: 'See pattern', key: 'see-pattern' }],
      },
      {
        key: 'info-root-cause',
        status: 'Review',
        statusColor: 'blue',
        title: 'Upstream returns 200 on empty instead of 404 — needs a permanent fix',
        widget: { type: 'status', label: 'code fix', color: '#1A5DA8' },
        actions: [
          { label: 'File issue', key: 'file-issue' },
          { label: 'Open notebook', key: 'open-notebook' },
        ],
      },
    ],
  },
};

// ─── Status pill component ─────────────────────────────────────────────────────

const STATUS_COLORS = {
  teal: { color: '#0F766E', bg: 'rgba(15, 118, 110, 0.10)' },
  green: { color: '#1F9D6B', bg: 'rgba(31, 157, 107, 0.10)' },
  purple: { color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.10)' },
  gray: { color: '#6B7280', bg: 'rgba(107, 114, 128, 0.08)' },
  amber: { color: '#B45309', bg: 'rgba(180, 83, 9, 0.10)' },
  red: { color: '#DC2626', bg: 'rgba(220, 38, 38, 0.10)' },
  blue: { color: '#2563EB', bg: 'rgba(37, 99, 235, 0.10)' },
};

const StatusPill = ({ status, color }) => {
  const scheme = STATUS_COLORS[color] || STATUS_COLORS.gray;
  return (
    <span
      className="v6Scenario__statusPill"
      style={{ color: scheme.color, backgroundColor: scheme.bg }}>
      {status}
    </span>
  );
};

// ─── Status dot for greeting ───────────────────────────────────────────────────

const StatusDot = ({ color }) => {
  const dotColors = {
    green: '#22c55e',
    red: '#ef4444',
    amber: '#f59e0b',
  };
  return (
    <span
      className="v6Scenario__statusDot"
      style={{ backgroundColor: dotColors[color] || dotColors.green }}
    />
  );
};

// ─── Dot countdown ring ───────────────────────────────────────────────────────

const DOT_COUNT = 12;
const RING_DURATION = 5000;

const DotCountdownRing = ({ startTime }) => {
  const [dotsRemaining, setDotsRemaining] = useState(DOT_COUNT);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DOT_COUNT - Math.floor((elapsed / RING_DURATION) * DOT_COUNT));
      setDotsRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, RING_DURATION / DOT_COUNT);
    return () => clearInterval(interval);
  }, [startTime]);

  const dots = [];
  for (let i = 0; i < DOT_COUNT; i++) {
    const angle = (i / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = 7 + Math.cos(angle) * 5;
    const y = 7 + Math.sin(angle) * 5;
    const isActive = i < dotsRemaining;
    dots.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={isActive ? 1 : 0.6}
        fill="currentColor"
        opacity={isActive ? 0.7 : 0.15}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      className="v6Scenario__dotCountdownRing">
      {dots}
    </svg>
  );
};

// ─── Jump-to chips ─────────────────────────────────────────────────────────────

const JUMP_TO_ITEMS = [
  { label: 'Logs', pageKey: 'logs', icon: 'navDiscover' },
  { label: 'Metrics', pageKey: 'metrics', icon: 'visArea' },
  { label: 'Dashboards', pageKey: 'dashboards', icon: 'navDashboards' },
  { label: 'Alerts', pageKey: 'alerts', icon: 'navAlerting' },
];

const PAGE_BROWSER_ITEMS = [
  { label: 'Logs', pageKey: 'logs', icon: 'navDiscover' },
  { label: 'Metrics', pageKey: 'metrics', icon: 'visArea' },
  { label: 'Dashboards', pageKey: 'dashboards', icon: 'navDashboards' },
  { label: 'Alerts', pageKey: 'alerts', icon: 'navAlerting' },
  { label: 'Application Map', pageKey: 'app-map', icon: 'navServiceMap' },
  { label: 'Application Services', pageKey: 'app-perf-services', icon: 'navOverview' },
  { label: 'Application Traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Forecasting', pageKey: 'forecasting', icon: 'visLine' },
  { label: 'Agent traces', pageKey: 'app-traces', icon: 'apmTrace' },
  { label: 'Agent spans', pageKey: 'agent-spans', icon: 'visTagCloud' },
];


// ─── Scenario-specific right panel evidence ───────────────────────────────────

const PPLBlock = ({ lines, result }) => (
  <div className="v6Scenario__ppl">
    {lines.map((line, i) => <div key={i}>{line}</div>)}
    {result && <div className="v6Scenario__pplResult">→ {result}</div>}
  </div>
);

const TraceSpan = ({ indent = 0, tag, tagColor, name, meta, bad }) => (
  <div className={`v6Scenario__traceSpan${bad ? ' v6Scenario__traceSpan--bad' : ''}`} style={{ paddingLeft: indent * 20 }}>
    <span className={`v6Scenario__traceTag v6Scenario__traceTag--${tagColor}`}>{tag}</span>
    <span className="v6Scenario__traceSpanName">{name}</span>
    <span className="v6Scenario__traceSpanMeta">{meta}</span>
  </div>
);

const EvidenceCard = ({ title, children }) => (
  <div className="v6Scenario__evidenceCard">
    {title && <div className="v6Scenario__evidenceCardTitle">{title}</div>}
    {children}
  </div>
);

const MetricBox = ({ label, value, sub, color }) => (
  <div className="v6Scenario__metricBox">
    <span className="v6Scenario__metricBoxLabel">{label}</span>
    <span className="v6Scenario__metricBoxValue" style={color ? { color } : undefined}>{value}</span>
    {sub && <span className="v6Scenario__metricBoxSub">{sub}</span>}
  </div>
);

const FindingEvidence = ({ scenario, findingKey }) => {
  const evidenceMap = {
    1: {
      'resolved-anomalies': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I checked the last 6 hours of traces. Two spikes stood out:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>search-tool</strong> — cold start at 03:14, recovered in 40s. No user impact.</li>
            <li><strong>triage-routing</strong> — brief drift at 04:22, returned to baseline on its own.</li>
          </ul>
          <p className="v6Scenario__evidenceText">No action needed. Both resolved before any alert threshold.</p>
        </div>
      ),
      'warning-groundedness': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Groundedness scores over the past 7 days:</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="7 days ago" value="0.81" />
              <MetricBox label="3 days ago" value="0.78" />
              <MetricBox label="Today" value="0.74" color="#B45309" />
              <MetricBox label="Alert at" value="0.70" color="#DC2626" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">At this rate, the alert will fire in ~2 days unless the trend reverses.</p>
        </div>
      ),
      'info-routing': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I analyzed cost by intent complexity over the past 24 hours:</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Simple intents" value="38%" sub="routed to GPT-4" color="#B45309" />
              <MetricBox label="Daily cost" value="$410" sub="up from $347" color="#DC2626" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">These could route to the lighter model with no quality loss. The runbook has the routing rules.</p>
        </div>
      ),
    },
    2: {
      'critical-loop': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">checkout-agent has called <code>order-lookup</code> 1,994 times in 6 minutes. Each call returns 200 with an empty body, so the agent retries indefinitely.</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Calls" value="1,994" color="#DC2626" />
              <MetricBox label="Duration" value="6 min" />
              <MetricBox label="Status" value="200" sub="empty body" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">Customer-facing checkout is degraded. The loop is ongoing.</p>
        </div>
      ),
      'critical-root-cause': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I traced it from the agent down to the database:</p>
          <EvidenceCard>
            <div className="v6Scenario__trace">
              <TraceSpan tag="agent" tagColor="accent" name="checkout-agent" meta="looping" />
              <TraceSpan indent={1} tag="tool" tagColor="tool" name="order-lookup" meta="200 + empty" bad />
              <TraceSpan indent={2} tag="http" tagColor="infra" name="order-service" meta="p99 2,340ms" bad />
              <TraceSpan indent={3} tag="db" tagColor="infra" name="order-db" meta="pool 98%" bad />
              <TraceSpan indent={3} tag="code" tagColor="infra" name="handler.go:88" meta="returns 200 on miss" bad />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">The database pool is nearly exhausted, and the handler returns 200 even when no record is found — the agent interprets this as "try again."</p>
        </div>
      ),
      'info-fixes': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Three fixes, from fastest to most permanent:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>Cap retries</strong> — runtime config change, stops the bleeding immediately</li>
            <li><strong>Raise db pool</strong> — infra change, prevents pool exhaustion under load</li>
            <li><strong>Fix handler.go:88</strong> — return 404 on empty, eliminates the root cause</li>
          </ul>
        </div>
      ),
    },
    3: {
      'critical-billing': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">billing-agent&apos;s accuracy dropped sharply after today&apos;s 14:02 deploy:</p>
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Groundedness" value="0.58" sub="was 0.81" color="#DC2626" />
              <MetricBox label="Citation match" value="0.31" sub="was 0.72" color="#DC2626" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">The agent is giving customers billing answers that don&apos;t match source documents. 340 conversations affected so far.</p>
        </div>
      ),
      'warning-causes': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I narrowed it to two possible causes:</p>
          <EvidenceCard>
            <div className="v6Scenario__hypothesis">
              <div className="v6Scenario__hypothesisHeader">
                <span>A — Prompt change at 14:02</span>
                <span className="v6Scenario__verdict">52% likely</span>
              </div>
              <p className="v6Scenario__evidenceText">Scores dropped 8 minutes after the deploy. The new prompt removes citation instructions.</p>
            </div>
            <div className="v6Scenario__hypothesis">
              <div className="v6Scenario__hypothesisHeader">
                <span>B — Stale retrieval index</span>
                <span className="v6Scenario__verdict">48% likely</span>
              </div>
              <p className="v6Scenario__evidenceText">The docs index hasn&apos;t been refreshed in 26 hours. New billing policies aren&apos;t in the index.</p>
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">Neither hypothesis is conclusive — I can&apos;t rule one out without your input.</p>
        </div>
      ),
      'info-tradeoff': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Two paths forward:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>Rollback the prompt</strong> — fast, but loses today&apos;s tuning work</li>
            <li><strong>Reindex docs</strong> — takes the agent offline ~20 min, but preserves the new prompt</li>
          </ul>
          <p className="v6Scenario__evidenceText">Either fixes it if that&apos;s the actual cause. Only you can weigh the trade-off.</p>
        </div>
      ),
    },
    4: {
      'warning-tool-selection': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">Tool-selection accuracy by path this week:</p>
          <EvidenceCard>
            <div className="v6Scenario__pathBreakdown">
              <div className="v6Scenario__pathRow">
                <span className="v6Scenario__pathName">lookup</span>
                <span className="v6Scenario__pathBar"><span className="v6Scenario__pathFill" style={{ width: '51%', background: '#DC2626' }} /></span>
                <span className="v6Scenario__pathVal">0.51</span>
              </div>
              <div className="v6Scenario__pathRow">
                <span className="v6Scenario__pathName">route</span>
                <span className="v6Scenario__pathBar"><span className="v6Scenario__pathFill" style={{ width: '62%', background: '#B45309' }} /></span>
                <span className="v6Scenario__pathVal">0.62</span>
              </div>
              <div className="v6Scenario__pathRow">
                <span className="v6Scenario__pathName">summarize</span>
                <span className="v6Scenario__pathBar"><span className="v6Scenario__pathFill" style={{ width: '69%', background: '#5B4FCF' }} /></span>
                <span className="v6Scenario__pathVal">0.69</span>
              </div>
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">The lookup path is the worst performer. It correlates with Tuesday&apos;s prompt deploy window.</p>
        </div>
      ),
      'resolved-infra': (
        <div className="v6Scenario__evidence">
          <EvidenceCard>
            <div className="v6Scenario__metricRow">
              <MetricBox label="Throughput" value="9.6k" sub="steady" />
              <MetricBox label="p99" value="175ms" sub="steady" />
              <MetricBox label="Errors" value="0.1%" sub="steady" color="#1F9D6B" />
            </div>
          </EvidenceCard>
          <p className="v6Scenario__evidenceText">All golden signals are normal. This is a model/prompt issue, not infrastructure.</p>
        </div>
      ),
      'info-next-steps': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">I prepared a read-only analysis that will:</p>
          <ul className="v6Scenario__evidenceList">
            <li>Correlate the per-path accuracy drop to the prompt deploy window</li>
            <li>Pull tool-selection traces for the lookup path</li>
            <li>Produce a notebook with findings — no changes, just evidence</li>
          </ul>
        </div>
      ),
    },
    5: {
      'warning-pattern': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">This is the 5th time in 30 days that research-agent has entered this retry loop. Same pattern every time:</p>
          <ul className="v6Scenario__evidenceList">
            <li>Agent calls web-fetch for a resource</li>
            <li>Upstream returns 200 with empty body</li>
            <li>Agent interprets this as "not done yet" and retries</li>
          </ul>
          <p className="v6Scenario__evidenceText">Each occurrence was patched individually. The underlying cause has never been fixed.</p>
        </div>
      ),
      'info-root-cause': (
        <div className="v6Scenario__evidence">
          <p className="v6Scenario__evidenceText">The fix needs to happen upstream:</p>
          <ul className="v6Scenario__evidenceList">
            <li><strong>Upstream (data team)</strong> — should return 404 on miss, not 200</li>
            <li><strong>Client workaround</strong> — treat empty 200 as terminal in client.ts:40</li>
          </ul>
          <p className="v6Scenario__evidenceText">This is the 5th symptomatic patch. Filing an issue to the data team would prevent recurrence.</p>
        </div>
      ),
    },
  };

  const scenarioEvidence = evidenceMap[scenario];
  if (!scenarioEvidence) return null;
  const content = scenarioEvidence[findingKey];
  if (!content) return null;
  return content;
};

// ─── Main component ────────────────────────────────────────────────────────────

export const EmptySessionPageV6 = ({
  onStartThread,
  onOpenPage,
  onOpenPageInNewSession,
  onSelectSession,
  onBrowseLibrary,
  onOpenMobileNav,
  layout,
  sessions = [],
}) => {
  const isSingleColumn = layout === 'single-column';
  const [scenario] = useState(() => Math.floor(Math.random() * 5) + 1);
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [inputValue, setInputValue] = useState('');
  const [mascotExpression, setMascotExpression] = useState(undefined);
  const [rightPanelWidth, setRightPanelWidth] = useState(50);
  const resizeRef = useRef(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [showPageBrowser, setShowPageBrowser] = useState(false);
  const [pageBrowserSearch, setPageBrowserSearch] = useState('');
  const [expandedFindings, setExpandedFindings] = useState(() => new Set());
  const [dismissedFindings, setDismissedFindings] = useState({});
  const [removedFindings, setRemovedFindings] = useState(() => new Set());
  const [feedbackFindings, setFeedbackFindings] = useState({});
  const dismissTimersRef = useRef({});

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [findingsLoaded, setFindingsLoaded] = useState(0);

  const scenarioData = SCENARIOS[scenario] || SCENARIOS[1];

  // Staggered agentic loading: summary first, then findings one by one
  useEffect(() => {
    const summaryDelay = isSingleColumn ? 600 : (1000 + Math.random() * 2000);
    const summaryTimer = setTimeout(() => {
      setSummaryLoading(false);
    }, summaryDelay);

    const findingCount = scenarioData.findings.length;
    const findingTimers = [];
    for (let i = 0; i < findingCount; i++) {
      const findingGap = isSingleColumn ? (600 + Math.random() * 400) : (1000 + Math.random() * 1500);
      const delay = summaryDelay + (isSingleColumn ? 400 : 800) + (i * findingGap);
      findingTimers.push(setTimeout(() => {
        setFindingsLoaded((prev) => prev + 1);
      }, delay));
    }

    return () => {
      clearTimeout(summaryTimer);
      findingTimers.forEach(clearTimeout);
    };
  }, []);


  const toggleFinding = (key) => {
    if (key in dismissedFindings) return;
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const dismissFinding = (key) => {
    const dismissedAt = Date.now();
    setDismissedFindings((prev) => ({ ...prev, [key]: dismissedAt }));
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    dismissTimersRef.current[key] = setTimeout(() => {
      setRemovedFindings((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      setDismissedFindings((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      delete dismissTimersRef.current[key];
    }, 5000);
  };

  const undoDismissFinding = (key) => {
    if (dismissTimersRef.current[key]) {
      clearTimeout(dismissTimersRef.current[key]);
      delete dismissTimersRef.current[key];
    }
    setDismissedFindings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setFeedback = (key, direction) => {
    setFeedbackFindings((prev) => {
      if (prev[key] === direction) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: direction };
    });
  };

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    const twoCol = e.target.closest('.v6Scenario__twoCol');
    if (!twoCol) return;
    const startX = e.clientX;
    const startWidth = rightPanelWidth;
    const totalWidth = twoCol.getBoundingClientRect().width;

    const onMove = (ev) => {
      const delta = startX - ev.clientX;
      const pctDelta = (delta / totalWidth) * 100;
      const next = Math.min(70, Math.max(25, startWidth + pctDelta));
      setRightPanelWidth(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [rightPanelWidth]);

  const buildInsightsContext = () => {
    const loadedFindings = scenarioData.findings.slice(0, findingsLoaded);
    if (!loadedFindings.length) return null;
    const lines = loadedFindings.map((f) => `• **${f.status}**: ${f.title}`);
    return `${scenarioData.summary.replace(/<[^>]+>/g, '')}\n\n${lines.join('\n')}`;
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (onStartThread) onStartThread(inputValue.trim(), buildInsightsContext());
      setInputValue('');
    }
  };

  return (
    <div className={`v6Scenario${isSingleColumn ? ' v6Scenario--singleColumn' : ''}`}>
      {/* Mobile menu — floating top-left, visible at <= 768px */}
      <button
        type="button"
        className="v6Scenario__mobileMenuBtn"
        onClick={() => onOpenMobileNav && onOpenMobileNav()}
        aria-label="Open menu">
        <OuiIcon type="menu" size="m" />
      </button>


      <div className="v6Scenario__twoCol">
        {/* Left column */}
        <div className="v6Scenario__leftCol">
          {/* Mascot */}
          <div className="v6Scenario__mascotRow">
            <OuiToolTip content="Hi, I'm Olly" position="right">
              <div
                className="v6Scenario__mascotWrap"
                onMouseEnter={() => setMascotExpression('happy')}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.85)';
                  setMascotExpression('heart');
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  setMascotExpression('happy');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  setMascotExpression(undefined);
                }}>
                <Mascot
                  size={24}
                  expression={mascotExpression}
                  idle={!mascotExpression}
                  bob
                  follow
                  color={mascotColor}
                  eyeColor={mascotEyeColor}
                />
              </div>
            </OuiToolTip>
            <StatusDot color={scenarioData.statusColor} />
          </div>

          {/* Greeting */}
          <OuiTitle size="m" className="v6Scenario__title">
            <h1>{scenarioData.greeting}</h1>
          </OuiTitle>
          {summaryLoading ? (
            <div className="v6Scenario__summaryLoader">
              <OuiAgenticSpinner size="s" />
            </div>
          ) : (
            <p className="v6Scenario__summary" dangerouslySetInnerHTML={{ __html: scenarioData.summary }} />
          )}

          {/* Inline findings */}
          {!summaryLoading && isSingleColumn && (
            <div className="v6Scenario__findings v6Scenario__findings--inline">
              {scenarioData.findings.map((finding, findingIndex) => {
                if (findingIndex >= findingsLoaded) return null;
                if (removedFindings.has(finding.key)) return null;
                const isDismissed = finding.key in dismissedFindings;
                const isExpanded = expandedFindings.has(finding.key);
                const feedback = feedbackFindings[finding.key];

                if (isDismissed) {
                  return (
                    <div key={finding.key} className="v6Scenario__findingCard v6Scenario__findingCard--dismissed">
                      <div className="v6Scenario__findingCardMain">
                        <div className="v6Scenario__findingCardLeft">
                          <span className="v6Scenario__findingDismissedText">
                            {finding.title}
                          </span>
                        </div>
                        <div className="v6Scenario__findingCardRight">
                          <DotCountdownRing startTime={dismissedFindings[finding.key]} />
                          <button
                            type="button"
                            className="v6Scenario__findingUndoBtn"
                            onClick={(e) => { e.stopPropagation(); undoDismissFinding(finding.key); }}>
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={finding.key} className={`v6Scenario__findingCard${isExpanded ? ' v6Scenario__findingCard--expanded' : ''}`} onClick={() => toggleFinding(finding.key)}>
                    <div className="v6Scenario__findingCardMain">
                      <div className="v6Scenario__findingCardLeft">
                        <div className="v6Scenario__findingHeader">
                          <StatusPill status={finding.status} color={finding.statusColor} />
                          <span className="v6Scenario__findingTitle">{finding.title}</span>
                        </div>
                      </div>
                      <div className="v6Scenario__findingCardRight">
                        {finding.widget && finding.widget.type === 'status' && (
                          <div className="v6Scenario__findingWidget">
                            <span className="v6Scenario__fwDot" style={{ background: finding.widget.color }} />
                            <span className="v6Scenario__fwLabel">{finding.widget.label}</span>
                          </div>
                        )}
                        {finding.widget && finding.widget.type === 'spark' && (
                          <div className="v6Scenario__findingWidget">
                            <svg viewBox="0 0 60 20" className="v6Scenario__fwSpark">
                              <defs>
                                <pattern id={`spark-stripe-sc-${finding.key}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                  <line x1="0" y1="0" x2="0" y2="4" stroke={finding.widget.color} strokeWidth="1" opacity="0.35" />
                                </pattern>
                              </defs>
                              <path d="M0,4 L15,6 L30,8 L45,12 L60,18 L60,20 L0,20 Z" fill={`url(#spark-stripe-sc-${finding.key})`} />
                              <polyline points="0,4 15,6 30,8 45,12 60,18" fill="none" stroke={finding.widget.color} strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="v6Scenario__fwSubLabel">{finding.widget.label}</span>
                          </div>
                        )}
                        {finding.widget && finding.widget.type === 'bignum' && (
                          <div className="v6Scenario__findingWidget">
                            <span className="v6Scenario__fwBignum">{finding.widget.value}</span>
                            {finding.widget.delta && (
                              <span className="v6Scenario__fwDelta" style={{ color: finding.widget.deltaColor }}>{finding.widget.delta}</span>
                            )}
                            {finding.widget.sub && (
                              <span className="v6Scenario__fwSubLabel">{finding.widget.sub}</span>
                            )}
                          </div>
                        )}
                        <OuiIcon type="arrowDown" size="s" className={`v6Scenario__findingChevron${isExpanded ? ' v6Scenario__findingChevron--expanded' : ''}`} />
                      </div>
                    </div>
                    <div className={`v6Scenario__findingActions__side${isExpanded ? ' v6Scenario__findingActions__side--visible' : ''}`}>
                      {isExpanded && (
                        <>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'up' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'up'); }}>
                            <OuiIcon type="thumbsUp" size="s" />
                          </button>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'down' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Not helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'down'); }}>
                            <OuiIcon type="thumbsDown" size="s" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="v6Scenario__findingSideBtn"
                        aria-label="Dismiss"
                        onClick={(e) => { e.stopPropagation(); dismissFinding(finding.key); }}>
                        <OuiIcon type="cross" size="s" />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="v6Scenario__findingCardBody">
                        <FindingEvidence scenario={scenario} findingKey={finding.key} />
                        {finding.actions && finding.actions.length > 0 && (
                          <div className="v6Scenario__findingActions">
                            {finding.actions.map((action) => (
                              <button
                                key={action.key}
                                type="button"
                                className="v6Scenario__findingAction"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onStartThread) onStartThread(action.label);
                                }}>
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {findingsLoaded < scenarioData.findings.length && (
                <div className="v6Scenario__findingsLoader">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
            </div>
          )}
          {!summaryLoading && !isSingleColumn && (
            <div className="v6Scenario__findings v6Scenario__findings--inline">
              {scenarioData.findings.map((finding, findingIndex) => {
                if (findingIndex >= findingsLoaded) return null;
                if (removedFindings.has(finding.key)) return null;
                const isDismissed = finding.key in dismissedFindings;
                const isExpanded = expandedFindings.has(finding.key);
                const feedback = feedbackFindings[finding.key];

                if (isDismissed) {
                  return (
                    <div key={finding.key} className="v6Scenario__findingCard v6Scenario__findingCard--dismissed">
                      <div className="v6Scenario__findingCardMain">
                        <div className="v6Scenario__findingCardLeft">
                          <span className="v6Scenario__findingDismissedText">
                            {finding.title}
                          </span>
                        </div>
                        <div className="v6Scenario__findingCardRight">
                          <DotCountdownRing startTime={dismissedFindings[finding.key]} />
                          <button
                            type="button"
                            className="v6Scenario__findingUndoBtn"
                            onClick={() => undoDismissFinding(finding.key)}>
                            Undo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={finding.key} className={`v6Scenario__findingCard${isExpanded ? ' v6Scenario__findingCard--expanded' : ''}`} onClick={() => toggleFinding(finding.key)}>
                    <div className="v6Scenario__findingCardMain">
                      <div className="v6Scenario__findingCardLeft">
                        <div className="v6Scenario__findingHeader">
                          <StatusPill status={finding.status} color={finding.statusColor} />
                          <span className="v6Scenario__findingTitle">{finding.title}</span>
                        </div>
                      </div>
                      <div className="v6Scenario__findingCardRight">
                        {finding.widget && finding.widget.type === 'status' && (
                          <div className="v6Scenario__findingWidget">
                            <span className="v6Scenario__fwDot" style={{ background: finding.widget.color }} />
                            <span className="v6Scenario__fwLabel">{finding.widget.label}</span>
                          </div>
                        )}
                        {finding.widget && finding.widget.type === 'spark' && (
                          <div className="v6Scenario__findingWidget">
                            <svg viewBox="0 0 60 20" className="v6Scenario__fwSpark">
                              <defs>
                                <pattern id={`spark-stripe-${finding.key}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                  <line x1="0" y1="0" x2="0" y2="4" stroke={finding.widget.color} strokeWidth="1" opacity="0.35" />
                                </pattern>
                              </defs>
                              <path d="M0,4 L15,6 L30,8 L45,12 L60,18 L60,20 L0,20 Z" fill={`url(#spark-stripe-${finding.key})`} />
                              <polyline points="0,4 15,6 30,8 45,12 60,18" fill="none" stroke={finding.widget.color} strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="v6Scenario__fwSubLabel">{finding.widget.label}</span>
                          </div>
                        )}
                        {finding.widget && finding.widget.type === 'bignum' && (
                          <div className="v6Scenario__findingWidget">
                            <span className="v6Scenario__fwBignum">{finding.widget.value}</span>
                            {finding.widget.delta && (
                              <span className="v6Scenario__fwDelta" style={{ color: finding.widget.deltaColor }}>{finding.widget.delta}</span>
                            )}
                            {finding.widget.sub && (
                              <span className="v6Scenario__fwSubLabel">{finding.widget.sub}</span>
                            )}
                          </div>
                        )}
                        <OuiIcon type="arrowDown" size="s" className={`v6Scenario__findingChevron${isExpanded ? ' v6Scenario__findingChevron--expanded' : ''}`} />
                      </div>
                    </div>
                    <div className={`v6Scenario__findingActions__side${isExpanded ? ' v6Scenario__findingActions__side--visible' : ''}`}>
                      {isExpanded && (
                        <>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'up' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'up'); }}>
                            <OuiIcon type="thumbsUp" size="s" />
                          </button>
                          <button
                            type="button"
                            className={`v6Scenario__findingSideBtn${feedback === 'down' ? ' v6Scenario__findingSideBtn--active' : ''}`}
                            aria-label="Not helpful"
                            onClick={(e) => { e.stopPropagation(); setFeedback(finding.key, 'down'); }}>
                            <OuiIcon type="thumbsDown" size="s" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="v6Scenario__findingSideBtn"
                        aria-label="Dismiss"
                        onClick={(e) => { e.stopPropagation(); dismissFinding(finding.key); }}>
                        <OuiIcon type="cross" size="s" />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="v6Scenario__findingCardBody">
                        <FindingEvidence scenario={scenario} findingKey={finding.key} />
                        {finding.actions && finding.actions.length > 0 && (
                          <div className="v6Scenario__findingActions">
                            {finding.actions.map((action) => (
                              <button
                                key={action.key}
                                type="button"
                                className="v6Scenario__findingAction"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onStartThread) onStartThread(action.label);
                                }}>
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {findingsLoaded < scenarioData.findings.length && (
                <div className="v6Scenario__findingsLoader">
                  <OuiAgenticSpinner size="s" />
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="v6Scenario__inputArea">
            <SurroundShimmer hide={false}>
              <div className="emptySessionPage__inputField">
                <textarea
                  className="v6Scenario__textarea"
                  placeholder="Ask AI anything, or type to search a page"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleSubmit}
                  rows={3}
                  autoFocus
                />
                <div className="emptySessionPage__inputActions">
                  <OuiPopover
                    button={
                      <OuiButtonIcon
                        iconType="plus"
                        aria-label="Add attachment"
                        size="xs"
                        color="text"
                        onClick={() => setIsAttachMenuOpen((open) => !open)}
                      />
                    }
                    isOpen={isAttachMenuOpen}
                    closePopover={() => setIsAttachMenuOpen(false)}
                    anchorPosition="upLeft"
                    panelPaddingSize="s">
                    <OuiContextMenu
                      initialPanelId={0}
                      panels={[
                        {
                          id: 0,
                          items: [
                            { name: 'Upload data', icon: 'importAction', onClick: () => setIsAttachMenuOpen(false) },
                            { name: 'Upload file or photo', icon: 'document', onClick: () => setIsAttachMenuOpen(false) },
                            { name: 'Take screenshot', icon: 'fullScreen', onClick: () => setIsAttachMenuOpen(false) },
                            { name: 'Add to session', icon: 'folderOpen', onClick: () => setIsAttachMenuOpen(false) },
                          ],
                        },
                      ]}
                    />
                  </OuiPopover>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <OuiButtonIcon
                      iconType={() => (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><rect x="9" y="2" width="6" height="13" rx="3" />
                        </svg>
                      )}
                      aria-label="Dictate"
                      size="xs"
                      color="text"
                      display="empty"
                    />
                    <OuiButtonIcon
                      iconType="sortUp"
                      aria-label="Send"
                      display="fill"
                      size="xs"
                      isDisabled={!inputValue.trim()}
                      onClick={() => {
                        if (inputValue.trim() && onStartThread) {
                          onStartThread(inputValue.trim(), buildInsightsContext());
                          setInputValue('');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </SurroundShimmer>
          </div>

          {/* Jump-to chips */}
          <div className="v6Scenario__jumpTo">
            <span className="v6Scenario__jumpToLabel">Jump to</span>
            {JUMP_TO_ITEMS.map((item) => (
              <button
                key={item.pageKey}
                type="button"
                className="v6Scenario__jumpToChip"
                onClick={() => onOpenPageInNewSession && onOpenPageInNewSession(item.pageKey, item.label)}>
                <OuiIcon type={item.icon} size="s" />
                <span>{item.label}</span>
              </button>
            ))}
            <OuiToolTip content="More" position="top">
              <button
                type="button"
                className="v6Scenario__jumpToChip v6Scenario__jumpToChip--round"
                onClick={() => setShowPageBrowser(true)}>
                <OuiIcon type="plusInCircle" size="s" />
              </button>
            </OuiToolTip>
          </div>
        </div>

        {/* Resize handle */}
        {!isSingleColumn && (
        <div
          className="v6Scenario__resizeHandle"
          onMouseDown={handleResizeMouseDown}
          ref={resizeRef}
        />
        )}

        {/* Right column */}
        {!isSingleColumn && (
        <div
          className="v6Scenario__rightCol"
          style={{ flex: `0 0 ${rightPanelWidth}%` }}>
          <PagePanel
            tabs={[{ id: 'tab-overview-home', pageKey: 'overview-home', title: 'Overview' }]}
            activeTabId="tab-overview-home"
            onTabSelect={() => {}}
            onTabClose={() => {}}
            onAddTab={() => {}}
            onSelectPage={() => {}}
          />
        </div>
        )}
      </div>
    </div>
  );
};

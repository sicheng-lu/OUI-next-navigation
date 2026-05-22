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

import React, { useState, useMemo } from 'react';

import {
  OuiIcon,
  OuiTab,
  OuiTabs,
} from '../../../../src/components';

import { SOURCE_PAGE_MOCK } from './session_models';
// Mascot placeholder - inline OpenSearch logo
const OpenSearchMascot = ({ size = 28, expression = 'comma' }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <defs>
      <linearGradient id="mascotGrad" x1="40" y1="80" x2="40" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#153A5A" />
        <stop offset="1" stopColor="#14558E" />
      </linearGradient>
      <radialGradient id="mascotHL" cx="0.3" cy="0.25" r="0.6">
        <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
        <stop offset="1" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    <circle cx="40" cy="40" r="39.5" fill="url(#mascotGrad)" />
    <ellipse cx="28" cy="22" rx="22" ry="14" fill="url(#mascotHL)" />
    {expression === 'wow' ? (
      /* Big open eyes — attention/needs input, OpenSearch brand colors */
      <g>
        <circle cx="30" cy="38" r="13" fill="#fff" />
        <circle cx="30" cy="39" r="7.5" fill="#003B4F" />
        <circle cx="50" cy="38" r="13" fill="#fff" />
        <circle cx="50" cy="39" r="7.5" fill="#005EB8" />
      </g>
    ) : (
      /* Default comma eyes */
      <g transform="translate(48, 31) scale(1) translate(-48, -31)">
        <path d="M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z" fill="#fff" />
        <path d="M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z" fill="#fff" />
      </g>
    )}
  </svg>
);

/**
 * Quick access shortcut definitions.
 * Maps to existing OUI icon assets.
 */

/**
 * Filter chips for the bottom section.
 */
const FILTER_CHIPS = [
  { key: 'activity', label: 'Activity', icon: 'generate' },
  { key: 'recent', label: 'Recent', icon: 'clock' },
  { key: 'favorite', label: 'Favorite', icon: 'starEmpty' },
  { key: 'discover', label: 'Discover', icon: 'navDiscover' },
  { key: 'monitor', label: 'Monitor', icon: 'navAlerting' },
  { key: 'more', label: 'More', icon: 'apps' },
];

/**
 * Mock data for each filter chip.
 */
const CHIP_DATA = {
  activity: [
    {
      key: 'insight-1',
      title: 'Latency Spike Investigation',
      subtitle: 'Created by AI · 15 min ago',
      summary: 'Payment-service P99 crossed 2,000ms. Connection pool exhaustion identified on 3 of 4 pods with no recent deployments.',
      meta: 'Alert: Payment service P99 latency breach',
      icon: 'alert',
      sessionId: 'latency-spike-session',
      source: 'ai',
      severity: 'alert',
      priority: 'P1',
      service: 'payment-svc',
      scope: '3 of 4 pods',
      confidence: 92,
      trend: 'still climbing',
      age: '15 min ago',
    },
    {
      key: 'insight-2',
      title: 'Error Rate Spike — Checkout Service',
      subtitle: 'Shared by team · 2 hours ago',
      summary: 'Checkout error rate jumped to 12.4%. Auth-service deployment regression identified — OIDC token validation timing out.',
      meta: 'Shared from Sichen',
      icon: 'user',
      sessionId: 'error-rate-spike-session',
      source: 'team',
      sharedBy: 'Sicheng L',
      severity: 'normal',
      priority: 'P2',
      service: 'checkout-svc',
      scope: 'auth-svc deploy',
      age: '2 hours ago',
      detail: 'linked to auth-svc rollout',
    },
  ],
  recent: [
    { key: 'dash-1', title: 'System overview', subtitle: 'Dashboard · Updated 5 min ago' },
    { key: 'log-5', title: 'Connection timeout errors', subtitle: 'Saved log · source=logs | where severity="ERROR"' },
    { key: 'met-2', title: 'CPU utilization', subtitle: 'Saved metric · Updated 30 min ago' },
    { key: 'dash-4', title: 'Payment service — connection pool', subtitle: 'Dashboard · Created from thread' },
  ],
  favorite: [
    { key: 'fav-1', title: 'System overview', subtitle: 'Dashboard', pageKey: 'dashboards', typeIcon: 'navDashboards' },
    { key: 'fav-2', title: 'Error rate by service', subtitle: 'Saved log', pageKey: 'logs', typeIcon: 'navDiscover' },
    { key: 'fav-3', title: 'API performance', subtitle: 'Dashboard', pageKey: 'dashboards', typeIcon: 'navDashboards' },
    { key: 'fav-4', title: 'CPU utilization', subtitle: 'Saved metric', pageKey: 'metrics', typeIcon: 'visArea' },
    { key: 'fav-5', title: 'Payment service timeout logs', subtitle: 'Saved log', pageKey: 'logs', typeIcon: 'navDiscover' },
  ],
  discover: [
    { key: 'log-1', title: 'Error rate by service', subtitle: 'source=logs | where level="ERROR"' },
    { key: 'log-2', title: 'Auth failure events', subtitle: 'source=logs | where event="auth_fail"' },
    { key: 'log-3', title: 'Slow query log', subtitle: 'source=logs | where duration > 5000' },
    { key: 'log-4', title: 'Payment service timeout logs', subtitle: 'source=payment | where level="WARN"' },
    { key: 'log-5b', title: 'Connection timeout errors', subtitle: 'source=logs | where severity="ERROR"' },
  ],
  monitor: [
    { key: 'alert-1', title: 'CPU threshold exceeded', subtitle: 'Critical · 10 min ago' },
    { key: 'alert-2', title: 'Disk usage warning', subtitle: 'Warning · 1 hour ago' },
    { key: 'alert-3', title: 'Error rate spike', subtitle: 'Critical · 3 hours ago' },
    { key: 'alert-4', title: 'Payment service P99 latency breach', subtitle: 'Critical · 15 min ago', meta: 'Active', icon: 'alert' },
  ],
  more: [
    { key: 'other-1', title: 'Inventory service dependency map', subtitle: 'Notebook · Updated 2 hours ago' },
    { key: 'other-2', title: 'Weekly capacity report', subtitle: 'Notebook · Updated 1 day ago' },
    { key: 'other-3', title: 'Deployment rollback runbook', subtitle: 'Notebook · Updated 3 days ago' },
  ],
};

/**
 * Saved objects data for the bottom section when a quick access item is selected.
 */
const SAVED_OBJECTS = {
  dashboards: {
    items: [
      { key: 'system-overview', title: 'System overview', subtitle: 'Updated 5 min ago' },
      { key: 'web-traffic', title: 'Web traffic analytics', subtitle: 'Updated 15 min ago' },
      { key: 'api-performance', title: 'API performance', subtitle: 'Updated 30 min ago' },
      { key: 'payment-pool-dashboard', title: 'Payment service — connection pool', subtitle: 'Created from thread · just now' },
    ],
  },
  logs: {
    tabs: [
      { id: 'saved-results', name: 'Saved results' },
      { id: 'saved-query', name: 'Saved query' },
    ],
    tabItems: {
      'saved-results': [
        { key: 'error-rate', title: 'Error rate by service', subtitle: 'source=logs | where level="ERROR"' },
        { key: 'auth-failures', title: 'Auth failure events', subtitle: 'source=logs | where event="auth_fail"' },
        { key: 'slow-queries', title: 'Slow query log', subtitle: 'source=logs | where duration > 5000' },
        { key: 'payment-timeout-logs', title: 'Payment service timeout logs', subtitle: 'source=payment | where level="WARN"' },
        { key: 'connection-timeout-errors', title: 'Connection timeout errors', subtitle: 'source=logs | where severity="ERROR"' },
      ],
      'saved-query': [
        { key: 'query-latency-by-host', title: 'Latency by host', subtitle: 'source=logs | stats avg(latency) by host' },
        { key: 'query-5xx-responses', title: '5xx responses', subtitle: 'source=logs | where status >= 500 | stats count() by path' },
        { key: 'query-top-users', title: 'Top users by request count', subtitle: 'source=logs | stats count() as requests by user' },
      ],
    },
  },
  metrics: {
    tabs: [
      { id: 'saved-results', name: 'Saved results' },
      { id: 'saved-query', name: 'Saved query' },
    ],
    tabItems: {
      'saved-results': [
        { key: 'throughput', title: 'Throughput over time', subtitle: 'source=metrics | stats avg(throughput)' },
        { key: 'cpu-utilization', title: 'CPU utilization', subtitle: 'source=metrics | stats avg(cpu) by host' },
        { key: 'memory-pressure', title: 'Memory pressure', subtitle: 'source=metrics | stats max(mem_used)' },
      ],
      'saved-query': [
        { key: 'query-disk-io', title: 'Disk I/O by volume', subtitle: 'source=metrics | stats avg(disk_io) by volume' },
        { key: 'query-network-errors', title: 'Network error rate', subtitle: 'source=metrics | where net_errors > 0' },
        { key: 'query-gc-pauses', title: 'GC pause duration', subtitle: 'source=metrics | stats max(gc_pause_ms) by service' },
      ],
    },
  },
};

/**
 * SystemCallout — Displays a system alert with red left border and pink background.
 *
 * @param {Object} props
 * @param {import('./session_models').SystemAlert} props.alert
 * @param {(pageKey: string) => void} props.onAction
 */
const SystemCallout = ({ alert, onAction }) => {
  if (!alert) return null;

  return (
    <div className="uiPolish__callout" role="alert">
      <div className="uiPolish__calloutBorder" />
      <div className="uiPolish__calloutContent">
        <p className="uiPolish__calloutText">{alert.message}</p>
        <button
          type="button"
          className="uiPolish__calloutCta"
          onClick={() => onAction(alert.actionTarget)}>
          {alert.actionLabel}
        </button>
      </div>
    </div>
  );
};

/**
 * WidgetMenu — Three-dot menu that appears on hover of pinned widget tiles.
 */
const WidgetMenu = ({ onUnpin }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="uiPolish__widgetMenu">
      <button
        type="button"
        className="uiPolish__widgetMenuBtn"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        aria-label="Widget options">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div className="uiPolish__widgetMenuDropdown">
          <button type="button" className="uiPolish__widgetMenuItem" onClick={(e) => { e.stopPropagation(); setOpen(false); onUnpin && onUnpin(); }}>
            <OuiIcon type="pinFilled" size="s" />
            Unpin
          </button>
          <button type="button" className="uiPolish__widgetMenuItem" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
            <OuiIcon type="copy" size="s" />
            Duplicate
          </button>
          <button type="button" className="uiPolish__widgetMenuItem" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
            <OuiIcon type="play" size="s" />
            Start session
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * DualPurposeInput — Input field that accepts AI prompts or page search queries.
 *
 * @param {Object} props
 * @param {(prompt: string) => void} props.onStartThread
 * @param {(pageKey: string) => void} props.onOpenPage
 */
const DualPurposeInput = ({ onStartThread, onOpenPage, onSearchChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const matchingPages = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase();
    return Object.entries(SOURCE_PAGE_MOCK)
      .filter(([, { title }]) => title.toLowerCase().includes(query))
      .map(([key, { title }]) => ({ key, title }));
  }, [inputValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Check if input matches a page
      const exactMatch = Object.entries(SOURCE_PAGE_MOCK).find(
        ([, { title }]) =>
          title.toLowerCase() === inputValue.trim().toLowerCase()
      );
      if (exactMatch) {
        onOpenPage(exactMatch[0]);
      } else {
        onStartThread(inputValue.trim());
      }
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleSelectPage = (pageKey) => {
    onOpenPage(pageKey);
    setInputValue('');
    setShowSuggestions(false);
  };

  return (
    <div className="uiPolish__inputWrap">
      <div className="uiPolish__inputField">
        <div className="uiPolish__inputCard">
          <div className="uiPolish__inputPlaceholder" style={{ display: inputValue ? 'none' : 'block' }}>
            <span className="uiPolish__inputCaret" />Ask anything. Type <span className="uiPolish__inputHighlight">/</span> for actions.
          </div>
          <textarea
            className={`uiPolish__textareaRaw${!inputValue ? ' uiPolish__textareaRaw--empty' : ''}`}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleSubmit}
            rows={1}
            autoFocus
          />
          <div className="uiPolish__inputActions">
            <span className="uiPolish__inputPlus">+</span>
            <button
              type="button"
              className="uiPolish__sendButton"
              disabled={!inputValue.trim()}
              aria-label="Send"
              onClick={() => {
                if (inputValue.trim()) {
                  const exactMatch = Object.entries(SOURCE_PAGE_MOCK).find(
                    ([, { title }]) =>
                      title.toLowerCase() === inputValue.trim().toLowerCase()
                  );
                  if (exactMatch) {
                    onOpenPage(exactMatch[0]);
                  } else {
                    onStartThread(inputValue.trim());
                  }
                  setInputValue('');
                  setShowSuggestions(false);
                }
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * RecentAndFavoriteTabs — Tabbed section showing recent visits and favorites.
 *
 * @param {Object} props
 * @param {import('./session_models').RecentItem[]} props.recentItems
 * @param {import('./session_models').FavoriteItem[]} props.favoriteItems
 * @param {(pageKey: string) => void} props.onOpenPage
 */
const RecentAndFavoriteTabs = ({ recentItems, favoriteItems, onOpenPage }) => {
  const [activeTab, setActiveTab] = useState('recent');

  const items = activeTab === 'recent' ? recentItems : favoriteItems;

  const handleItemClick = (item) => {
    if (item.pageKey) {
      onOpenPage(item.pageKey);
    }
  };

  return (
    <div className="uiPolish__tabs">
      <OuiTabs size="s" display="condensed" style={{ maxWidth: 'fit-content' }}>
        <OuiTab
          isSelected={activeTab === 'recent'}
          onClick={() => setActiveTab('recent')}>
          Recent
        </OuiTab>
        <OuiTab
          isSelected={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}>
          Favorite
        </OuiTab>
      </OuiTabs>
      <div className="uiPolish__tabContent" role="tabpanel">
        {items.length === 0 ? (
          <>
            <div className="uiPolish__placeholderRow" />
            <div className="uiPolish__placeholderRow" />
            <div className="uiPolish__placeholderRow" />
            <div className="uiPolish__placeholderRow" />
            <div className="uiPolish__placeholderRow" />
          </>
        ) : (
          <ul className="uiPolish__itemList">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="uiPolish__listItem"
                  onClick={() => handleItemClick(item)}>
                  <OuiIcon
                    type={item.type === 'page' ? 'document' : 'apps'}
                    size="s"
                  />
                  <span className="uiPolish__listItemTitle">
                    {item.title}
                  </span>
                  {activeTab === 'recent' && item.visitedAt && (
                    <span className="uiPolish__listItemTime">
                      {formatRelativeTime(item.visitedAt)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * BottomSection — Shows saved objects list when a browse key is active,
 * otherwise shows Recent/Favorite tabs.
 */
const BottomSection = ({ browseKey, recentItems, favoriteItems, onOpenPage }) => {
  const [subTab, setSubTab] = useState(null);

  // Reset sub-tab when browse key changes
  React.useEffect(() => {
    if (browseKey && SAVED_OBJECTS[browseKey]?.tabs) {
      setSubTab(SAVED_OBJECTS[browseKey].tabs[0].id);
    } else {
      setSubTab(null);
    }
  }, [browseKey]);

  if (!browseKey || !SAVED_OBJECTS[browseKey]) {
    return (
      <RecentAndFavoriteTabs
        recentItems={recentItems}
        favoriteItems={favoriteItems}
        onOpenPage={onOpenPage}
      />
    );
  }

  const data = SAVED_OBJECTS[browseKey];

  // Simple list (dashboards)
  if (data.items && !data.tabs) {
    return (
      <div className="uiPolish__tabs">
        <div className="uiPolish__sectionTitle">Dashboards</div>
        <div className="uiPolish__tabContent">
          {data.items.map((item) => (
            <button
              key={item.key}
              className="uiPolish__listItem"
              onClick={() => onOpenPage(browseKey)}>
              <span className="uiPolish__listItemTitle">{item.title}</span>
              <span className="uiPolish__listItemTime">{item.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tabbed list (logs, metrics)
  const activeSubTab = subTab || (data.tabs ? data.tabs[0].id : null);
  const tabItems = data.tabItems[activeSubTab] || [];

  return (
    <div className="uiPolish__tabs">
      <OuiTabs size="s" display="condensed" style={{ maxWidth: 'fit-content' }}>
        {data.tabs.map((tab) => (
          <OuiTab
            key={tab.id}
            isSelected={activeSubTab === tab.id}
            onClick={() => setSubTab(tab.id)}>
            {tab.name}
          </OuiTab>
        ))}
      </OuiTabs>
      <div className="uiPolish__tabContent">
        {tabItems.map((item) => (
          <button
            key={item.key}
            className="uiPolish__listItem"
            onClick={() => onOpenPage(browseKey)}>
            <span className="uiPolish__listItemTitle">{item.title}</span>
            <span className="uiPolish__listItemTime">{item.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Format a timestamp as relative time (e.g., "2 hours ago").
 * @param {number} timestamp
 * @returns {string}
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * EmptySessionPage — The welcome experience shown when a session has no thread and no pages open.
 *
 * Displays a centered panel with:
 * - Welcome title
 * - System callout (when alerts are present)
 * - Dual-purpose input (AI prompt or page search)
 * - Quick access row with shortcut buttons
 * - Recent visit / Favorite tabs
 *
 * @param {Object} props
 * @param {(prompt: string) => void} props.onStartThread - Callback to start a new AI thread
 * @param {(pageKey: string) => void} props.onOpenPage - Callback to open a page as a tab
 * @param {import('./session_models').RecentItem[]} props.recentItems - Recently visited items
 * @param {import('./session_models').FavoriteItem[]} props.favoriteItems - Favorited items
 * @param {import('./session_models').SystemAlert|null} props.systemAlert - Active system alert
 */
export const UiPolishEmptySession = ({
  onStartThread,
  onOpenPage,
  onViewSession,
  onStartInvestigation,
  onSelectSession,
  sessions = [],
  recentItems = [],
  favoriteItems = [],
  systemAlert = null,
}) => {
  const [activeChip, setActiveChip] = useState('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedItems, setDismissedItems] = useState(new Set());
  const [dismissingItems, setDismissingItems] = useState(new Set());
  const [pinnedWidgets, setPinnedWidgets] = useState(['widget-1', 'widget-2', 'widget-3']);

  const handleUnpin = (widgetId) => {
    setPinnedWidgets((prev) => prev.filter((id) => id !== widgetId));
  };

  // Build a flat searchable list from all chip data + SOURCE_PAGE_MOCK
  const allSearchableItems = useMemo(() => {
    const items = [];
    // Add all chip data items
    Object.entries(CHIP_DATA).forEach(([category, categoryItems]) => {
      categoryItems.forEach((item) => {
        items.push({ ...item, category, pageKey: category === 'discover' ? 'logs' : category === 'monitor' ? 'alerts' : category === 'recent' ? 'dashboards' : category === 'favorite' ? 'dashboards' : 'notebooks' });
      });
    });
    // Add SOURCE_PAGE_MOCK pages
    Object.entries(SOURCE_PAGE_MOCK).forEach(([pageKey, { title }]) => {
      items.push({ key: `page-${pageKey}`, title, subtitle: 'Page', category: 'pages', pageKey });
    });
    return items;
  }, []);

  // Filter items based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(
      (item) => item.title.toLowerCase().includes(query) || (item.subtitle && item.subtitle.toLowerCase().includes(query))
    );
  }, [searchQuery, allSearchableItems]);

  return (
    <div className="uiPolish">
      <div className="uiPolish__panel">
        {/* Agent identity + greeting */}
        <div className="uiPolish__header">
          <div className="uiPolish__heroRow">
            <div className="uiPolish__heroMascot">
              <OpenSearchMascot size={40} />
              <span className="uiPolish__heroTooltip">Hi, I&apos;m Olly, your OpenSearch Observability assistant.</span>
            </div>
            <div className="uiPolish__heroText">
              <h1 className="uiPolish__heroTitle">Good morning, John</h1>
              <p className="uiPolish__heroSub">
                <span className="uiPolish__heroSubBold">All 247 services steady.</span>{' '}
                <span className="uiPolish__heroSubLight">2 activities to review.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content container — max 832px */}
        <div className="uiPolish__content">
          {/* Textarea input */}
          <DualPurposeInput
            onStartThread={onStartThread}
            onOpenPage={onOpenPage}
            onSearchChange={setSearchQuery}
          />

          {/* Search results OR normal content */}
          {searchResults ? (
            <div className="uiPolish__tabContent">
              {searchResults.length === 0 ? (
                <p style={{ color: '#676e75', textAlign: 'center', padding: '16px' }}>No results found</p>
              ) : (
                <>
                  <span className="uiPolish__searchLabel">Suggested pages</span>
                  {searchResults.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className="uiPolish__listItem"
                      onClick={() => onOpenPage(item.pageKey)}>
                      <span className="uiPolish__listItemTitle">{item.title}</span>
                      <span className="uiPolish__listItemTime">{item.subtitle}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            <>
              {/* Filter chips */}
              <div className="uiPolish__chips">
                {FILTER_CHIPS.map((chip) => {
                  const badgeCount = chip.key === 'activity'
                    ? CHIP_DATA.activity.filter((item) => !dismissedItems.has(item.key)).length
                    : null;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      className={`uiPolish__chip${activeChip === chip.key ? ' uiPolish__chip--active' : ''}`}
                      onClick={() => setActiveChip(chip.key)}>
                      <OuiIcon type={chip.icon} size="s" />
                      {chip.label}
                      {badgeCount > 0 && (
                        <span className="uiPolish__chipBadge">{badgeCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* List items based on active chip */}
              <div className="uiPolish__tabContent">
                {/* ─── Activity tab ─── */}
                {activeChip === 'activity' && (() => {
                  const visibleFindings = CHIP_DATA.activity.filter((item) => !dismissedItems.has(item.key));
                  if (visibleFindings.length === 0) {
                    return (
                      <div className="uiPolish__emptyCard">
                        <strong className="uiPolish__emptyCardTitle">All clear.</strong>
                        <span className="uiPolish__emptyCardText">Olly will surface anything worth your attention here.</span>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="uiPolish__findingsHeader">
                        <span className="uiPolish__findingsLabel">
                          // ACTIVITY — {String(visibleFindings.length).padStart(2, '0')}
                        </span>
                        <button type="button" className="uiPolish__markAllRead" onClick={() => {
                          CHIP_DATA.activity.forEach((item) => setDismissedItems((prev) => new Set([...prev, item.key])));
                        }}>
                          Mark all read
                        </button>
                      </div>
                      {visibleFindings.map((item) => (
                        <div
                          key={item.key}
                          className={`uiPolish__listItem uiPolish__listItem--activityLayout${item.severity === 'alert' ? ' uiPolish__listItem--activity' : ''}${dismissingItems.has(item.key) ? ' uiPolish__listItem--dismissing' : ''}`}>
                          <button
                            type="button"
                            className="uiPolish__listItemClickable"
                            onClick={() => onSelectSession(item.sessionId)}>
                            <span className="uiPolish__findingCard">
                              <span className="uiPolish__findingCardSummary">{item.summary}</span>
                              <span className="uiPolish__findingCardMeta">
                                {item.source === 'ai' ? (
                                  <span className="uiPolish__findingDot uiPolish__findingDot--attention">
                                    <OpenSearchMascot size={22} expression="wow" />
                                  </span>
                                ) : (
                                  <span className="uiPolish__findingDot uiPolish__findingDot--alert">
                                    {item.sharedBy ? item.sharedBy.split(' ').map(w => w[0]).join('') : 'T'}
                                  </span>
                                )}
                                {item.severity === 'alert' ? (
                                  <span className="uiPolish__findingBadge">{item.priority}</span>
                                ) : (
                                  <span className="uiPolish__findingChip uiPolish__findingChip--warn">{item.priority}</span>
                                )}
                                <span className="uiPolish__findingChip uiPolish__findingChip--service">{item.service}</span>
                                <span className="uiPolish__findingSource">
                                  {item.source === 'ai' ? (
                                    <>Started <strong>{item.age}</strong> by <strong>Olly</strong>, <strong style={{ color: item.severity === 'alert' ? '#C53961' : '#A8761F' }}>{item.trend}</strong> on {item.scope} · <strong>{item.confidence}% confidence</strong></>
                                  ) : (
                                    <>Shared <strong>{item.age}</strong> by <strong>{item.sharedBy}</strong> · {item.detail}</>
                                  )}
                                </span>
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="uiPolish__listItemDismissBottom"
                            aria-label="Dismiss"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDismissingItems((prev) => new Set([...prev, item.key]));
                              setTimeout(() => {
                                setDismissedItems((prev) => new Set([...prev, item.key]));
                                setDismissingItems((prev) => { const next = new Set(prev); next.delete(item.key); return next; });
                              }, 500);
                            }}>
                            Dismiss
                          </button>
                        </div>
                      ))}
                    </>
                  );
                })()}

                {/* ─── Recent tab ─── */}
                {activeChip === 'recent' && (
                  sessions.filter((s) => !s.hidden).slice(0, 5).map((session) => (
                    <div key={session.id} className="uiPolish__listItem">
                      <button
                        type="button"
                        className="uiPolish__listItemClickable"
                        onClick={() => onSelectSession(session.id)}>
                        <span className="uiPolish__activityCard">
                          <span className="uiPolish__listItemTitle">{session.title}</span>
                          <span className="uiPolish__listItemTime">{formatRelativeTime(session.createdAt)}</span>
                          {session.summary && (
                            <span className="uiPolish__activityCardPills">
                              <span className="uiPolish__activityPill">
                                <OuiIcon type="generate" size="m" />
                                <span className="uiPolish__activityPillText">{session.summary}</span>
                                <span className="uiPolish__activityPillMeta">
                                  {session.tabs.length > 0 ? `${session.tabs.length} ${session.tabs.length === 1 ? 'tab' : 'tabs'}` : 'No tabs'}
                                </span>
                              </span>
                            </span>
                          )}
                        </span>
                      </button>
                    </div>
                  ))
                )}

                {/* ─── Discover tab ─── */}
                {activeChip === 'discover' && (
                  <div className="uiPolish__discoverGrid">
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('discover-log')}>
                      <OuiIcon type="navDiscover" size="m" />
                      <span>Logs</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('discover-metric')}>
                      <OuiIcon type="visArea" size="m" />
                      <span>Metrics</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('dashboards-list')}>
                      <OuiIcon type="navDashboards" size="m" />
                      <span>Dashboards</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('alerts-list')}>
                      <OuiIcon type="navAlerting" size="m" />
                      <span>Alerts</span>
                    </button>
                  </div>
                )}

                {/* ─── Monitor tab ─── */}
                {activeChip === 'monitor' && (
                  <div className="uiPolish__discoverGrid">
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('app-map')}>
                      <OuiIcon type="navServiceMap" size="m" />
                      <span>Application Map</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('app-traces')}>
                      <OuiIcon type="apmTrace" size="m" />
                      <span>Application Traces</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('app-services')}>
                      <OuiIcon type="navDashboards" size="m" />
                      <span>Application Services</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('app-traces')}>
                      <OuiIcon type="apmTrace" size="m" />
                      <span>Agent traces</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('traces')}>
                      <OuiIcon type="navServices" size="m" />
                      <span>Agent spans</span>
                    </button>
                    <button type="button" className="uiPolish__discoverGridItem" onClick={() => onOpenPage('metrics')}>
                      <OuiIcon type="visLine" size="m" />
                      <span>Forecasting</span>
                    </button>
                  </div>
                )}

                {/* ─── More tab ─── */}
                {activeChip === 'more' && (
                  <div className="uiPolish__discoverGrid">
                    <div className="uiPolish__discoverGridItem uiPolish__discoverGridItem--disabled">
                      <OuiIcon type="document" size="m" />
                      <span>Notebook</span>
                    </div>
                    <div className="uiPolish__discoverGridItem uiPolish__discoverGridItem--disabled">
                      <OuiIcon type="navAlerting" size="m" />
                      <span>Monitors</span>
                    </div>
                  </div>
                )}

                {/* ─── Favorite tab ─── */}
                {activeChip === 'favorite' && (
                  (CHIP_DATA.favorite || []).map((item) => (
                    <div key={item.key} className="uiPolish__listItem">
                      <button
                        type="button"
                        className="uiPolish__listItemClickable"
                        onClick={() => onOpenPage(item.pageKey || 'dashboards')}>
                        <span className="uiPolish__listItemContent">
                          <span className="uiPolish__listItemTitle">{item.title}</span>
                          <span className="uiPolish__listItemTime">{item.subtitle}</span>
                        </span>
                        {item.typeIcon && (
                          <span className="uiPolish__listItemRight">
                            <OuiIcon type={item.typeIcon} size="m" color="subdued" />
                          </span>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Pinned widgets section */}
              <div className="uiPolish__pinnedSection">
                <div className="uiPolish__findingsHeader">
                  <span className="uiPolish__findingsLabel">// PINNED — {String(pinnedWidgets.length).padStart(2, '0')}</span>
                  {pinnedWidgets.length > 0 && <button type="button" className="uiPolish__markAllRead">Edit</button>}
                </div>
                {pinnedWidgets.length === 0 ? (
                  <div className="uiPolish__pinnedEmpty">
                    <div className="uiPolish__pinnedEmptyLeft">
                      <strong className="uiPolish__pinnedEmptyTitle">Pin anything you check often.</strong>
                      <span className="uiPolish__pinnedEmptyText">
                        A live preview shows here so you don&apos;t have to click. Look for the{' '}
                        <span className="uiPolish__pinnedPinBtn">
                          <OuiIcon type="pin" size="s" />
                          Pin
                        </span>
                        {' '}button — on a query, a dashboard, an alert, a finding, or anything Olly turns up.
                      </span>
                      <div className="uiPolish__pinnedChips">
                        <span className="uiPolish__pinnedChip">Saved query</span>
                        <span className="uiPolish__pinnedChip">Dashboard</span>
                        <span className="uiPolish__pinnedChip">Alert</span>
                        <span className="uiPolish__pinnedChip">Finding</span>
                        <span className="uiPolish__pinnedChip">Service health</span>
                        <span className="uiPolish__pinnedChip">Olly answer</span>
                      </div>
                    </div>
                    <div className="uiPolish__pinnedEmptyRight">
                      <div className="uiPolish__pinnedPlaceholder" />
                      <div className="uiPolish__pinnedPlaceholder" />
                      <div className="uiPolish__pinnedPlaceholder" />
                    </div>
                  </div>
                ) : (
                <div className="uiPolish__widgetGrid">
                  {/* Widget 1 */}
                  {pinnedWidgets.includes("widget-1") &&
                  <div className="uiPolish__widgetTile uiPolish__widgetTile--alert">
                    <div className="uiPolish__widgetTop">
                      <div className="uiPolish__widgetInfo">
                        <span className="uiPolish__widgetKind">SAVED QUERY</span>
                        <span className="uiPolish__widgetTitle">Payment-service · P99</span>
                      </div>
                      <span className="uiPolish__widgetLive">
                        <span className="uiPolish__widgetLiveDot" />
                        live
                      </span>
                      <WidgetMenu onUnpin={() => handleUnpin("widget-1")} />
                    </div>
                    <div className="uiPolish__widgetPreview">
                      <svg width="100%" height="56" viewBox="0 0 240 56" preserveAspectRatio="none">
                        <path d="M0,54 L16,53 L32,54 L48,52 L64,53 L80,50 L96,49 L112,50 L128,47 L144,44 L160,39 L176,32 L192,22 L208,12 L224,4 L240,0 L240,56 L0,56 Z" fill="rgba(197,57,97,0.10)" />
                        <path d="M0,54 L16,53 L32,54 L48,52 L64,53 L80,50 L96,49 L112,50 L128,47 L144,44 L160,39 L176,32 L192,22 L208,12 L224,4 L240,0" fill="none" stroke="#C53961" strokeWidth="1.4" strokeLinejoin="round" />
                        <circle cx="240" cy="0" r="2.6" fill="#C53961" />
                        <circle cx="240" cy="0" r="5" fill="#C53961" opacity="0.2" />
                      </svg>
                    </div>
                    <div className="uiPolish__widgetFooter">
                      <span className="uiPolish__widgetValue uiPolish__widgetValue--alert">2,140 ms</span>
                      <span className="uiPolish__widgetTrend uiPolish__widgetTrend--up">↑ +184%</span>
                    </div>
                  </div>}

                  {/* Widget 2: Error rate (bar, normal) */}
                  {pinnedWidgets.includes("widget-2") &&
                  <div className="uiPolish__widgetTile">
                    <div className="uiPolish__widgetTop">
                      <div className="uiPolish__widgetInfo">
                        <span className="uiPolish__widgetKind">SAVED QUERY</span>
                        <span className="uiPolish__widgetTitle">Error rate · all services</span>
                      </div>
                      <span className="uiPolish__widgetLive">
                        <span className="uiPolish__widgetLiveDot" />
                        live
                      </span>
                      <WidgetMenu onUnpin={() => handleUnpin("widget-2")} />
                    </div>
                    <div className="uiPolish__widgetPreview">
                      <svg width="100%" height="56" viewBox="0 0 240 56" preserveAspectRatio="none">
                        {[0.62, 0.58, 0.55, 0.51, 0.49, 0.47, 0.46, 0.46, 0.45, 0.44, 0.43, 0.42].map((v, i, arr) => {
                          const max = 0.62;
                          const bw = (240 - 3 * (arr.length - 1)) / arr.length;
                          const bh = (v / max) * 52;
                          return <rect key={i} x={i * (bw + 3)} y={56 - bh - 2} width={bw} height={bh} rx="1" fill="#1F6CB5" opacity={i === arr.length - 1 ? 1 : 0.55} />;
                        })}
                      </svg>
                    </div>
                    <div className="uiPolish__widgetFooter">
                      <span className="uiPolish__widgetValue">0.42 %</span>
                      <span className="uiPolish__widgetTrend uiPolish__widgetTrend--down">↓ −0.04</span>
                    </div>
                  </div>}

                  {/* Widget 3: Top services by traffic (rank, normal) */}
                  {pinnedWidgets.includes("widget-3") &&
                  <div className="uiPolish__widgetTile">
                    <div className="uiPolish__widgetTop">
                      <div className="uiPolish__widgetInfo">
                        <span className="uiPolish__widgetKind">DASHBOARD</span>
                        <span className="uiPolish__widgetTitle">Top services by traffic</span>
                      </div>
                      <span className="uiPolish__widgetLive">
                        <span className="uiPolish__widgetLiveDot" />
                        live
                      </span>
                      <WidgetMenu onUnpin={() => handleUnpin("widget-3")} />
                    </div>
                    <div className="uiPolish__widgetPreview uiPolish__widgetPreview--rank">
                      {[
                        { name: 'web-api', pct: 100, val: '4.1M' },
                        { name: 'payment-svc', pct: 78, val: '3.2M' },
                        { name: 'auth-svc', pct: 64, val: '2.6M' },
                        { name: 'search-svc', pct: 41, val: '1.7M' },
                      ].map((row, i) => (
                        <div key={row.name} className="uiPolish__widgetRankRow">
                          <span className="uiPolish__widgetRankNum">{i + 1}</span>
                          <span className="uiPolish__widgetRankName">{row.name}</span>
                          <span className="uiPolish__widgetRankBar">
                            <span className="uiPolish__widgetRankBarFill" style={{ width: `${row.pct}%` }} />
                          </span>
                          <span className="uiPolish__widgetRankVal">{row.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="uiPolish__widgetFooter">
                      <span className="uiPolish__widgetValue">12.4 M rps</span>
                      <span className="uiPolish__widgetTrend uiPolish__widgetTrend--flat">→ stable</span>
                    </div>
                  </div>}

                  {/* Add widget slot */}
                  <div className="uiPolish__widgetAdd">
                    <span className="uiPolish__widgetAddCircle">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 17v5" />
                        <path d="M9 10.5V4h6v6.5l2.5 3.5h-11l2.5-3.5z" />
                      </svg>
                    </span>
                    <span className="uiPolish__widgetAddTitle">Pin something</span>
                    <span className="uiPolish__widgetAddSub">Queries, dashboards, alerts, findings.</span>
                  </div>
                </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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

import React, { useState } from 'react';

import {
  V10_THEMES,
  V10ThemeContext,
  V10PageBackground,
} from './v10_primitives';
import { V10WelcomeContent } from './v10_welcome_page';
import { V10DashboardContent } from './v10_dashboard_page';

/**
 * V10SessionPagesView — replaces the normal session UI when the
 * global OUI theme is set to v10-dark or v10-light.
 *
 * Shows the Welcome page as the landing/home view, and the Dashboard
 * page when the user clicks into a session/investigation.
 */
export function V10SessionPagesView({ themeContext }) {
  const isLight = themeContext.theme === 'v10-light';
  const [mode, setModeState] = useState(isLight ? 'light' : 'dark');
  const [view, setView] = useState('welcome');

  const T = V10_THEMES[mode];

  const setMode = (next) => {
    setModeState(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('v10-theme', next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
    themeContext.changeTheme(next === 'light' ? 'v10-light' : 'v10-dark');
  };

  return (
    <V10ThemeContext.Provider value={T}>
      <V10PageBackground marks={view === 'welcome'}>
        {view === 'welcome' ? (
          <V10WelcomeContent
            mode={mode}
            setMode={setMode}
            onOpenDashboard={() => setView('dashboard')}
          />
        ) : (
          <V10DashboardContent
            mode={mode}
            setMode={setMode}
            onBack={() => setView('welcome')}
          />
        )}
      </V10PageBackground>
    </V10ThemeContext.Provider>
  );
}

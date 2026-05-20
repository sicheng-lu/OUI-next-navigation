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
import { OuiAvatar, OuiButtonIcon, OuiIcon } from '../../../../src/components';
import { OuiThreadLeftNav } from '../../../../src/components/thread_left_nav';

export default () => {
  const [activePage, setActivePage] = useState('home');

  const navItems = [
    { key: 'home', label: 'New thread', icon: 'plusInCircle' },
    { key: 'thread', label: 'All threads', icon: 'navTicketing', rulerAfter: true },
    { key: 'dashboards', label: 'Dashboards', icon: 'navDashboards' },
    { key: 'logs', label: 'Logs', icon: 'navDiscover' },
    { key: 'metrics', label: 'Metrics', icon: 'visArea' },
    { key: 'topology', label: 'Topology map', icon: 'navAiFlow', rulerAfter: true },
    { key: 'traces', label: 'Traces', icon: 'visTable' },
    { key: 'services', label: 'Services', icon: 'navServices' },
  ].map((item) => ({
    ...item,
    isActive: activePage === item.key,
    onClick: () => setActivePage(item.key),
  }));

  return (
    <div style={{ height: 500, display: 'flex', border: '1px solid var(--ouiBorderColor)' }}>
      <OuiThreadLeftNav
        logo={
          <OuiIcon type="logoOpenSearch" size="l" aria-label="OpenSearch" />
        }
        items={navItems}
        footer={
          <>
            <OuiButtonIcon
              iconType="wsSelector"
              aria-label="Workspace"
              color="text"
              display="empty"
              size="xs"
            />
            <OuiButtonIcon
              iconType="console"
              aria-label="Developer tools"
              color="text"
              display="empty"
              size="xs"
            />
            <OuiButtonIcon
              iconType="gear"
              aria-label="Settings"
              color="text"
              display="empty"
              size="xs"
            />
            <OuiAvatar name="OS" size="s" />
          </>
        }
      />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ouiTextSubduedColor)', fontSize: 14 }}>
        Active: {activePage}
      </div>
    </div>
  );
};

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
import { OuiIcon } from '../../../../src/components';
import { OuiThreadSessionListItem } from '../../../../src/components/thread_session_list_item';

const sessions = [
  { id: '1', title: 'Latency spike investigation', meta: '2h ago · 3 tabs', icon: 'discuss' },
  { id: '2', title: 'Checkout error rate alert', meta: '5h ago · 1 tab', icon: 'document' },
  { id: '3', title: 'Node disk pressure alerts', meta: '1d ago · 2 tabs', icon: 'discuss' },
];

export default () => {
  const [activeId, setActiveId] = useState('1');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
      {sessions.map((session) => (
        <OuiThreadSessionListItem
          key={session.id}
          title={session.title}
          meta={session.meta}
          icon={
            <OuiIcon
              type={session.icon}
              size="m"
              color={activeId === session.id ? 'primary' : 'subdued'}
            />
          }
          isActive={activeId === session.id}
          onClick={() => setActiveId(session.id)}
        />
      ))}
    </div>
  );
};

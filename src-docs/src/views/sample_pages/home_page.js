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
  OuiTitle,
  OuiButtonIcon,
  OuiListGroup,
  OuiListGroupItem,
  OuiText,
  OuiSpacer,
  OuiThreadInput,
} from '../../../../src/components';

import { DEFAULT_THREADS } from './sample_pages_left_nav';

const MOCK_SUGGESTIONS = [
  { label: 'help me write a query' },
  { label: 'help me analyze logs' },
  { label: 'help me create a dashboard' },
  { label: 'help me set up alerts' },
  { label: 'help me troubleshoot latency' },
  { label: 'help me understand this error' },
];

export const HomePage = ({ onNavigate, onContinueAsThread }) => {
  const [query, setQuery] = useState('');
  const [attentionOpen, setAttentionOpen] = useState(true);
  const [activeOpen, setActiveOpen] = useState(true);

  const MOCK_RESPONSE =
    'I looked into this and found a few things worth noting.\n\n**Summary**\n\n- The service metrics show a gradual increase in P99 latency over the past 6 hours.\n- Error rates remain within acceptable thresholds but are trending upward.\n- No recent deployments correlate with the change.\n\nI recommend checking the downstream dependency health and reviewing recent config changes in the environment.';

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    return MOCK_SUGGESTIONS.filter((s) =>
      s.label.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleSend = (value) => {
    const text = value || query;
    if (!text.trim()) return;
    if (onContinueAsThread) {
      onContinueAsThread(text.trim(), MOCK_RESPONSE);
    }
    setQuery('');
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.label);
    handleSend(suggestion.label);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 120,
      }}>
      <OuiTitle size="l">
        <h1 style={{ margin: 0 }}>Welcome to OpenSearch</h1>
      </OuiTitle>

      <div style={{ width: '100%', maxWidth: 600, marginTop: 24 }}>
        <OuiThreadInput
          placeholder="Ask a question..."
          value={query}
          onChange={setQuery}
          onSubmit={handleSend}
          rows={3}
          suggestions={filteredSuggestions}
          showSuggestions={true}
          onSuggestionClick={handleSuggestionClick}
          actionsLeft={
            <OuiButtonIcon
              iconType="plus"
              aria-label="Add attachment"
              size="s"
              color="text"
            />
          }
          actionsRight={
            <OuiButtonIcon
              iconType="sortUp"
              aria-label="Send message"
              display="fill"
              size="s"
              isDisabled={!query.trim()}
              onClick={() => handleSend(query)}
            />
          }
        />

        <OuiSpacer size="m" />

        <div className="homePage__threadList">
          <div className="samplePagesLeftNav__navGroup">
            <div className="samplePagesLeftNav__navGroupHeader">
              <span className="samplePagesLeftNav__navGroupLabel">
                Needs attention
              </span>
              <OuiButtonIcon
                iconType={attentionOpen ? 'minus' : 'plus'}
                aria-label={
                  attentionOpen
                    ? 'Collapse Needs attention'
                    : 'Expand Needs attention'
                }
                size="xs"
                color="text"
                display="empty"
                onClick={() => setAttentionOpen((o) => !o)}
              />
            </div>
            {attentionOpen && (
              <OuiListGroup gutterSize="none" maxWidth={false}>
                {DEFAULT_THREADS.slice(0, 2).map((thread) => (
                  <OuiListGroupItem
                    key={thread.key}
                    label={
                      <div>
                        <OuiText size="s">
                          <strong>{thread.title}</strong>
                        </OuiText>
                        <OuiText size="xs" color="subdued">
                          {thread.subtitle}
                        </OuiText>
                      </div>
                    }
                    onClick={() =>
                      onNavigate && onNavigate('thread', thread.key)
                    }
                    extraAction={{
                      iconType: 'boxesHorizontal',
                      'aria-label': 'More actions',
                      onClick: (e) => e.stopPropagation(),
                    }}
                  />
                ))}
              </OuiListGroup>
            )}
          </div>

          <OuiSpacer size="s" />

          <div className="samplePagesLeftNav__navGroup">
            <div className="samplePagesLeftNav__navGroupHeader">
              <span className="samplePagesLeftNav__navGroupLabel">Active</span>
              <OuiButtonIcon
                iconType={activeOpen ? 'minus' : 'plus'}
                aria-label={activeOpen ? 'Collapse Active' : 'Expand Active'}
                size="xs"
                color="text"
                display="empty"
                onClick={() => setActiveOpen((o) => !o)}
              />
            </div>
            {activeOpen && (
              <OuiListGroup gutterSize="none" maxWidth={false}>
                {DEFAULT_THREADS.slice(2).map((thread) => (
                  <OuiListGroupItem
                    key={thread.key}
                    label={
                      <div>
                        <OuiText size="s">
                          <strong>{thread.title}</strong>
                        </OuiText>
                        <OuiText size="xs" color="subdued">
                          {thread.subtitle}
                        </OuiText>
                      </div>
                    }
                    onClick={() =>
                      onNavigate && onNavigate('thread', thread.key)
                    }
                    extraAction={{
                      iconType: 'boxesHorizontal',
                      'aria-label': 'More actions',
                      onClick: (e) => e.stopPropagation(),
                    }}
                  />
                ))}
              </OuiListGroup>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

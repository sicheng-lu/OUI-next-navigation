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

import React, { forwardRef, useCallback, useRef, useState } from 'react';

import { OuiButtonIcon, OuiIcon, OuiToolTip } from '../../../../src/components';
import { ThreadPage } from './thread_page';

/**
 * ThreadPanel — Chat panel with its own header bar containing
 * sparkle icon, "New chat" title, and size toggle buttons.
 */
export const ThreadPanel = forwardRef(
  (
    {
      sizeState,
      onSizeChange,
      threadKey,
      pendingThread,
      onViewAction,
      width,
      title,
      isAnimating,
      onRenameSession,
    },
    ref
  ) => {
    const handleNavigate = (pageKey, navTitle) => {
      if (onViewAction) {
        onViewAction(pageKey, navTitle || pageKey);
      }
    };

    const displayTitle = title || 'New chat';
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef(null);

    const startEditing = () => {
      setEditValue(displayTitle);
      setIsEditing(true);
      setTimeout(() => inputRef.current?.select(), 0);
    };

    const commitRename = () => {
      const trimmed = editValue.trim();
      if (trimmed && trimmed !== displayTitle && onRenameSession) {
        onRenameSession(trimmed);
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') commitRename();
      if (e.key === 'Escape') setIsEditing(false);
    };

    const [headerShadowOpacity, setHeaderShadowOpacity] = useState(0);

    const handleContentScroll = useCallback((e) => {
      const scrollTop = e.target.scrollTop;
      if (scrollTop >= 20) {
        setHeaderShadowOpacity(1);
      } else {
        setHeaderShadowOpacity(scrollTop / 20);
      }
    }, []);

    return (
      <div
        ref={ref}
        className={`threadPanel${isAnimating ? ' threadPanel--animating' : ''}`}
        style={{ width }}>
        {/* Header */}
        <div
          className="threadPanel__header"
          style={{
            boxShadow: headerShadowOpacity > 0
              ? `0 2px 6px rgba(0, 0, 0, ${0.08 * headerShadowOpacity})`
              : 'none',
            transition: 'box-shadow 150ms ease',
          }}>
          <div className="threadPanel__headerLeft">
            <OuiIcon type="generate" size="m" />
            {isEditing ? (
              <input
                ref={inputRef}
                className="threadPanel__titleInput"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleKeyDown}
                aria-label="Rename session"
              />
            ) : (
              <span
                className="threadPanel__title threadPanel__title--editable"
                onClick={startEditing}
                title="Click to rename">
                {displayTitle}
              </span>
            )}
          </div>
          <div className="threadPanel__headerRight">
            <OuiToolTip content="Minimize" position="bottom">
              <OuiButtonIcon
                iconType="editorPositionBottomLeft"
                aria-label="Minimize"
                size="s"
                color="text"
                display="empty"
                onClick={() => onSizeChange('minimized')}
              />
            </OuiToolTip>
            <OuiToolTip
              content={
                sizeState === 'full-screen' ? 'Exit full screen' : 'Full screen'
              }
              position="bottom">
              <OuiButtonIcon
                iconType={
                  sizeState === 'full-screen' ? 'dockedLeft' : 'dockedTakeover'
                }
                aria-label={
                  sizeState === 'full-screen'
                    ? 'Exit full screen'
                    : 'Full screen'
                }
                size="s"
                color="text"
                display="empty"
                onClick={() =>
                  onSizeChange(
                    sizeState === 'full-screen' ? 'side-by-side' : 'full-screen'
                  )
                }
                style={
                  sizeState === 'full-screen'
                    ? undefined
                    : { transform: 'rotate(90deg)' }
                }
              />
            </OuiToolTip>
          </div>
        </div>

        {/* Content */}
        <div className="threadPanel__content" onScroll={handleContentScroll}>
          <ThreadPage
            selectedItem={
              threadKey || (pendingThread ? pendingThread.key : null)
            }
            pendingMessages={pendingThread ? pendingThread.messages : undefined}
            sourcePageTitle={
              pendingThread ? pendingThread.sourcePageTitle : undefined
            }
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    );
  }
);

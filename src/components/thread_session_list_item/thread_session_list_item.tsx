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

import React, { FunctionComponent, ReactNode } from 'react';
import classNames from 'classnames';

export interface OuiThreadSessionListItemProps {
  /** Session title */
  title: string;
  /** Meta text shown below the title (e.g. "2h ago · 3 tabs") */
  meta?: string;
  /** Icon rendered in the left icon area */
  icon?: ReactNode;
  /** Whether this item is the currently active session */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Accessible label override (defaults to title) */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * OuiThreadSessionListItem — A single session card in a session list.
 *
 * Displays an icon, session title, and meta information (timestamp, tab count).
 * Supports active state with primary color highlight and an active indicator dot.
 *
 * Used in the Agentic OSD Utility session list pattern.
 */
export const OuiThreadSessionListItem: FunctionComponent<OuiThreadSessionListItemProps> = ({
  title,
  meta,
  icon,
  isActive = false,
  onClick,
  ariaLabel,
  className,
}) => {
  const classes = classNames(
    'ouiThreadSessionListItem',
    { 'ouiThreadSessionListItem--active': isActive },
    className
  );

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={ariaLabel || (isActive ? `Active session: ${title}` : title)}
      aria-current={isActive ? 'true' : undefined}>
      {icon && (
        <span className="ouiThreadSessionListItem__icon">{icon}</span>
      )}
      <span className="ouiThreadSessionListItem__content">
        <span className="ouiThreadSessionListItem__title">{title}</span>
        {meta && (
          <span className="ouiThreadSessionListItem__meta">{meta}</span>
        )}
      </span>
      {isActive && (
        <span
          className="ouiThreadSessionListItem__activeIndicator"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

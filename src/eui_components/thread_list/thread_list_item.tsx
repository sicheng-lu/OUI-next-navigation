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

import React, { FunctionComponent, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import { CommonProps } from '../common';
import { EuiIcon, IconType } from '../icon';
import { EuiHealth } from '../health';

export type EuiThreadListItemProps = CommonProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
    /**
     * Main title/label of the thread item
     */
    title: ReactNode;

    /**
     * Secondary description or metadata (e.g., tags, domain info)
     */
    description?: ReactNode;

    /**
     * Icon to display on the left side
     */
    iconType?: IconType;

    /**
     * Color for a health/status indicator dot (alternative to iconType)
     */
    statusColor?: string;

    /**
     * Primary metadata displayed on the right (e.g., "2h ago")
     */
    meta?: ReactNode;

    /**
     * Secondary metadata displayed below the primary meta (e.g., timestamp)
     */
    metaSecondary?: ReactNode;

    /**
     * Status text displayed with optional color
     */
    status?: ReactNode;

    /**
     * Color for the status text: 'primary', 'success', 'warning', 'danger', 'subdued'
     */
    statusTextColor?: 'primary' | 'success' | 'warning' | 'danger' | 'subdued';

    /**
     * Click handler for the item
     */
    onClick?: () => void;

    /**
     * Makes the item appear selected/active
     */
    isActive?: boolean;

    /**
     * Makes the item appear disabled
     */
    isDisabled?: boolean;
  };

export const EuiThreadListItem: FunctionComponent<EuiThreadListItemProps> = ({
  className,
  title,
  description,
  iconType,
  statusColor,
  meta,
  metaSecondary,
  status,
  statusTextColor = 'subdued',
  onClick,
  isActive = false,
  isDisabled = false,
  ...rest
}) => {
  const classes = classNames(
    'euiThreadListItem',
    {
      'euiThreadListItem--clickable': onClick && !isDisabled,
      'euiThreadListItem--active': isActive,
      'euiThreadListItem--disabled': isDisabled,
    },
    className
  );

  const statusTextClasses = classNames(
    'euiThreadListItem__status',
    `euiThreadListItem__status--${statusTextColor}`
  );

  const handleClick = () => {
    if (onClick && !isDisabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !isDisabled) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !isDisabled ? 0 : undefined}
      aria-disabled={isDisabled}
      {...rest}>
      {(iconType || statusColor) && (
        <div className="euiThreadListItem__icon">
          {statusColor ? (
            <EuiHealth color={statusColor} />
          ) : iconType ? (
            <EuiIcon type={iconType} size="m" color="subdued" />
          ) : null}
        </div>
      )}

      <div className="euiThreadListItem__content">
        <div className="euiThreadListItem__title">{title}</div>
        {description && (
          <div className="euiThreadListItem__description">{description}</div>
        )}
      </div>

      {(meta || metaSecondary || status) && (
        <div className="euiThreadListItem__meta">
          {status && <div className={statusTextClasses}>{status}</div>}
          {meta && <div className="euiThreadListItem__metaPrimary">{meta}</div>}
          {metaSecondary && (
            <div className="euiThreadListItem__metaSecondary">
              {metaSecondary}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

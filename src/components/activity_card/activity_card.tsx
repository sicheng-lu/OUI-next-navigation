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

export type OuiActivityCardVariant = 'base' | 'activity';
export type OuiActivityCardSeverity = 'normal' | 'alert';

export interface OuiActivityCardProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'> {
  /** Card variant: 'base' for simple title+subtitle, 'activity' for rich finding card */
  variant?: OuiActivityCardVariant;
  /** Card title */
  title: string;
  /** Subtitle or timestamp */
  subtitle?: string;
  /** Summary text (activity variant only) */
  summary?: string;
  /** Avatar/icon element rendered before metadata (activity variant only) */
  avatar?: ReactNode;
  /** Priority badge text, e.g. 'P1' (activity variant only) */
  priority?: string;
  /** Severity level — 'alert' shows priority in red badge style */
  severity?: OuiActivityCardSeverity;
  /** Service tag text, e.g. 'payment-svc' (activity variant only) */
  service?: string;
  /** Metadata line below badges (activity variant only) */
  meta?: ReactNode;
  /** Click handler for the card */
  onClick?: () => void;
  /** Whether the card is in a dismissing state */
  isDismissing?: boolean;
  /** Action element rendered at the bottom-right (e.g. dismiss button) */
  action?: ReactNode;
}

export const OuiActivityCard: FunctionComponent<OuiActivityCardProps> = ({
  variant = 'base',
  title,
  subtitle,
  summary,
  avatar,
  priority,
  severity = 'normal',
  service,
  meta,
  onClick,
  isDismissing = false,
  action,
  className,
  ...rest
}) => {
  const classes = classNames(
    'ouiActivityCard',
    `ouiActivityCard--${variant}`,
    {
      'ouiActivityCard--alert': severity === 'alert',
      'ouiActivityCard--dismissing': isDismissing,
    },
    className
  );

  const content =
    variant === 'activity' ? (
      <div className="ouiActivityCard__finding">
        {summary && (
          <div className="ouiActivityCard__summary">{summary}</div>
        )}
        <div className="ouiActivityCard__meta">
          {avatar && <span className="ouiActivityCard__avatar">{avatar}</span>}
          {priority && (
            <span
              className={classNames('ouiActivityCard__priority', {
                'ouiActivityCard__priority--alert': severity === 'alert',
                'ouiActivityCard__priority--warn': severity !== 'alert',
              })}>
              {priority}
            </span>
          )}
          {service && (
            <span className="ouiActivityCard__service">{service}</span>
          )}
          {meta && <span className="ouiActivityCard__metaText">{meta}</span>}
        </div>
      </div>
    ) : (
      <div className="ouiActivityCard__base">
        <span className="ouiActivityCard__title">{title}</span>
        {subtitle && (
          <span className="ouiActivityCard__subtitle">{subtitle}</span>
        )}
      </div>
    );

  return (
    <div className={classes} {...rest}>
      {onClick ? (
        <button
          type="button"
          className="ouiActivityCard__clickable"
          onClick={onClick}>
          {content}
        </button>
      ) : (
        content
      )}
      {action && <div className="ouiActivityCard__action">{action}</div>}
    </div>
  );
};

OuiActivityCard.displayName = 'OuiActivityCard';

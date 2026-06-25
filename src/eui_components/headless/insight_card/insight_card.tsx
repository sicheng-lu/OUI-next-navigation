/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, FunctionComponent, ReactNode } from 'react';
import classNames from 'classnames';
import { CommonProps } from '../../common';

export type EuiInsightCardVariant = 'default' | 'glass' | 'add';

export interface EuiInsightCardProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Card title displayed at the top.
   */
  title?: ReactNode;
  /**
   * Visual variant.
   * `default` — solid surface with hairline border and feather shadow.
   * `glass` — frosted glass (for floating/featured moments).
   * `add` — dashed border "add new" tile.
   */
  variant?: EuiInsightCardVariant;
  /**
   * Whether the card is interactive (clickable).
   * Adds hover lift and cursor pointer.
   */
  isClickable?: boolean;
  /**
   * Optional icon or badge rendered to the right of the title.
   */
  titleExtra?: ReactNode;
}

export const EuiInsightCard: FunctionComponent<EuiInsightCardProps> = ({
  title,
  variant = 'default',
  isClickable = false,
  titleExtra,
  className,
  children,
  onClick,
  ...rest
}) => {
  const classes = classNames(
    'euiInsightCard',
    `euiInsightCard--${variant}`,
    {
      'euiInsightCard--clickable': isClickable || !!onClick,
    },
    className
  );

  const Tag = onClick ? 'button' : 'div';
  const buttonProps = onClick ? { type: 'button' as const, onClick } : {};

  return (
    <Tag className={classes} {...buttonProps} {...(rest as any)}>
      {title && (
        <div className="euiInsightCard__header">
          <span className="euiInsightCard__title">{title}</span>
          {titleExtra && (
            <span className="euiInsightCard__titleExtra">{titleExtra}</span>
          )}
        </div>
      )}
      {children && <div className="euiInsightCard__body">{children}</div>}
    </Tag>
  );
};

EuiInsightCard.displayName = 'EuiInsightCard';

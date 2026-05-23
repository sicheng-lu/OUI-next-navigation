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

export type OuiActivityCardChartTrend = 'up' | 'down' | 'flat';

export interface OuiActivityCardChartProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'> {
  /** Kind label, e.g. 'SAVED QUERY', 'DASHBOARD' */
  kind: string;
  /** Card title */
  title: string;
  /** Whether to show a live indicator dot */
  isLive?: boolean;
  /** Chart/preview content (SVG, sparkline, rank list, etc.) */
  children?: ReactNode;
  /** Footer value text, e.g. '2,140 ms' */
  value?: string;
  /** Trend direction */
  trend?: OuiActivityCardChartTrend;
  /** Trend label text, e.g. '↑ +184%' */
  trendLabel?: string;
  /** Whether this card is in alert state (red accent) */
  isAlert?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Menu/action element rendered in the top-right corner */
  menu?: ReactNode;
}

export const OuiActivityCardChart: FunctionComponent<OuiActivityCardChartProps> = ({
  kind,
  title,
  isLive = false,
  children,
  value,
  trend = 'flat',
  trendLabel,
  isAlert = false,
  onClick,
  menu,
  className,
  ...rest
}) => {
  const classes = classNames(
    'ouiActivityCardChart',
    {
      'ouiActivityCardChart--alert': isAlert,
    },
    className
  );

  const trendClasses = classNames('ouiActivityCardChart__trend', {
    'ouiActivityCardChart__trend--up': trend === 'up',
    'ouiActivityCardChart__trend--down': trend === 'down',
    'ouiActivityCardChart__trend--flat': trend === 'flat',
  });

  const card = (
    <>
      <div className="ouiActivityCardChart__top">
        <div className="ouiActivityCardChart__info">
          <span className="ouiActivityCardChart__kind">{kind}</span>
          <span className="ouiActivityCardChart__title">{title}</span>
        </div>
        {isLive && (
          <span className="ouiActivityCardChart__live">
            <span className="ouiActivityCardChart__liveDot" />
            live
          </span>
        )}
        {menu && <div className="ouiActivityCardChart__menu">{menu}</div>}
      </div>
      {children && (
        <div className="ouiActivityCardChart__preview">{children}</div>
      )}
      {(value || trendLabel) && (
        <div className="ouiActivityCardChart__footer">
          {value && (
            <span
              className={classNames('ouiActivityCardChart__value', {
                'ouiActivityCardChart__value--alert': isAlert,
              })}>
              {value}
            </span>
          )}
          {trendLabel && <span className={trendClasses}>{trendLabel}</span>}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        {...(rest as any)}>
        {card}
      </button>
    );
  }

  return (
    <div className={classes} {...rest}>
      {card}
    </div>
  );
};

OuiActivityCardChart.displayName = 'OuiActivityCardChart';

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

export interface OuiThreadLeftNavItem {
  /** Unique key for this nav item */
  key: string;
  /** Icon type from OUI icon set */
  icon: string;
  /** Accessible label */
  label: string;
  /** Whether this item is currently active */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Show a horizontal rule after this item */
  rulerAfter?: boolean;
}

export interface OuiThreadLeftNavProps {
  /** Logo element rendered at the top */
  logo?: ReactNode;
  /** Nav items rendered in the scrollable middle section */
  items?: OuiThreadLeftNavItem[];
  /** Footer elements rendered at the bottom */
  footer?: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * OuiThreadLeftNav — A narrow 48px collapsed icon-only navigation sidebar.
 *
 * Used as the primary navigation in the Agentic OSD Utility pattern.
 * Renders a logo at the top, icon nav items in the middle, and footer
 * actions (workspace, devtools, settings, avatar) at the bottom.
 *
 * Background: `$ouiColorLightestShade` at 60% opacity with a right border.
 */
export const OuiThreadLeftNav: FunctionComponent<OuiThreadLeftNavProps> = ({
  logo,
  items = [],
  footer,
  className,
}) => {
  const classes = classNames('ouiThreadLeftNav', className);

  return (
    <nav className={classes} aria-label="Thread navigation">
      {/* Logo / header */}
      {logo && (
        <div className="ouiThreadLeftNav__header">
          {logo}
        </div>
      )}

      {/* Scrollable nav items */}
      <div className="ouiThreadLeftNav__items">
        {items.map((item) => (
          <React.Fragment key={item.key}>
            <button
              type="button"
              className={classNames('ouiThreadLeftNav__item', {
                'ouiThreadLeftNav__item--active': item.isActive,
              })}
              aria-label={item.label}
              aria-current={item.isActive ? 'page' : undefined}
              onClick={item.onClick}>
              <span className="ouiThreadLeftNav__itemIcon">
                {/* Icon rendered by consumer via iconType */}
                <span data-icon-type={item.icon} />
              </span>
            </button>
            {item.rulerAfter && (
              <div className="ouiThreadLeftNav__rule" role="separator" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div className="ouiThreadLeftNav__footer">
          {footer}
        </div>
      )}
    </nav>
  );
};

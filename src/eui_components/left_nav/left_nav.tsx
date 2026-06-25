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

export interface EuiLeftNavProps
  extends CommonProps,
    HTMLAttributes<HTMLElement> {
  /** Content rendered at the top of the nav (typically a logo) */
  logo?: ReactNode;
  /** Navigation items rendered in the main body */
  children?: ReactNode;
  /** Content rendered at the bottom of the nav (footer actions) */
  footer?: ReactNode;
  /** Width of the nav in pixels */
  width?: number;
}

export const EuiLeftNav: FunctionComponent<EuiLeftNavProps> = ({
  logo,
  children,
  footer,
  width = 48,
  className,
  style,
  ...rest
}) => {
  const classes = classNames('euiLeftNav', className);

  return (
    <nav
      className={classes}
      style={{
        width,
        minWidth: width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        ...style,
      }}
      {...rest}>
      {/* Logo */}
      {logo && <div className="euiLeftNav__logo">{logo}</div>}

      {/* Nav items */}
      <div className="euiLeftNav__body">{children}</div>

      {/* Footer */}
      {footer && <div className="euiLeftNav__footer">{footer}</div>}
    </nav>
  );
};

EuiLeftNav.displayName = 'EuiLeftNav';

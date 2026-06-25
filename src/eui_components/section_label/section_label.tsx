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

export interface EuiSectionLabelProps
  extends CommonProps,
    HTMLAttributes<HTMLSpanElement> {
  /** The label text to display */
  children: ReactNode;
  /** Optional count to display after the label (formatted as zero-padded 2 digits) */
  count?: number;
  /** Prefix character(s) before the label. Defaults to '//' */
  prefix?: string;
  /** Separator between label and count. Defaults to '—' */
  separator?: string;
}

export const EuiSectionLabel: FunctionComponent<EuiSectionLabelProps> = ({
  children,
  count,
  prefix = '//',
  separator = '\u2014',
  className,
  ...rest
}) => {
  const classes = classNames('euiSectionLabel', className);

  const formattedCount =
    count !== undefined ? String(count).padStart(2, '0') : null;

  return (
    <span className={classes} {...rest}>
      {prefix && <span className="euiSectionLabel__prefix">{prefix}</span>}
      <span className="euiSectionLabel__text">{children}</span>
      {formattedCount && (
        <>
          <span className="euiSectionLabel__separator">{separator}</span>
          <span className="euiSectionLabel__count">{formattedCount}</span>
        </>
      )}
    </span>
  );
};

EuiSectionLabel.displayName = 'EuiSectionLabel';

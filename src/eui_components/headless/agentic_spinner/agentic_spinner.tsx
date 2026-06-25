/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, FunctionComponent } from 'react';
import classNames from 'classnames';

export type EuiAgenticSpinnerSize = 's' | 'm' | 'l';

export interface EuiAgenticSpinnerProps
  extends HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner blob: 's' (8px), 'm' (12px), 'l' (18px) */
  size?: EuiAgenticSpinnerSize;
}

/**
 * **EuiAgenticSpinner** — An organic morphing blob spinner for agentic
 * "thinking" states. Use in place of a traditional spinner when indicating
 * AI processing, streaming, or pre-message loading.
 */
export const EuiAgenticSpinner: FunctionComponent<EuiAgenticSpinnerProps> = ({
  size = 'm',
  className,
  ...rest
}) => {
  const classes = classNames(
    'euiAgenticSpinner',
    `euiAgenticSpinner--${size}`,
    className
  );

  return (
    <span className={classes} aria-label="Loading" role="status" {...rest} />
  );
};

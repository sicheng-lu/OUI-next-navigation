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

import React, { FunctionComponent, HTMLAttributes } from 'react';
import classNames from 'classnames';
import { CommonProps } from '../common';
import { EuiIcon } from '../icon';

export interface EuiThreadScrollButtonProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Whether the button is visible */
  isVisible?: boolean;
  /** Callback when the button is clicked */
  onClick?: () => void;
}

export const EuiThreadScrollButton: FunctionComponent<EuiThreadScrollButtonProps> = ({
  isVisible = false,
  onClick,
  className,
  ...rest
}) => {
  const classes = classNames(
    'euiThreadScrollButton',
    {
      'euiThreadScrollButton--visible': isVisible,
    },
    className
  );

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label="Scroll to bottom"
      {...rest}>
      <EuiIcon type="arrowDown" size="m" />
    </button>
  );
};

EuiThreadScrollButton.displayName = 'EuiThreadScrollButton';

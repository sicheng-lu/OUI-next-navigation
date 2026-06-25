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

import React, { FunctionComponent } from 'react';
import { CommonProps } from '../common';
import classNames from 'classnames';
import { EuiButtonIcon, EuiButtonIconPropsForButton } from '../button';
import { EuiToolTip, EuiToolTipProps } from '../tool_tip';
import { IconType } from '../icon';
import { EuiToken } from '../token';

export interface Action extends EuiButtonIconPropsForButton {
  tooltip?: Omit<EuiToolTipProps, 'children'>;
}

/**
 * Props for the EuiSchemaItem component.
 * @public
 */
export type EuiSchemaItemProps = CommonProps & {
  /** The icon type to display. */
  iconType?: IconType;
  /** The label to display. */
  label: string;
  /** An array of actions to display. Limit 2 */
  actions?: Action[];
  /** Whether the item is compressed. */
  compressed?: boolean;
  /** Whether the item is displayed with a panel. */
  withPanel?: boolean;
};

/**
 * A component that displays a schema item.
 * @public
 */
export const EuiSchemaItem: FunctionComponent<EuiSchemaItemProps> = ({
  className,
  iconType,
  label,
  actions = [],
  compressed,
  withPanel,
  ...rest
}) => {
  const classes = classNames(
    'euiSchemaItem',
    {
      'euiSchemaItem--compressed': compressed,
      'euiSchemaItem--withPanel': withPanel,
    },
    className
  );

  const filteredActions = actions.slice(0, 2);

  return (
    <div className={classes} {...rest}>
      {iconType && (
        <EuiToken
          className="euiSchemaItem__icon"
          iconType={iconType}
          size={compressed ? 'xs' : 's'}
        />
      )}
      <div className="euiSchemaItem__label">{label}</div>
      <div className="euiSchemaItem__actions">
        {filteredActions.map(({ tooltip, ...action }, index) =>
          tooltip ? (
            <EuiToolTip key={index} {...tooltip}>
              <EuiButtonIcon {...action} size={compressed ? 'xs' : 's'} />
            </EuiToolTip>
          ) : (
            <EuiButtonIcon
              key={index}
              {...action}
              size={compressed ? 'xs' : 's'}
            />
          )
        )}
      </div>
    </div>
  );
};

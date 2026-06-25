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

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {
  ButtonHTMLAttributes,
  HTMLAttributes,
  FunctionComponent,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import classNames from 'classnames';

import { CommonProps, keysOf } from '../../common';
import { htmlIdGenerator } from '../../../services/accessibility';
import { EuiIcon } from '../../icon';

const baseClassName = 'euiSwitch';

const colorToClassNameMap = {
  primary: `${baseClassName}--primary`,
  accent: `${baseClassName}--accent`,
  secondary: `${baseClassName}--secondary`,
  success: `${baseClassName}--success`,
  warning: `${baseClassName}--warning`,
  danger: `${baseClassName}--danger`,
  ghost: `${baseClassName}--ghost`,
  text: `${baseClassName}--text`,
};

export const COLORS = keysOf(colorToClassNameMap);
export type EuiSwitchColor = keyof typeof colorToClassNameMap;

const displayToClassNameMap = {
  base: `${baseClassName}--base`,
  empty: null,
};

export const DISPLAYS = keysOf(displayToClassNameMap);
export type EuiSwitchDisplay = keyof typeof displayToClassNameMap;

export type EuiSwitchEvent = React.BaseSyntheticEvent<
  React.MouseEvent<HTMLButtonElement>,
  HTMLButtonElement,
  EventTarget & {
    checked: boolean;
  }
>;

export type EuiSwitchProps = CommonProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onChange' | 'type' | 'disabled'
  > & {
    /**
     * Whether to render the text label
     */
    showLabel?: boolean;
    /**
     * Must be a string if `showLabel` prop is false
     */
    label: ReactNode | string;
    checked: boolean;
    onChange: (event: EuiSwitchEvent) => void;
    /**
     * Any of the named color palette options.
     * **`subdued` set to be DEPRECATED, use `text` instead**
     */
    color?: EuiSwitchColor;
    disabled?: boolean;
    compressed?: boolean;
    type?: 'submit' | 'reset' | 'button';
    /**
     * Object of props passed to the label's <span/>
     */
    labelProps?: CommonProps & HTMLAttributes<HTMLSpanElement>;
    /**
     * Sets the display style for matching other EuiButton types.
     * `base` is equivalent to a typical EuiButton
     * `empty` (default) is equivalent to an EuiButtonEmpty
     */
    display?: EuiSwitchDisplay;
  };

export const EuiSwitch: FunctionComponent<EuiSwitchProps> = ({
  label,
  id,
  checked,
  disabled,
  compressed,
  onChange,
  className,
  showLabel = true,
  type = 'button',
  labelProps,
  color = 'primary',
  display = 'empty',
  ...rest
}) => {
  const [switchId] = useState(id || htmlIdGenerator()());
  const [labelId] = useState(labelProps?.id || htmlIdGenerator()());

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLParagraphElement>) => {
      if (disabled) {
        return;
      }

      const event = (e as unknown) as EuiSwitchEvent;
      event.target.checked = !checked;
      onChange(event);
    },
    [checked, disabled, onChange]
  );

  const classes = classNames(
    'euiSwitch',
    color && colorToClassNameMap[color],
    display && displayToClassNameMap[display],
    {
      'euiSwitch--compressed': compressed,
      'euiSwitch-isDisabled': disabled,
    },
    className
  );
  const labelClasses = classNames('euiSwitch__label', labelProps?.className);
  if (showLabel === false && typeof label !== 'string') {
    console.warn(
      'EuiSwitch `label` must be a string when `showLabel` is false.'
    );
  }

  return (
    <div className={classes}>
      <button
        id={switchId}
        aria-checked={checked || false}
        className="euiSwitch__button"
        role="switch"
        type={type}
        disabled={disabled}
        onClick={onClick}
        aria-label={showLabel ? undefined : (label as string)}
        aria-labelledby={showLabel ? labelId : undefined}
        {...rest}>
        <span className="euiSwitch__body">
          <span className="euiSwitch__thumb" />
          <span className="euiSwitch__track">
            {!compressed && (
              <React.Fragment>
                <EuiIcon type="cross" size="m" className="euiSwitch__icon" />

                <EuiIcon
                  type="check"
                  size="m"
                  className="euiSwitch__icon euiSwitch__icon--checked"
                />
              </React.Fragment>
            )}
          </span>
        </span>
      </button>

      {showLabel && (
        // <button> + <label> has poor screen reader support.
        // Click handler added to simulate natural, secondary <label> interactivity.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <span
          {...labelProps}
          className={labelClasses}
          id={labelId}
          onClick={onClick}>
          {label}
        </span>
      )}
    </div>
  );
};

// @internal
export type EuiCompressedSwitchProps = Omit<EuiSwitchProps, 'compressed'>;

// @internal
export const EuiCompressedSwitch: FunctionComponent<EuiCompressedSwitchProps> = (
  props
) => <EuiSwitch {...props} compressed />;

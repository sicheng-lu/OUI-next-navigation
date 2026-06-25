/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  FunctionComponent,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

import { CommonProps, ExclusiveUnion } from '../common';

import {
  ButtonColor,
  ButtonSize,
  EuiButton,
  EuiButtonIcon,
  EuiButtonIconColor,
  EuiButtonProps,
} from '../button';
import {
  EuiButtonPropsForAnchor,
  EuiButtonPropsForButton,
  colorToClassNameMap,
} from '../button/button';
import classNames from 'classnames';

// this intersection still does not satisfy EuiButtonIconColor
// https://github.com/opensearch-project/oui/issues/1196
export type EuiSplitButtonColor = EuiButtonIconColor & ButtonColor;

type EuiSplitButtonActionProps = ExclusiveUnion<
  EuiButtonPropsForAnchor,
  EuiButtonPropsForButton
>;

export interface EuiSplitButtonControlProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  fullWidth?: boolean;
  isLoading?: boolean;

  fill?: boolean;

  /**
   * Display dropdown button
   * False renders SplitButton as a simple Button.
   */
  displayDropdown?: boolean;

  /**
   * Color of buttons and options
   */
  color?: EuiSplitButtonColor;

  /**
   * Use size `s` in confined spaces
   */
  size?: ButtonSize;

  /**
   * Click handler of Primary button
   */
  onClick?: () => void;

  /**
   * Click handler for drop-down button -- used by SplitButton to control
   * EuiPopover
   */
  onDropdownClick?: () => void;

  /**
   * Handle key-events for dropdown control
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;

  /**
   * Optional additional props to send to Primary Button
   */
  buttonProps?: EuiButtonProps;

  /**
   * Optional additional props to send to Dropdown Button
   */
  dropdownProps?: EuiButtonProps;

  /**
   * Content of Primary (left-side) button
   */
  children: ReactNode;
}

export const EuiSplitButtonControl: FunctionComponent<
  EuiSplitButtonControlProps & EuiSplitButtonActionProps
> = ({
  displayDropdown = true,
  fill,
  size,
  color = 'primary',
  disabled = false,
  children,
  fullWidth,
  onClick,
  href,
  target,
  rel,
  onDropdownClick,
  onKeyDown: onSelectKeydown,
  buttonProps,
  dropdownProps,
}) => {
  const iconDisplay = fill ? 'fill' : 'base';

  const className = classNames(
    'euiSplitButtonControl',
    color && `euiSplitButtonColor${colorToClassNameMap[color]}`,
    disabled && 'euiSplitButtonColor-isDisabled',
    fill && 'euiSplitButtonColor--filled'
  );

  const primaryButtonClasses = classNames(
    'euiSplitButtonControl',
    'euiSplitButtonControl--primary',
    color &&
      displayDropdown &&
      `euiSplitButtonHairline${colorToClassNameMap[color]}`,
    disabled && displayDropdown && 'euiSplitButtonHairline--isDisabled',
    fill && displayDropdown && 'euiSplitButtonHairline--filled'
  );

  const actionProps = {
    href,
    target,
    rel,
    onClick,
  };
  return (
    <div className={className}>
      <EuiButton
        className={primaryButtonClasses}
        fill={fill}
        color={color}
        size={size}
        fullWidth={fullWidth}
        isDisabled={disabled || false}
        onKeyDown={onSelectKeydown}
        data-test-subj="splitButton--primary"
        {...actionProps}
        {...buttonProps}>
        {children}
      </EuiButton>
      {displayDropdown && (
        <EuiButtonIcon
          display={iconDisplay}
          className="euiSplitButtonControl--dropdown"
          //@ts-ignore - typedef conflict between ButtonColor, EuiButtonIconColor
          // https://github.com/opensearch-project/oui/issues/1196
          color={color}
          size={size || 'm'}
          disabled={disabled}
          isDisabled={disabled}
          iconType="arrowDown"
          onClick={onDropdownClick}
          onKeyDown={onSelectKeydown}
          aria-label="Open Selections"
          data-test-subj="splitButton--dropdown"
          {...dropdownProps}
        />
      )}
    </div>
  );
};

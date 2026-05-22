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

import React, {
  FunctionComponent,
  HTMLAttributes,
  KeyboardEventHandler,
  ReactNode,
  useState,
  useCallback,
  useRef,
} from 'react';
import classNames from 'classnames';
import { CommonProps } from '../common';
import { OuiIcon } from '../icon';

export interface OuiThreadInputSuggestion {
  /** Display label for the suggestion */
  label: string;
  /** Optional description shown below the label */
  description?: string;
}

export interface OuiThreadInputProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit' | 'onChange'> {
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Current value of the textarea */
  value?: string;
  /** Callback when the value changes */
  onChange?: (value: string) => void;
  /** Callback when the user submits (Enter without Shift, or clicking send) */
  onSubmit?: (value: string) => void;
  /** Number of visible rows for the textarea */
  rows?: number;
  /** Whether the input is disabled */
  isDisabled?: boolean;
  /** Whether the send button should show a loading state */
  isLoading?: boolean;
  /** Actions to render on the left side of the action bar (e.g. attachment button) */
  actionsLeft?: ReactNode;
  /** Actions to render on the right side of the action bar (e.g. send button) */
  actionsRight?: ReactNode;
  /** Whether to use full width */
  fullWidth?: boolean;
  /** List of suggestions to show in the dropdown */
  suggestions?: OuiThreadInputSuggestion[];
  /** Whether to show the suggestions dropdown. Defaults to true. Set to false for chat dialogs at the bottom of the page. */
  showSuggestions?: boolean;
  /** Callback when a suggestion is clicked */
  onSuggestionClick?: (suggestion: OuiThreadInputSuggestion) => void;
}

export const OuiThreadInput: FunctionComponent<OuiThreadInputProps> = ({
  placeholder = 'Ask anything. Type / for actions.',
  value: controlledValue,
  onChange,
  onSubmit,
  rows = 3,
  isDisabled = false,
  isLoading = false,
  actionsLeft,
  actionsRight,
  fullWidth = true,
  suggestions = [],
  showSuggestions = true,
  onSuggestionClick,
  className,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  const handleSubmit = useCallback(() => {
    if (currentValue.trim() && !isDisabled && !isLoading) {
      onSubmit?.(currentValue);
      if (!isControlled) {
        setInternalValue('');
      }
    }
  }, [currentValue, isDisabled, isLoading, onSubmit, isControlled]);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't close if clicking within the suggestion dropdown
    if (
      wrapperRef.current &&
      e.relatedTarget &&
      wrapperRef.current.contains(e.relatedTarget as Node)
    ) {
      return;
    }
    setIsFocused(false);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: OuiThreadInputSuggestion) => {
      if (onSuggestionClick) {
        onSuggestionClick(suggestion);
      } else {
        // Default behavior: fill the input with the suggestion label
        if (!isControlled) {
          setInternalValue(suggestion.label);
        }
        onChange?.(suggestion.label);
      }
      setIsFocused(false);
    },
    [onSuggestionClick, isControlled, onChange]
  );

  const shouldShowSuggestions =
    showSuggestions &&
    isFocused &&
    currentValue.trim().length > 0 &&
    suggestions.length > 0;

  const classes = classNames(
    'ouiThreadInput',
    {
      'ouiThreadInput--fullWidth': fullWidth,
      'ouiThreadInput--disabled': isDisabled,
    },
    className
  );

  return (
    <div className={classes} ref={wrapperRef} onBlur={handleBlur} {...rest}>
      <div className="ouiThreadInput__wrapper">
        <textarea
          className="ouiThreadInput__textarea"
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          rows={rows}
          disabled={isDisabled}
          aria-label={placeholder}
        />
        <div className="ouiThreadInput__actions">
          {actionsLeft && (
            <div className="ouiThreadInput__actionsLeft">{actionsLeft}</div>
          )}
          {actionsRight && (
            <div className="ouiThreadInput__actionsRight">{actionsRight}</div>
          )}
        </div>
      </div>
      {shouldShowSuggestions && (
        <div className="ouiThreadInput__suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="ouiThreadInput__suggestionItem"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}>
              <OuiIcon
                type="search"
                size="s"
                className="ouiThreadInput__suggestionIcon"
              />
              <span className="ouiThreadInput__suggestionLabel">
                {suggestion.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

OuiThreadInput.displayName = 'OuiThreadInput';

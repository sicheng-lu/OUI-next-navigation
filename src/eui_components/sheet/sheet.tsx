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
  useEffect,
  forwardRef,
  PropsWithChildren,
  HTMLAttributes,
  Ref,
} from 'react';
import classnames from 'classnames';

import { keys } from '../../services';
import { CommonProps } from '../common';
import { EuiFocusTrap } from '../focus_trap';
import { EuiOverlayMask, EuiOverlayMaskProps } from '../overlay_mask';
import { EuiButtonIcon } from '../button';
import { EuiI18n } from '../i18n';
import { EuiOutsideClickDetector } from '../outside_click_detector';
import { EuiPortal } from '../portal';

export interface EuiSheetProps
  extends CommonProps,
    HTMLAttributes<HTMLDivElement> {
  /**
   * Called when the sheet is closed.
   */
  onClose: () => void;
  /**
   * Height as a percentage of the viewport (default 96).
   */
  heightPercent?: number;
  /**
   * Hide the default close button.
   */
  hideCloseButton?: boolean;
  /**
   * Adjustments to the EuiOverlayMask when `ownFocus = true`.
   */
  maskProps?: EuiOverlayMaskProps;
  /**
   * Wraps sheet in a focus trap. Defaults to true.
   */
  ownFocus?: boolean;
  /**
   * Close when clicking outside the sheet. Defaults to false.
   */
  outsideClickCloses?: boolean;
  /**
   * Accessible role for the sheet. Defaults to `dialog`.
   */
  role?: string;
  /**
   * Aria label for the close button.
   */
  closeButtonAriaLabel?: string;
}

export const EuiSheet = forwardRef<
  HTMLDivElement,
  PropsWithChildren<EuiSheetProps>
>(
  (
    {
      className,
      children,
      onClose,
      heightPercent = 96,
      hideCloseButton = false,
      maskProps,
      ownFocus = true,
      outsideClickCloses = false,
      role = 'dialog',
      closeButtonAriaLabel,
      style,
      ...rest
    },
    ref: Ref<HTMLDivElement>
  ) => {
    // Close on ESC
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === keys.ESCAPE) {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const classes = classnames('euiSheet', className);

    const sheetStyle: React.CSSProperties = {
      height: `${heightPercent}vh`,
      ...style,
    };

    const closeButton = !hideCloseButton && (
      <EuiI18n token="euiSheet.closeAriaLabel" default="Close this dialog">
        {(closeAriaLabel: string) => (
          <EuiButtonIcon
            display="empty"
            iconType="cross"
            color="text"
            aria-label={closeButtonAriaLabel || closeAriaLabel}
            onClick={() => onClose()}
            className="euiSheet__closeButton"
          />
        )}
      </EuiI18n>
    );

    let sheetContent = (
      <div
        role={role === null ? undefined : role}
        className={classes}
        style={sheetStyle}
        ref={ref}
        {...rest}>
        {closeButton}
        {children}
      </div>
    );

    if (outsideClickCloses) {
      sheetContent = (
        <EuiOutsideClickDetector onOutsideClick={() => onClose()}>
          {sheetContent}
        </EuiOutsideClickDetector>
      );
    }

    if (ownFocus) {
      sheetContent = (
        <EuiFocusTrap clickOutsideDisables={!outsideClickCloses}>
          {sheetContent}
        </EuiFocusTrap>
      );
    }

    return (
      <EuiPortal>
        <EuiOverlayMask headerZindexLocation="below" {...maskProps}>
          {sheetContent}
        </EuiOverlayMask>
      </EuiPortal>
    );
  }
);

EuiSheet.displayName = 'EuiSheet';

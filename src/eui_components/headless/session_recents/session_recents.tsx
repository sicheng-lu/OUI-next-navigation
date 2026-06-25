/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  HTMLAttributes,
  FunctionComponent,
  ReactNode,
  useRef,
  useCallback,
} from 'react';
import classNames from 'classnames';
import { CommonProps } from '../../common';

export interface EuiSessionRecentsItem {
  key: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
}

export interface EuiSessionRecentsProps
  extends CommonProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  items: EuiSessionRecentsItem[];
  onItemClick?: (key: string) => void;
}

export const EuiSessionRecents: FunctionComponent<EuiSessionRecentsProps> = ({
  title = 'Recent',
  items,
  onItemClick,
  className,
  ...rest
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleHover = useCallback((hoveredIndex: number) => {
    if (!listRef.current) return;
    const els = listRef.current.querySelectorAll('.euiSessionRecents__item');
    const seps = listRef.current.querySelectorAll(
      '.euiSessionRecents__separator'
    );
    els.forEach((el, i) => {
      const distance = Math.abs(i - hoveredIndex);
      let scale = 1;
      if (distance === 0) scale = 1.03;
      else if (distance === 1) scale = 1.015;
      else if (distance === 2) scale = 1.005;
      (el as HTMLElement).style.transform = `scale(${scale})`;
    });
    seps.forEach((el, i) => {
      const distBefore = Math.abs(i - hoveredIndex);
      const distAfter = Math.abs(i + 1 - hoveredIndex);
      const minDist = Math.min(distBefore, distAfter);
      (el as HTMLElement).style.opacity = minDist === 0 ? '0' : '1';
    });
  }, []);

  const handleMouseDown = useCallback((pressedIndex: number) => {
    if (!listRef.current) return;
    const els = listRef.current.querySelectorAll('.euiSessionRecents__item');
    els.forEach((el, i) => {
      const distance = Math.abs(i - pressedIndex);
      let scale = 1;
      if (distance === 0) scale = 0.97;
      else if (distance === 1) scale = 0.985;
      else if (distance === 2) scale = 0.995;
      (el as HTMLElement).style.transform = `scale(${scale})`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!listRef.current) return;
    listRef.current
      .querySelectorAll('.euiSessionRecents__item')
      .forEach((el) => {
        (el as HTMLElement).style.transform = '';
      });
    listRef.current
      .querySelectorAll('.euiSessionRecents__separator')
      .forEach((el) => {
        (el as HTMLElement).style.opacity = '';
      });
  }, []);

  const classes = classNames('euiSessionRecents', className);

  return (
    <div
      className={classes}
      ref={listRef}
      onMouseLeave={handleMouseLeave}
      {...rest}>
      {title && (
        <div className="euiSessionRecents__header">
          <h5 className="euiSessionRecents__title">{title}</h5>
          <span className="euiSessionRecents__count">{items.length}</span>
        </div>
      )}
      {items.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && <div className="euiSessionRecents__separator" />}
          <button
            type="button"
            className="euiSessionRecents__item"
            onClick={() => onItemClick && onItemClick(item.key)}
            onMouseEnter={() => handleHover(index)}
            onMouseDown={() => handleMouseDown(index)}
            onMouseUp={() => handleHover(index)}>
            <div className="euiSessionRecents__itemContent">
              {item.title && (
                <p className="euiSessionRecents__itemTitle">{item.title}</p>
              )}
              {item.description && (
                <p className="euiSessionRecents__itemDescription">
                  {item.description}
                </p>
              )}
              {item.meta && (
                <p className="euiSessionRecents__itemMeta">{item.meta}</p>
              )}
            </div>
            <span className="euiSessionRecents__arrow">→</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

EuiSessionRecents.displayName = 'EuiSessionRecents';

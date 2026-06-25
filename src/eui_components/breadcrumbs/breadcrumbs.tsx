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
  Fragment,
  FunctionComponent,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';

import { CommonProps } from '../common';
import { EuiI18n } from '../i18n';
import { EuiInnerText } from '../inner_text';
import { EuiLink } from '../link';
import { EuiPopover } from '../popover';
import { EuiIcon } from '../icon';
import { throttle } from '../../services';
import { EuiBreakpointSize, getBreakpoint } from '../../services/breakpoint';

export type EuiBreadcrumbResponsiveMaxCount = {
  /**
   * Any of the following keys are allowed: `'xs' | 's' | 'm' | 'l' | 'xl'`
   * Omitting a key will display all breadcrumbs at that breakpoint
   */
  [key in EuiBreakpointSize]?: number;
};

export type EuiBreadcrumb = CommonProps & {
  /**
   * Visible label of the breadcrumb
   */
  text: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /**
   * Force a max-width on the breadcrumb text
   */
  truncate?: boolean;
};

export type EuiBreadcrumbsProps = CommonProps & {
  /**
   * Hides extra (above the max) breadcrumbs under a collapsed item as the window gets smaller.
   * Pass a custom #EuiBreadcrumbResponsiveMaxCount object to change the number of breadcrumbs to show at the particular breakpoints.
   * Omitting or passing a `0` value will show all breadcrumbs.
   *
   * Pass `false` to turn this behavior off.
   *
   * Default: `{ xs: 1, s: 2, m: 4 }`
   */
  responsive?: boolean | EuiBreadcrumbResponsiveMaxCount;

  /**
   * Forces all breadcrumbs to single line and
   * truncates each breadcrumb to a particular width,
   * except for the last item
   */
  truncate?: boolean;

  /**
   * Collapses the inner items past the maximum set here
   * into a single ellipses item
   */
  max?: number | null;

  /**
   * The array of individual #EuiBreadcrumb items
   */
  breadcrumbs: EuiBreadcrumb[];
};

/* Try to fit breadcrumbs with at least 160px into the width of each of the BREAKPOINTS
 *    1. put aside 275px for the last breadcrumb and possible loss due to layout
 *    2. provide at least 160px for each remaining breadcrumb
 *
 *    numberOfBreadcrumbs = (breakpointWidth - 275) / 160 + 1
 */
const responsiveDefault: EuiBreadcrumbResponsiveMaxCount = {
  xs: 1, // Show only one
  s: 2, //  (575 - 275) / 160 + 1 = 2.88
  m: 4, //  (768 - 275) / 160 + 1 = 4.08
  l: 5, //  (992 - 275) / 160 + 1 = 5.48
  xl: 6, // (1200 - 275) / 160 + 1 = 6.78
  xxl: 9, // (1680 - 275) / 160 + 1 = 9.78
  xxxl: 11, // (1920 - 275) / 160 + 1 = 11.28
};

const limitBreadcrumbs = (
  breadcrumbs: ReactNode[],
  max: number,
  allBreadcrumbs: EuiBreadcrumb[]
) => {
  const breadcrumbsAtStart = [];
  const breadcrumbsAtEnd = [];
  const limit = Math.min(max, breadcrumbs.length);
  const start = Math.floor(limit / 2);
  const overflowBreadcrumbs = allBreadcrumbs.slice(
    start,
    start + breadcrumbs.length - limit
  );

  for (let i = 0; i < limit; i++) {
    // We'll alternate with displaying breadcrumbs at the end and at the start, but be biased
    // towards breadcrumbs the end so that if max is an odd number, we'll have one more
    // breadcrumb visible at the end than at the beginning.
    const isEven = i % 2 === 0;

    // We're picking breadcrumbs from the front AND the back, so we treat each iteration as a
    // half-iteration.
    const normalizedIndex = Math.floor(i * 0.5);
    const indexOfBreadcrumb = isEven
      ? breadcrumbs.length - 1 - normalizedIndex
      : normalizedIndex;
    const breadcrumb = breadcrumbs[indexOfBreadcrumb];

    if (isEven) {
      breadcrumbsAtEnd.unshift(breadcrumb);
    } else {
      breadcrumbsAtStart.push(breadcrumb);
    }
  }

  const EuiBreadcrumbCollapsed = () => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const ellipsisButton = (
      <EuiI18n
        token="euiBreadcrumbs.collapsedBadge.ariaLabel"
        default="Show collapsed breadcrumbs">
        {(ariaLabel: string) => (
          <EuiLink
            className="euiBreadcrumb__collapsedLink"
            color="subdued"
            aria-label={ariaLabel}
            title={ariaLabel}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
            &hellip; <EuiIcon type="arrowDown" size="s" />
          </EuiLink>
        )}
      </EuiI18n>
    );

    return (
      <Fragment>
        <div className="euiBreadcrumbWrapper euiBreadcrumbWrapper--collapsed">
          <EuiPopover
            className="euiBreadcrumb euiBreadcrumb--collapsed"
            button={ellipsisButton}
            isOpen={isPopoverOpen}
            closePopover={() => setIsPopoverOpen(false)}>
            <EuiBreadcrumbs
              className="euiBreadcrumbs__inPopover"
              breadcrumbs={overflowBreadcrumbs}
              responsive={false}
              truncate={false}
              max={0}
            />
          </EuiPopover>
        </div>
      </Fragment>
    );
  };

  if (max < breadcrumbs.length) {
    breadcrumbsAtStart.push(<EuiBreadcrumbCollapsed key="collapsed" />);
  }

  return [...breadcrumbsAtStart, ...breadcrumbsAtEnd];
};

export const EuiBreadcrumbs: FunctionComponent<EuiBreadcrumbsProps> = ({
  breadcrumbs,
  className,
  responsive = responsiveDefault,
  truncate = true,
  max = 5,
  ...rest
}) => {
  // Use the default object if they simply passed `true` for responsive
  const responsiveObject =
    typeof responsive === 'object' ? responsive : responsiveDefault;

  const allowedBreakpoints = responsive
    ? (Object.keys(responsiveObject) as EuiBreakpointSize[])
    : undefined;

  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    getBreakpoint(
      typeof window === 'undefined' ? -Infinity : window.innerWidth,
      undefined,
      allowedBreakpoints
    )
  );

  const functionToCallOnWindowResize = throttle(() => {
    const newBreakpoint = getBreakpoint(
      window.innerWidth,
      undefined,
      allowedBreakpoints
    );
    if (newBreakpoint !== currentBreakpoint) {
      setCurrentBreakpoint(newBreakpoint);
    }
    // reacts every 50ms to resize changes and always gets the final update
  }, 50);

  // Add window resize handlers
  useEffect(() => {
    window.addEventListener('resize', functionToCallOnWindowResize);

    return () => {
      window.removeEventListener('resize', functionToCallOnWindowResize);
    };
  }, [responsive, responsiveObject, functionToCallOnWindowResize]);

  const isInPopover = className === 'euiBreadcrumbs__inPopover';

  const breadcrumbElements = breadcrumbs.map((breadcrumb, index) => {
    const {
      text,
      href,
      onClick,
      truncate,
      className: breadcrumbClassName,
      ...breadcrumbRest
    } = breadcrumb;

    const isFirstBreadcrumb = index === 0;
    const isLastBreadcrumb = index === breadcrumbs.length - 1;

    const breadcrumbWrapperClasses = classNames('euiBreadcrumbWrapper', {
      'euiBreadcrumbWrapper--first': isFirstBreadcrumb,
      'euiBreadcrumbWrapper--last': isLastBreadcrumb,
      'euiBreadcrumbWrapper--truncate': truncate,
    });

    const breadcrumbClasses = classNames('euiBreadcrumb', breadcrumbClassName, {
      'euiBreadcrumb--last': isLastBreadcrumb,
      'euiBreadcrumb--truncate': truncate,
    });

    const link =
      !href && !onClick ? (
        <EuiInnerText>
          {(ref, innerText) => (
            <span
              ref={ref}
              className={breadcrumbClasses}
              title={innerText}
              aria-current={isLastBreadcrumb && !isInPopover ? 'page' : 'false'}
              {...breadcrumbRest}>
              {text}
            </span>
          )}
        </EuiInnerText>
      ) : (
        <EuiInnerText>
          {(ref, innerText) => (
            <EuiLink
              ref={ref}
              color={isLastBreadcrumb && !isInPopover ? 'text' : 'subdued'}
              onClick={onClick}
              href={href}
              className={breadcrumbClasses}
              title={innerText}
              {...breadcrumbRest}>
              {text}
            </EuiLink>
          )}
        </EuiInnerText>
      );

    const breadcrumbWallClasses = classNames('euiBreadcrumbWall', {
      'euiBreadcrumbWall--single': isFirstBreadcrumb && isLastBreadcrumb,
    });

    const wrapper = <div className={breadcrumbWrapperClasses}>{link}</div>;
    const wall = isFirstBreadcrumb ? (
      <div className={breadcrumbWallClasses}>{wrapper}</div>
    ) : (
      wrapper
    );

    return <Fragment key={index}>{wall}</Fragment>;
  });

  // The max property collapses any breadcrumbs past the max quantity.
  // This is the same behavior we want for responsiveness.
  // So calculate the max value based on the combination of `max` and `responsive`

  // First, calculate the responsive max value
  const responsiveMax =
    (responsive && responsiveObject[currentBreakpoint as EuiBreakpointSize]) ||
    null;

  // Second, if both max and responsiveMax are set, use the smaller of the two. Otherwise, use the one that is set.
  const calculatedMax: EuiBreadcrumbsProps['max'] =
    max && responsiveMax ? Math.min(max, responsiveMax) : max || responsiveMax;

  const limitedBreadcrumbs = calculatedMax
    ? limitBreadcrumbs(breadcrumbElements, calculatedMax, breadcrumbs)
    : breadcrumbElements;

  const classes = classNames('euiBreadcrumbs', className, {
    'euiBreadcrumbs--truncate': truncate,
  });

  return (
    <nav aria-label="breadcrumb" className={classes} {...rest}>
      {limitedBreadcrumbs}
    </nav>
  );
};

// @deprecated This component has never been exported out the component's folder
export const EuiBreadcrumbsSimplified: FunctionComponent<EuiBreadcrumbsProps> = ({
  breadcrumbs,
  className,
  responsive = responsiveDefault,
  truncate = true,
  max = 5,
  ...rest
}) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState(
    getBreakpoint(typeof window === 'undefined' ? -Infinity : window.innerWidth)
  );

  const functionToCallOnWindowResize = throttle(() => {
    const newBreakpoint = getBreakpoint(window.innerWidth);
    if (newBreakpoint !== currentBreakpoint) {
      setCurrentBreakpoint(newBreakpoint);
    }
    // reacts every 50ms to resize changes and always gets the final update
  }, 50);

  // Add window resize handlers
  useEffect(() => {
    window.addEventListener('resize', functionToCallOnWindowResize);

    return () => {
      window.removeEventListener('resize', functionToCallOnWindowResize);
    };
  }, [responsive, functionToCallOnWindowResize]);

  const breadcrumbElements = breadcrumbs.map((breadcrumb, index) => {
    const {
      text,
      href,
      onClick,
      truncate,
      className: breadcrumbClassName,
      ...breadcrumbRest
    } = breadcrumb;

    const isFirstBreadcrumb = index === 0;
    const isLastBreadcrumb = index === breadcrumbs.length - 1;

    const breadcrumbWrapperClasses = classNames('euiBreadcrumbWrapper', {
      'euiBreadcrumbWrapper--first': isFirstBreadcrumb,
      'euiBreadcrumbWrapper--last': isLastBreadcrumb,
      'euiBreadcrumbWrapper--truncate': truncate,
    });

    const breadcrumbClasses = classNames('euiBreadcrumb', breadcrumbClassName, {
      'euiBreadcrumb--last': isLastBreadcrumb,
      'euiBreadcrumb--truncate': truncate,
    });

    const link =
      !href && !onClick ? (
        <EuiInnerText>
          {(ref, innerText) => (
            <span
              ref={ref}
              className={breadcrumbClasses}
              title={innerText}
              aria-current={isLastBreadcrumb ? 'page' : 'false'}
              {...breadcrumbRest}>
              {text}
            </span>
          )}
        </EuiInnerText>
      ) : (
        <EuiInnerText>
          {(ref, innerText) => (
            <EuiLink
              ref={ref}
              color={isLastBreadcrumb ? 'text' : 'subdued'}
              onClick={onClick}
              href={href}
              className={breadcrumbClasses}
              title={innerText}
              {...breadcrumbRest}>
              {text}
            </EuiLink>
          )}
        </EuiInnerText>
      );

    const breadcrumbWallClasses = classNames('euiBreadcrumbWall', {
      'euiBreadcrumbWall--single': isFirstBreadcrumb && isLastBreadcrumb,
    });

    const wrapper = <div className={breadcrumbWrapperClasses}>{link}</div>;
    const wall = isFirstBreadcrumb ? (
      <div className={breadcrumbWallClasses}>{wrapper}</div>
    ) : (
      wrapper
    );

    return <Fragment key={index}>{wall}</Fragment>;
  });

  // Use the default object if they simply passed `true` for responsive
  const responsiveObject =
    typeof responsive === 'object' ? responsive : responsiveDefault;

  // The max property collapses any breadcrumbs past the max quantity.
  // This is the same behavior we want for responsiveness.
  // So calculate the max value based on the combination of `max` and `responsive`

  // First, calculate the responsive max value
  const responsiveMax =
    responsive && responsiveObject[currentBreakpoint as EuiBreakpointSize]
      ? responsiveObject[currentBreakpoint as EuiBreakpointSize]
      : null;

  // Second, if both max and responsiveMax are set, use the smaller of the two. Otherwise, use the one that is set.
  const calculatedMax: EuiBreadcrumbsProps['max'] =
    max && responsiveMax ? Math.min(max, responsiveMax) : max || responsiveMax;

  const limitedBreadcrumbs = calculatedMax
    ? limitBreadcrumbs(breadcrumbElements, calculatedMax, breadcrumbs)
    : breadcrumbElements;

  const classes = classNames('euiBreadcrumbs', className, {
    'euiBreadcrumbs--truncate': truncate,
  });

  return (
    <nav aria-label="breadcrumb" className={classes} {...rest}>
      {limitedBreadcrumbs}
    </nav>
  );
};

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
  ReactNode,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';

import { EuiI18n } from '../../i18n';
import { EuiInnerText } from '../../inner_text';
import { EuiLink } from '../../link';
import { EuiPopover } from '../../popover';
import { EuiIcon } from '../../icon';
import { throttle } from '../../../services';
import { EuiBreakpointSize, getBreakpoint } from '../../../services/breakpoint';
import {
  EuiBreadcrumbResponsiveMaxCount,
  EuiBreadcrumb,
  EuiBreadcrumbsProps,
} from '../breadcrumbs';

export type EuiSimplifiedBreadcrumbsProps = EuiBreadcrumbsProps & {
  hideTrailingSeparator?: boolean;
  disableTrailingLink?: boolean;
  hideLastBreadCrumb?: boolean;
};

/* Try to fit breadcrumbs with at least 135px into the width of each of the BREAKPOINTS
 *    1. put aside 250px for the last breadcrumb and possible loss due to layout
 *    2. provide at least 135px for each remaining breadcrumb
 *
 *     * EuiBreadcrumbs has 48px padding on the side with a max-width of 160px
 *     * EuiSimplifiedBreadcrumbs has 24px for gap and separator
 *     * To be uniform
 *           160px - 48px + 24px ≈ 135px for each simplified breadcrumb
 *           275px - 48px + 24px ≈ 250px for last simplified breadcrumb and external spacing
 *
 *    numberOfBreadcrumbs = (breakpointWidth - 251) / 136 + 1
 */
const responsiveDefault: EuiBreadcrumbResponsiveMaxCount = {
  xs: 1, // Show only one
  s: 3, //  (575 - 250) / 135 + 1 = 3.40
  m: 4, //  (768 - 250) / 135 + 1 = 4.83
  l: 6, //  (992 - 250) / 135 + 1 = 6.49
  xl: 8, // (1200 - 250) / 135 + 1 = 8.04
  xxl: 11, // (1680 - 250) / 135 + 1 = 11.59
  xxxl: 13, // (1920 - 250) / 135 + 1 = 13.37
};
/*
  xxxl: 1920,
  xxl: 1680,
  xl: 1200,
  l: 992,
  m: 768,
  s: 575,
 */

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
        token="euiSimplifiedBreadcrumbs.collapsedBadge.ariaLabel"
        default="Show collapsed breadcrumbs">
        {(ariaLabel: string) => (
          <EuiLink
            className="euiSimplifiedBreadcrumb euiSimplifiedBreadcrumb__collapsedLink"
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
        <EuiPopover
          className="euiSimplifiedBreadcrumb euiSimplifiedBreadcrumb--collapsed"
          button={ellipsisButton}
          isOpen={isPopoverOpen}
          closePopover={() => setIsPopoverOpen(false)}>
          <EuiSimplifiedBreadcrumbs
            className="euiSimplifiedBreadcrumbs__inPopover"
            breadcrumbs={overflowBreadcrumbs}
            responsive={false}
            truncate={false}
            hideLastBreadCrumb={false}
            hideTrailingSeparator={true}
            disableTrailingLink={false}
            max={0}
          />
        </EuiPopover>
        <EuiBreadcrumbSeparator />
      </Fragment>
    );
  };

  if (max < breadcrumbs.length) {
    breadcrumbsAtStart.push(<EuiBreadcrumbCollapsed key="collapsed" />);
  }

  return [...breadcrumbsAtStart, ...breadcrumbsAtEnd];
};

const EuiBreadcrumbSeparator = () => (
  // preserveAspectRatio is none so we can stretch it vertically and keep the width fixed
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 8 12"
    preserveAspectRatio="none"
    className="euiBreadcrumbSeparator">
    <path fill="currentColor" d="M2 12H0L6 0h2z" />
  </svg>
);

export const EuiSimplifiedBreadcrumbs: FunctionComponent<EuiSimplifiedBreadcrumbsProps> = ({
  breadcrumbs,
  className,
  responsive = responsiveDefault,
  truncate = true,
  max = 5,
  hideTrailingSeparator,
  disableTrailingLink,
  hideLastBreadCrumb,
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

  const isInPopover = className === 'euiSimplifiedBreadcrumbs__inPopover';

  const breadcrumbElements = breadcrumbs.map((breadcrumb, index) => {
    const {
      text,
      href,
      onClick,
      truncate,
      className: breadcrumbClassName,
      ...breadcrumbRest
    } = breadcrumb;

    const breadcrumbsLength = breadcrumbs.length;
    const isLastBreadcrumb = index === breadcrumbsLength - 1;

    if (isLastBreadcrumb && hideLastBreadCrumb) return null;

    const isFirstBreadcrumb = index === 0;
    // If hideLastBreadCrumb, the trailing breadcrumb would be the one before the last
    const isTrailingBreadcrumb =
      index >= breadcrumbsLength - (hideLastBreadCrumb ? 2 : 1);

    const breadcrumbClasses = classNames(
      'euiSimplifiedBreadcrumb',
      breadcrumbClassName,
      {
        'euiSimplifiedBreadcrumb--last': isLastBreadcrumb,
        'euiSimplifiedBreadcrumb--truncate': truncate,
      }
    );

    const link =
      !(href || onClick) || (isTrailingBreadcrumb && disableTrailingLink) ? (
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

    const wall = isFirstBreadcrumb ? (
      <div
        className={classNames('euiSimplifiedBreadcrumbWall', {
          'euiSimplifiedBreadcrumbWall--single':
            isFirstBreadcrumb && isLastBreadcrumb,
        })}>
        {link}
      </div>
    ) : (
      link
    );

    const separator =
      hideTrailingSeparator && isTrailingBreadcrumb ? null : (
        <EuiBreadcrumbSeparator />
      );

    return (
      <Fragment key={index}>
        {wall}
        {separator}
      </Fragment>
    );
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

  const classes = classNames('euiSimplifiedBreadcrumbs', className, {
    'euiSimplifiedBreadcrumbs--truncate': truncate,
  });

  return (
    <nav aria-label="breadcrumb" className={classes} {...rest}>
      {limitedBreadcrumbs}
    </nav>
  );
};

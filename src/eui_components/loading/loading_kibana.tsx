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

import React, { HTMLAttributes, FunctionComponent } from 'react';
import classNames from 'classnames';
import { CommonProps, keysOf } from '../common';
import { EuiIcon } from '../icon';
import { deprecatedComponentWarning } from '../../utils';

const sizeToClassNameMap = {
  m: 'euiLoadingKibana--medium',
  l: 'euiLoadingKibana--large',
  xl: 'euiLoadingKibana--xLarge',
};

export const SIZES = keysOf(sizeToClassNameMap);

export type EuiLoadingKibanaProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    size?: keyof typeof sizeToClassNameMap;
  };

const EuiLoadingKibanaComponent: FunctionComponent<EuiLoadingKibanaProps> = ({
  size = 'm',
  className,
  ...rest
}) => {
  const classes = classNames(
    'euiLoadingKibana',
    sizeToClassNameMap[size],
    className
  );

  return (
    <span className={classes} {...rest}>
      <span className="euiLoadingKibana__icon">
        <EuiIcon type="logoKibana" size={size} />
      </span>
    </span>
  );
};

EuiLoadingKibanaComponent.displayName = 'EuiLoadingKibana';

/**
 * @deprecated EuiLoadingKibana is deprecated in favor of EuiLoadingLogo and will be removed in v2.0.0.
 */
export const EuiLoadingKibana = deprecatedComponentWarning({
  newComponentName: 'EuiLoadingLogo',
  version: '2.0.0',
})(EuiLoadingKibanaComponent);

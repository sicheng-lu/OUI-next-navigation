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

import React from 'react';
import { GuideSectionTypes } from '../../components';
import { OuiCode } from '../../../../src/components';

import ThreadLeftNavDemo from './thread_left_nav_demo';
const threadLeftNavDemoSource = require('!!raw-loader!./thread_left_nav_demo');

export const ThreadLeftNavExample = {
  title: 'Thread left nav',
  intro: (
    <p>
      <strong>OuiThreadLeftNav</strong> is a narrow 48px collapsed icon-only
      navigation sidebar used in the Agentic OSD Utility pattern. It provides
      a logo slot, scrollable icon nav items with active/hover states, and a
      footer for workspace and utility actions.
    </p>
  ),
  sections: [
    {
      title: 'Thread left nav',
      text: (
        <>
          <p>
            The nav renders at a fixed <OuiCode>48px</OuiCode> width with a
            semi-transparent background (<OuiCode>$ouiColorLightestShade</OuiCode>{' '}
            at 60% opacity) and a right border. It uses{' '}
            <OuiCode>backdrop-filter: blur(12px)</OuiCode> for a glassmorphism
            effect.
          </p>
          <p>
            Pass <OuiCode>items</OuiCode> as an array of nav item objects. Each
            item supports <OuiCode>isActive</OuiCode>, <OuiCode>onClick</OuiCode>,
            and <OuiCode>rulerAfter</OuiCode> for section separators.
          </p>
        </>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: threadLeftNavDemoSource,
        },
      ],
      demo: <ThreadLeftNavDemo />,
    },
  ],
};

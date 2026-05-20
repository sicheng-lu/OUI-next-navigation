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

import ThreadSessionListItemDemo from './thread_session_list_item_demo';
const threadSessionListItemDemoSource = require('!!raw-loader!./thread_session_list_item_demo');

export const ThreadSessionListItemExample = {
  title: 'Thread session list item',
  intro: (
    <p>
      <strong>OuiThreadSessionListItem</strong> is a card-style list item used
      to represent a session in the Agentic OSD Utility session list. It
      displays an icon, session title, and meta information such as timestamp
      and tab count.
    </p>
  ),
  sections: [
    {
      title: 'Thread session list item',
      text: (
        <>
          <p>
            Pass <OuiCode>title</OuiCode> and <OuiCode>meta</OuiCode> for the
            session label and subtitle. Use <OuiCode>icon</OuiCode> to render
            any OUI icon in the left icon area.
          </p>
          <p>
            Set <OuiCode>isActive</OuiCode> to highlight the currently selected
            session with a primary color border and background tint, plus an
            active indicator dot on the right.
          </p>
        </>
      ),
      source: [
        {
          type: GuideSectionTypes.JS,
          code: threadSessionListItemDemoSource,
        },
      ],
      demo: <ThreadSessionListItemDemo />,
    },
  ],
};

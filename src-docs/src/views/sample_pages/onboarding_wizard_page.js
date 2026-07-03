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
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';

import {
  OuiButtonIcon,
  OuiIcon,
  OuiSmallButtonEmpty,
  OuiText,
  OuiTitle,
  OuiSpacer,
  OuiLoadingSpinner,
  OuiCode,
  OuiCheckbox,
  OuiToolTip,
  OuiCompressedTextArea,
} from '../../../../src/components';

import { SessionLeftNav } from './session_left_nav';
import { Mascot } from '../../../../olly-mascot/Mascot';
import { ThemeContext } from '../../components/with_theme';
import { OpenSearch3DLogo } from './opensearch_3d_logo';

/**
 * STEPS CONFIGURATION
 * Onboarding flow for OpenSearch Observability Data Collection.
 *
 * Main steps:
 *   1. Set up data sources  (Q1 use case, Q2 volume, Q3 data location + detection/branches)
 *   2. Review and confirm
 *   3. Collecting your data
 *
 * Step indices:
 *   0  Q1 — use case          (no branch)
 *   1  Q2 — daily volume      (no branch)
 *   2  Q3 — where data lives  (branches: aws-services → 3, instrument-app → 4, migrate → 8)
 *   3  Auto-detection scan    (aws-services: 6-source detection + scope/preview) → W1
 *   4  Instrument State A     (choose target: k8s/docker/linux/windows/ec2)
 *   5  Instrument State B     (show collector config)
 *   6  Instrument State C     (collector detected — brief status)
 *   7  Instrument State D     (confirm recommended configs) → W1
 *   8  Migrate State A        (choose source: splunk/datadog/elastic/vendor-neutral)
 *   9  Migrate State B        (forwarding guidance)
 *   10 Migrate State C        (receiving — brief status)
 *   11 Migrate State D        (confirm recommended configs) → W1
 *   12 W1 — Destination       (shared wrap-up: new/existing/custom)
 *   13 W2 — Data handling     (shared wrap-up: remove PID / service catalog)
 *   14 W3 — Step 1 summary    (shared wrap-up: adaptive summary) → Step 2
 *   15 OTel collector setup   (legacy, unreached)
 *   16 Telemetry storage      (legacy, unreached)
 *   17 Review and confirm     (mainStep 2)
 *   18 Collecting your data   (mainStep 3)
 *
 * All three branches converge at W1 → W2 → W3 → Review (Step 2).
 */
const STEPS = [
  // ── Q1: use case ────────────────────────────────────────────────────────
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 1,
    question:
      'Welcome to OpenSearch Observability. I\u2019m Olly, I\u2019ll help you set up your pipeline.\n\nWhat\u2019s your primary use case?',
    optionType: 'chips',
    options: [
      { key: 'app-monitoring', label: 'Application monitoring (logs, metrics, traces)' },
      { key: 'ai-monitoring', label: 'AI agent monitoring' },
      { key: 'unified', label: 'Both \u2014 unified observability' },
      { key: 'security', label: 'Security & audit analysis' },
    ],
    confirmation: (selected) => {
      const labels = {
        'app-monitoring': 'Application monitoring',
        'ai-monitoring': 'AI agent monitoring',
        'unified': 'Unified observability',
        'security': 'Security & audit analysis',
      };
      const label = labels[selected] || selected;
      return `Got it \u2014 I\u2019ll recommend starter dashboards, alerts and queries tuned for ${label}.`;
    },
    rightPanel: { contentType: 'setup-context' },
  },

  // ── Q2: daily volume ─────────────────────────────────────────────────────
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 2,
    question: 'What\u2019s your expected daily volume? (Total across all data sources.)',
    optionType: 'chips',
    options: [
      { key: 'starter', label: 'Getting started (< 10 GB/day)' },
      { key: 'growing', label: 'Growing (10\u2013100 GB/day)' },
      { key: 'scale', label: 'At scale (100 GB\u20131 TB/day)' },
      { key: 'enterprise', label: 'Enterprise (1+ TB/day)' },
      { key: 'demo', label: 'Demo environment' },
    ],
    confirmation: (selected) => {
      const infra = {
        starter: 'a lightweight managed cluster',
        growing: 'a serverless collection',
        scale: 'a serverless collection with the Optimized engine \u2014 columnar storage handles this volume efficiently',
        enterprise: 'a dedicated high-throughput cluster with shard-level tuning',
        demo: 'sample data loaded into a demo cluster',
      };
      return `At that volume I\u2019ll set you up on ${infra[selected] || 'the right infrastructure'}.`;
    },
    rightPanel: { contentType: 'setup-context' },
  },

  // ── Q3: where does data live (BRANCH) ───────────────────────────────────
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 3,
    question: 'Where does your data live today?',
    optionType: 'chips',
    options: [
      { key: 'aws-services', label: 'From existing AWS services', primary: true },
      { key: 'instrument-app', label: 'No existing service (Instrument application)' },
      { key: 'migrate', label: 'Migrate from others (Splunk, Datadog, Elastic)' },
    ],
    confirmation: (selected) => {
      const messages = {
        'aws-services': 'Scanning your AWS account for active data sources\u2026',
        'instrument-app': 'Let\u2019s instrument your application \u2014 coming up next.',
        'migrate': 'Let\u2019s forward your existing telemetry \u2014 coming up next.',
      };
      return messages[selected] || '';
    },
    rightPanel: { contentType: 'setup-context' },
  },

  // ── Auto-detection scan (aws-services branch) ────────────────────────────
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-detect',
    question: 'Scanning your AWS account for active data sources\u2026',
    optionType: 'auto-discovery',
    options: [],
    confirmation: (selected, recommendationContext) =>
      getDetectionSummaryMessage(recommendationContext),
    rightPanel: {
      title: 'Source Detection',
      subtitle: 'Detected data sources',
      contentType: 'source-detection',
    },
  },

  // ── Instrument application branch (Prompt 3) ────────────────────────────
  // State A: Choose instrument target
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-instrument-target',
    question: 'Let\u2019s instrument your application. Where does it run?',
    optionType: 'chips',
    options: [
      { key: 'kubernetes', label: 'Kubernetes' },
      { key: 'docker', label: 'Docker' },
      { key: 'linux', label: 'Linux' },
      { key: 'windows', label: 'Windows' },
      { key: 'ec2', label: 'EC2 instance' },
    ],
    confirmation: (selected, recommendationContext) => {
      const targetLabel = INSTRUMENT_TARGET_LABELS[selected] || selected;
      const useCaseLabel = USE_CASE_LABELS[recommendationContext?.useCase] || 'observability';
      return `Here\u2019s the OpenTelemetry collector config for ${targetLabel} \u2014 paste it into your project. I\u2019ve tuned it for your ${useCaseLabel.toLowerCase()} goal.`;
    },
    rightPanel: { contentType: 'setup-context' },
  },

  // State B: Show collector config
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-instrument-config',
    question: '', // Confirmation message from State A is shown instead
    optionType: 'chips',
    options: [
      { key: 'continue', label: 'I\u2019ve added it \u2014 continue', primary: true },
      { key: 'different-target', label: 'Show me a different target' },
    ],
    confirmation: (selected) => {
      if (selected === 'different-target') {
        return ''; // Will go back to State A
      }
      return 'Collector detected \u2014 telemetry is starting to flow.';
    },
    rightPanel: {
      title: 'Collector Configuration',
      subtitle: 'Paste into your project — read only',
      contentType: 'instrument-collector-config',
    },
  },

  // State C: Collector detected (brief status)
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-instrument-ready',
    question: 'Collector detected \u2014 telemetry is starting to flow.',
    optionType: 'chips',
    options: [
      { key: 'continue', label: 'Continue', primary: true },
    ],
    confirmation: (selected, recommendationContext) => {
      const useCaseLabel = USE_CASE_LABELS[recommendationContext?.useCase] || 'observability';
      const volumeLabel = VOLUME_LABELS[recommendationContext?.totalDailyVolume] || 'your expected volume';
      return `Based on your ${useCaseLabel.toLowerCase()} goal and ${volumeLabel.toLowerCase()}, here\u2019s the setup I recommend.`;
    },
    rightPanel: { contentType: 'setup-context' },
  },

  // State D: Confirm recommended configs
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-instrument-confirm',
    question: '', // Confirmation message from State C is shown instead
    optionType: 'chips',
    options: [
      { key: 'looks-good', label: 'Looks good \u2014 continue', primary: true },
      { key: 'customize', label: 'Customize' },
    ],
    confirmation: (selected) => {
      if (selected === 'customize') {
        return 'Manual config coming soon.';
      }
      return 'Finalizing your setup \u2014 coming up next.';
    },
    rightPanel: {
      title: 'Recommended Configuration',
      subtitle: 'Based on your setup',
      contentType: 'instrument-recommended-config',
    },
  },

  // ── Migrate branch (Prompt 4) ────────────────────────────────────────────
  // State A: Identify current data mover
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-migrate-source',
    question: 'Let\u2019s forward your existing telemetry to OpenSearch. What are you moving from?',
    optionType: 'chips',
    options: [
      { key: 'splunk', label: 'Splunk' },
      { key: 'datadog', label: 'Datadog' },
      { key: 'elastic', label: 'Elastic' },
      { key: 'vendor-neutral', label: 'Vendor-neutral collector' },
    ],
    confirmation: (selected) => {
      const sourceLabel = MIGRATE_SOURCE_LABELS[selected] || selected;
      const easyNote = selected === 'elastic' 
        ? ' (near-native cutover — OpenSearch forked from Elasticsearch)'
        : '';
      return `Here\u2019s how to point ${sourceLabel} at OpenSearch${easyNote} \u2014 reconfigure your existing forwarder, no re-instrumentation needed.`;
    },
    rightPanel: { contentType: 'setup-context' },
  },

  // State B: Forwarding guidance
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-migrate-config',
    question: '', // Confirmation message from State A is shown instead
    optionType: 'chips',
    options: [
      { key: 'done', label: 'Done \u2014 data is flowing', primary: true },
      { key: 'different-source', label: 'Choose a different source' },
    ],
    confirmation: (selected) => {
      if (selected === 'different-source') {
        return ''; // Will go back to State A
      }
      return 'Receiving forwarded telemetry \u2014 data is starting to flow.';
    },
    rightPanel: {
      title: 'Forward to OpenSearch',
      subtitle: 'Reconfigure your existing forwarder — read only',
      contentType: 'migrate-forwarding-config',
    },
  },

  // State C: Receiving (brief status)
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-migrate-receiving',
    question: 'Receiving forwarded telemetry \u2014 data is starting to flow.',
    optionType: 'chips',
    options: [
      { key: 'continue', label: 'Continue', primary: true },
    ],
    confirmation: (selected, recommendationContext) => {
      const useCaseLabel = USE_CASE_LABELS[recommendationContext?.useCase] || 'observability';
      const volumeLabel = VOLUME_LABELS[recommendationContext?.totalDailyVolume] || 'your expected volume';
      return `Based on your ${useCaseLabel.toLowerCase()} goal and ${volumeLabel.toLowerCase()}, here\u2019s where your forwarded data will land.`;
    },
    rightPanel: { contentType: 'setup-context' },
  },

  // State D: Confirm recommended configs
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: '3-migrate-confirm',
    question: '', // Confirmation message from State C is shown instead
    optionType: 'chips',
    options: [
      { key: 'looks-good', label: 'Looks good \u2014 continue', primary: true },
      { key: 'customize', label: 'Customize' },
    ],
    confirmation: (selected) => {
      if (selected === 'customize') {
        return 'Manual config coming soon.';
      }
      return 'Finalizing your setup \u2014 coming up next.';
    },
    rightPanel: {
      title: 'Recommended Configuration',
      subtitle: 'Based on your setup',
      contentType: 'migrate-recommended-config',
    },
  },

  // ── SHARED WRAP-UP (Prompt 5) — all three branches converge here ─────────
  // W1: Destination
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 'wrap-destination',
    question: 'Where should this data land?',
    optionType: 'wrapup',
    options: [],
    rightPanel: {
      title: 'Destination',
      subtitle: 'Where your data lands',
      contentType: 'wrapup-destination',
    },
  },

  // W2: Data handling
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 'wrap-datahandling',
    question: 'Two optional safeguards before we deploy.',
    optionType: 'wrapup',
    options: [],
    rightPanel: {
      title: 'Data Handling',
      subtitle: 'Optional safeguards',
      contentType: 'wrapup-datahandling',
    },
  },

  // W3: Step 1 final check
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 'wrap-summary',
    question: 'Here\u2019s everything from Step 1 \u2014 look good?',
    optionType: 'wrapup',
    options: [],
    rightPanel: {
      title: 'Step 1 Summary',
      subtitle: 'Everything you configured',
      contentType: 'wrapup-summary',
    },
  },

  // ── OTel collector setup (aws-services → after detection scope accepted) ──
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 4,
    question:
      'Run the following command to start your OpenTelemetry collector. Once it\u2019s running, click \u201cI am ready\u201d to continue.',
    optionType: 'chips',
    options: [
      { key: 'ready', label: 'I am ready', primary: true },
      { key: 'goback', label: 'Go back' },
    ],
    confirmation: () =>
      'Collector configured. Moving to data source connection.',
    rightPanel: {
      title: 'Collector Setup',
      subtitle: 'Run this command to start the OTel collector',
      contentType: 'collector-setup',
    },
  },

  // ── Telemetry storage ────────────────────────────────────────────────────
  {
    title: 'Set up data sources',
    mainStep: 1,
    subStep: 5,
    question:
      'Based on your setup, I recommend storing your telemetry in an OpenSearch Serverless Collection with Optimized engine. Columnar storage handles time-series log data more efficiently.',
    optionType: 'chips',
    options: [
      { key: 'looks-good', label: 'Looks good', primary: true },
      { key: 'customize', label: 'Customize' },
      { key: 'store-existing', label: 'Store in existing' },
    ],
    confirmation: (selected) => {
      const messages = {
        'looks-good':
          'Telemetry will be stored in a new OpenSearch Serverless Collection with Optimized engine.',
        customize: 'Telemetry storage customized. Configuration saved.',
        'store-existing':
          'Telemetry will be stored in your existing OpenSearch Serverless Collection.',
      };
      return messages[selected] || 'Storage configured.';
    },
    rightPanel: {
      title: 'Telemetry Storage',
      subtitle: 'Recommended for your setup',
      contentType: 'telemetry-storage',
    },
  },

  // ── Review and confirm ───────────────────────────────────────────────────
  {
    title: 'Review and confirm',
    mainStep: 2,
    question: 'Here\u2019s a summary of your setup. Everything look good?',
    dynamicQuestion: (selections) => {
      if (selections[2] === 'instrument-app') {
        return 'Here\u2019s a summary of your setup. Everything look good?\n\nBased on your data, I recommend storing your telemetry in an OpenSearch Serverless Collection with Optimized engine. Columnar storage handles time-series log data more efficiently.';
      }
      return 'Here\u2019s a summary of your setup. Everything look good?';
    },
    optionType: 'chips',
    options: [
      {
        key: 'deploy',
        label: 'Looks good \u2014 deploy my configuration',
        primary: true,
      },
      { key: 'changes', label: 'I want to make changes' },
    ],
    confirmation: () => 'Configuration deployed! Collecting data now.',
    rightPanel: {
      title: 'Configuration Summary',
      subtitle: 'Review before deploying',
      contentType: 'summary',
    },
  },

  // ── Collecting your data ─────────────────────────────────────────────────
  {
    title: 'Collecting your data',
    mainStep: 3,
    question:
      'Your pipeline is deployed and data is flowing in! I\u2019m collecting logs, metrics, and traces from your sources. You can watch the live counts on the right \u2014 once you\u2019re satisfied, continue to finish setup.',
    optionType: 'chips',
    options: [
      { key: 'continue', label: 'Continue', primary: true },
      { key: 'import', label: 'Import dashboards and queries' },
    ],
    confirmation: () =>
      'Data collection verified. Your observability pipeline is active.',
    rightPanel: {
      title: 'Live Data Collection',
      subtitle: 'Watching your data flow in real-time',
      contentType: 'live-counters',
    },
  },
];

// Docker command for Step 3
const OTEL_COMMAND = `docker run \\
  -e CLICKHOUSE_ENDPOINT="https://d9vcnuuz5c.us-west-2.aws.clickhouse.cloud:8443" \\
  -e CLICKHOUSE_USER="default" \\
  -e CLICKHOUSE_PASSWORD="<your_password_here>" \\
  -p 4317:4317 \\
  -p 4318:4318 \\
  clickhouse/clickstack-otel-collector:latest`;

// ─────────────────────────────────────────────
// RIGHT PANEL SUBCOMPONENTS
// ─────────────────────────────────────────────

const CHECKLIST_STEPS = [
  {
    label: 'Set observability goal',
    description: 'Choose what you want to observe',
  },
  {
    label: 'Collect data from environment',
    description: 'Configure your collector and environment',
  },
];

const GettingStartedPanel = () => {
  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="integrationObservability"
        title="Getting Started"
        subtitle="Set up your data"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__checklist">
        {CHECKLIST_STEPS.map((item, i) => (
          <div key={i} className="onboardWizard__checklistItem">
            <div className="onboardWizard__checklistText">
              <OuiText size="s">
                <strong>{item.label}</strong>
              </OuiText>
              <OuiText size="xs" color="subdued">
                <p style={{ margin: 0 }}>{item.description}</p>
              </OuiText>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EnvironmentPanel = ({ selectedOption }) => {
  const environments = [
    {
      key: 'opentelemetry',
      icon: 'integrationObservability',
      name: 'OpenTelemetry',
      badge: 'Native integration',
      setupTime: '~5 min',
    },
    {
      key: 'eks',
      icon: 'logo_aws',
      name: 'EKS',
      badge: 'Managed service',
      setupTime: '~10 min',
    },
    {
      key: 'kubernetes',
      icon: 'logo_kubernetes',
      name: 'Kubernetes',
      badge: 'Self-managed',
      setupTime: '~8 min',
    },
    {
      key: 'other',
      icon: 'compute',
      name: 'Other',
      badge: 'Custom setup',
      setupTime: '~15 min',
    },
  ];

  const selected = environments.find((e) => e.key === selectedOption);

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="compute"
        title="Environment"
        subtitle="Supported collection environments"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__envGrid">
        {environments.map((env, index) => (
          <div
            key={env.key}
            className={`onboardWizard__envCard onboardWizard__envCard--staggerIn${
              selectedOption === env.key
                ? ' onboardWizard__envCard--selected'
                : ''
            }`}
            style={{ animationDelay: `${index * 80}ms` }}>
            <OuiIcon type={env.icon} size="l" />
            <OuiText size="s">
              <strong>{env.name}</strong>
            </OuiText>
            <span className="onboardWizard__envBadge">{env.badge}</span>
          </div>
        ))}
      </div>
      {selected && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__envDetail onboardWizard__envDetail--fadeIn">
            <OuiText size="xs">
              <strong>What&rsquo;s included</strong>
            </OuiText>
            <OuiSpacer size="xs" />
            <ul className="onboardWizard__envDetailList">
              <li>Collector configuration</li>
              <li>Pre-built dashboards</li>
              <li>Alerting templates</li>
            </ul>
            <OuiSpacer size="xs" />
            <OuiText size="xs" color="subdued">
              Estimated setup time: {selected.setupTime}
            </OuiText>
          </div>
        </>
      )}
    </div>
  );
};

const EKS_DISCOVERY_CLUSTERS = [
  {
    name: 'prod-app-cluster',
    region: 'us-west-2',
    services: 6,
    status: 'Active',
  },
  {
    name: 'staging-services',
    region: 'us-west-2',
    services: 5,
    status: 'Active',
  },
  {
    name: 'dev-playground',
    region: 'us-east-1',
    services: 3,
    status: 'Active',
  },
];

const EKSDiscoveryPanel = ({ discoveryPhase }) => {
  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="logo_aws"
        title="EKS Discovery"
        subtitle="Detecting clusters and services"
      />
      <OuiSpacer size="l" />
      {discoveryPhase === 'scanning' && (
        <div className="onboardWizard__eksScanning">
          <div className="onboardWizard__eksScanRow">
            <OuiLoadingSpinner size="s" />
            <OuiText size="s">Scanning AWS account for EKS clusters...</OuiText>
          </div>
          <OuiSpacer size="m" />
          <div className="onboardWizard__eksScanProgress">
            <div className="onboardWizard__eksScanProgressBar" />
          </div>
        </div>
      )}
      {discoveryPhase === 'found' && (
        <div className="onboardWizard__eksResults">
          <div className="onboardWizard__eksResultSummary">
            <div className="onboardWizard__eksResultBadge">
              <OuiIcon type="checkInCircleFilled" size="s" color="success" />
              <OuiText size="s">
                <strong>3 EKS clusters</strong> detected
              </OuiText>
            </div>
            <OuiSpacer size="xs" />
            <div className="onboardWizard__eksResultBadge">
              <OuiIcon type="checkInCircleFilled" size="s" color="success" />
              <OuiText size="s">
                <strong>14 services</strong> instrumented with OpenTelemetry
              </OuiText>
            </div>
          </div>
          <OuiSpacer size="l" />
          <div className="onboardWizard__eksClusterList">
            {EKS_DISCOVERY_CLUSTERS.map((cluster) => (
              <div key={cluster.name} className="onboardWizard__eksClusterCard">
                <div className="onboardWizard__eksClusterHeader">
                  <OuiIcon type="compute" size="m" />
                  <div>
                    <OuiText size="s">
                      <strong>{cluster.name}</strong>
                    </OuiText>
                    <OuiText size="xs" color="subdued">
                      {cluster.region} &middot; {cluster.status}
                    </OuiText>
                  </div>
                </div>
                <div className="onboardWizard__eksClusterServices">
                  <OuiText size="xs" color="subdued">
                    {cluster.services} instrumented services
                  </OuiText>
                  <span className="onboardWizard__eksClusterLive">
                    <span className="onboardWizard__liveDot" />
                    <OuiText size="xs">Active</OuiText>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <OuiSpacer size="m" />
          <OuiText size="xs" color="subdued">
            <p style={{ margin: 0 }}>
              Waiting for additional data... Auto-advancing to review.
            </p>
          </OuiText>
        </div>
      )}
    </div>
  );
};

const CollectorSetupPanel = ({ confirmed }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(OTEL_COMMAND.replace(/\\\n\s*/g, ' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="logo_docker"
        title="Collector Setup"
        subtitle="Run this command to start the OTel collector"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__codeBlock">
        <button
          type="button"
          className="onboardWizard__copyBtn"
          onClick={handleCopy}
          aria-label="Copy command to clipboard">
          <OuiIcon type={copied ? 'check' : 'copy'} size="s" />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <OuiCode language="bash" className="onboardWizard__code">
          {OTEL_COMMAND}
        </OuiCode>
      </div>
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p>
          Replace <code>&lt;your_password_here&gt;</code> with your actual
          password. The collector will listen on ports 4317 (gRPC) and 4318
          (HTTP) for incoming telemetry data.
        </p>
      </OuiText>
      {confirmed && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__verifiedStatus">
            <OuiIcon type="checkInCircleFilled" size="m" color="success" />
            <OuiText size="s">
              <strong>Collector detected</strong>
            </OuiText>
          </div>
        </>
      )}
    </div>
  );
};

const TelemetryStoragePanel = ({ selectedOption }) => {
  const recommendation = {
    type: 'OpenSearch Serverless Collection',
    subtitle: 'Optimized engine \u2014 Columnar storage',
    icon: 'logo_opensearch',
    reason:
      'Serverless with columnar storage handles time-series log data more efficiently, giving you faster queries, lower storage costs, and no infrastructure to manage for observability workloads.',
    specs: [
      { label: 'Engine', value: 'Optimized (Columnar)' },
      { label: 'Index pattern', value: 'otel-v1-*' },
      { label: 'Default retention', value: '30 days' },
    ],
  };

  const alternative = {
    type: 'OpenSearch Managed Cluster',
    reason:
      'Better suited for workloads requiring full cluster control, custom plugin support, or dedicated infrastructure.',
  };

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="database"
        title="Telemetry Storage"
        subtitle="Recommended for your setup"
      />
      <OuiSpacer size="l" />
      <div
        className={`onboardWizard__storageCard${
          selectedOption === 'looks-good'
            ? ' onboardWizard__storageCard--confirmed'
            : ''
        }`}>
        <div className="onboardWizard__storageCardHeader">
          <OuiIcon type={recommendation.icon} size="xl" />
          <div>
            <OuiText size="s">
              <strong>{recommendation.type}</strong>
            </OuiText>
            <OuiText size="xs" color="subdued">
              {recommendation.subtitle}
            </OuiText>
            <span className="onboardWizard__storageBadge">Recommended</span>
          </div>
        </div>
        <OuiSpacer size="s" />
        <OuiText size="xs" color="subdued">
          <p style={{ margin: 0 }}>{recommendation.reason}</p>
        </OuiText>
        <OuiSpacer size="m" />
        <div className="onboardWizard__storageSpecs">
          {recommendation.specs.map((spec) => (
            <div key={spec.label} className="onboardWizard__storageSpecRow">
              <OuiText size="xs" color="subdued">
                {spec.label}
              </OuiText>
              <OuiText size="xs">
                <strong>{spec.value}</strong>
              </OuiText>
            </div>
          ))}
        </div>
      </div>
      <OuiSpacer size="m" />
      <div className="onboardWizard__storageAlt">
        <OuiText size="xs" color="subdued">
          <strong>Alternative:</strong> {alternative.type} &mdash;{' '}
          {alternative.reason}
        </OuiText>
      </div>
      {selectedOption === 'customize' && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__storageCustomize">
            <OuiText size="xs">
              <strong>Customize configuration</strong>
            </OuiText>
            <OuiSpacer size="s" />
            <OuiText size="xs" color="subdued">
              <p style={{ margin: 0 }}>
                Adjust resource type, OCU allocation, replicas, retention
                policy, and index naming from the Data Management page after
                setup.
              </p>
            </OuiText>
          </div>
        </>
      )}
      {selectedOption === 'store-existing' && (
        <>
          <OuiSpacer size="l" />
          <div className="onboardWizard__storageExisting">
            <OuiText size="xs">
              <strong>Select existing resource</strong>
            </OuiText>
            <OuiSpacer size="s" />
            <div className="onboardWizard__storageExistingList">
              <div className="onboardWizard__storageExistingItem">
                <OuiIcon type="logo_opensearch" size="s" />
                <div>
                  <OuiText size="xs">
                    <strong>prod-observability-cluster</strong>
                  </OuiText>
                  <OuiText size="xs" color="subdued">
                    Serverless Collection &middot; us-west-2 &middot; Active
                  </OuiText>
                </div>
              </div>
              <div className="onboardWizard__storageExistingItem">
                <OuiIcon type="logo_opensearch" size="s" />
                <div>
                  <OuiText size="xs">
                    <strong>dev-telemetry-collection</strong>
                  </OuiText>
                  <OuiText size="xs" color="subdued">
                    Serverless Collection &middot; us-east-1 &middot; Active
                  </OuiText>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p style={{ margin: 0 }}>
          You can change storage settings later from the Data Management page.
        </p>
      </OuiText>
    </div>
  );
};

const SummaryPanel = ({ allSelections, recommendationContext, selectedScope, sourceScope }) => {
  const scopeCount = (selectedScope && selectedScope.length
    ? selectedScope.length
    : ALL_DETECTED_KEYS.length);
  const estGb = getTotalEstGbPerDay(selectedScope, sourceScope);
  const awsDataSourceValue = estGb > 0
    ? `Existing AWS services (${scopeCount} of ${ALL_DETECTED_KEYS.length} sources · ~${formatGb(estGb)} GB/day)`
    : `Existing AWS services (${scopeCount} of ${ALL_DETECTED_KEYS.length} sources selected)`;
  const summaryRows = [
    {
      label: 'Use case',
      value: USE_CASE_LABELS[recommendationContext?.useCase] || '—',
    },
    {
      label: 'Expected daily volume',
      value: VOLUME_LABELS[recommendationContext?.totalDailyVolume] || '—',
    },
    {
      label: 'Data source',
      value: {
        'aws-services': awsDataSourceValue,
        'instrument-app': 'Instrument application',
        'migrate': 'Migrate from existing observability tool',
      }[allSelections[2]] || '—',
    },
    {
      label: 'Telemetry storage',
      value: allSelections[7]
        ? {
            'looks-good': getStorageRecommendation(recommendationContext),
            customize: 'Custom configuration',
            'store-existing': 'Existing resource',
          }[allSelections[7]]
        : getStorageRecommendation(recommendationContext),
    },
  ];

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="checkInCircleFilled"
        title="Configuration Summary"
        subtitle="Review before deploying"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__summaryList">
        {summaryRows.map((row) => (
          <div key={row.label} className="onboardWizard__summaryRow">
            <OuiText size="xs" color="subdued">{row.label}</OuiText>
            <OuiText size="s"><strong>{row.value}</strong></OuiText>
          </div>
        ))}
      </div>
    </div>
  );
};

// Generates initial data points for the streaming area chart
const generateInitialData = (points, baseValue, variance) =>
  Array.from(
    { length: points },
    () => baseValue + Math.floor(Math.random() * variance)
  );

// Attempt a smooth cubic bezier path through points (mimics monotone interpolation)
const buildSmoothPath = (points, width, height, padding) => {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, i) => ({
    x: (i / (points.length - 1)) * width,
    y: padding + (1 - (val - min) / range) * (height - padding * 2),
  }));

  // Build a smooth cubic bezier path
  let path = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return path;
};

// A single streaming area chart using pure SVG — gradient fill like shadcn's area chart
const LiveStreamAreaChart = ({ color, data }) => {
  const width = 320;
  const height = 80;
  const padding = 4;
  const gradientId = useMemo(() => `area-grad-${color.replace('#', '')}`, [
    color,
  ]);

  // Build a sharp polyline (no smooth curves — blueprint style)
  const points = data.map((val, i) => {
    const max = Math.max(...data);
    const x = (i / (data.length - 1)) * width;
    const y = padding + (1 - val / max) * (height - padding * 2);
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      className="onboardWizard__areaChart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Horizontal grid — dashed, blueprint style */}
      {[0.25, 0.5, 0.75].map((ratio, i) => (
        <line
          key={i}
          x1="0"
          y1={height * ratio}
          x2={width}
          y2={height * ratio}
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="3 4"
          opacity="0.12"
        />
      ))}
      {/* Baseline */}
      <line
        x1="0"
        y1={height}
        x2={width}
        y2={height}
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.15"
      />
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
};

const LiveCountersPanel = () => {
  const MAX_POINTS = 30;

  const [counts, setCounts] = useState({
    logs: 1204,
    metrics: 8491,
    traces: 342,
  });

  const [chartData, setChartData] = useState({
    logs: generateInitialData(MAX_POINTS, 12, 8),
    metrics: generateInitialData(MAX_POINTS, 18, 12),
    traces: generateInitialData(MAX_POINTS, 6, 4),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        logs: prev.logs + Math.floor(Math.random() * 15) + 5,
        metrics: prev.metrics + Math.floor(Math.random() * 25) + 10,
        traces: prev.traces + Math.floor(Math.random() * 8) + 3,
      }));

      setChartData((prev) => ({
        logs: [...prev.logs.slice(1), 8 + Math.floor(Math.random() * 12)],
        metrics: [
          ...prev.metrics.slice(1),
          12 + Math.floor(Math.random() * 18),
        ],
        traces: [...prev.traces.slice(1), 3 + Math.floor(Math.random() * 8)],
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const counters = [
    {
      key: 'logs',
      icon: 'document',
      label: 'Logs',
      count: counts.logs,
      rate: '+12/s',
      color: '#006DE4',
    },
    {
      key: 'metrics',
      icon: 'vis_area',
      label: 'Metrics',
      count: counts.metrics,
      rate: '+18/s',
      color: '#00BFB3',
    },
    {
      key: 'traces',
      icon: 'branch',
      label: 'Traces',
      count: counts.traces,
      rate: '+6/s',
      color: '#F5A700',
    },
  ];

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="pulse"
        title="Live Data Collection"
        subtitle="Watching your data flow in real-time"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__liveCounters">
        {counters.map((c) => (
          <div
            key={c.key}
            className="onboardWizard__counterRow onboardWizard__counterRow--withChart">
            <div className="onboardWizard__counterMeta">
              <div className="onboardWizard__counterIcon">
                <OuiIcon type={c.icon} size="l" color={c.color} />
              </div>
              <div className="onboardWizard__counterInfo">
                <OuiText size="xs" color="subdued">
                  {c.label}
                </OuiText>
                <div className="onboardWizard__counterValue">
                  <span className="onboardWizard__counterNumber">
                    {c.count.toLocaleString()}
                  </span>
                  <span
                    className="onboardWizard__counterRate"
                    style={{ color: c.color }}>
                    {c.rate}
                  </span>
                </div>
              </div>
            </div>
            <div className="onboardWizard__counterChart">
              <LiveStreamAreaChart color={c.color} data={chartData[c.key]} />
            </div>
          </div>
        ))}
      </div>
      <OuiSpacer size="l" />
      <div className="onboardWizard__collectionHealth">
        <OuiIcon type="checkInCircleFilled" size="s" color="success" />
        <OuiText size="xs">
          <strong>Healthy</strong> &middot; Uptime: 2m 34s &middot; Avg latency:
          12ms
        </OuiText>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED SUBCOMPONENTS
// ─────────────────────────────────────────────

const RightPanelHeader = ({ icon, title, subtitle }) => (
  <div className="onboardWizard__rightHeader">
    <OuiIcon type={icon} size="m" />
    <div>
      <OuiTitle size="xs">
        <h3>{title}</h3>
      </OuiTitle>
      <OuiText size="xs" color="subdued">
        {subtitle}
      </OuiText>
    </div>
  </div>
);

const IngestRow = ({ label, rate, color }) => {
  const dots = Array.from({ length: 12 }, (_, i) => (
    <span
      key={i}
      className="onboardWizard__sparkDot"
      style={{
        backgroundColor: color,
        opacity: 0.4 + Math.random() * 0.6,
      }}
    />
  ));

  return (
    <div className="onboardWizard__ingestRow">
      <span className="onboardWizard__ingestLabel">{label}</span>
      <span className="onboardWizard__ingestRate" style={{ color }}>
        {rate}
      </span>
      <div className="onboardWizard__sparkline">{dots}</div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SETUP CONTEXT PANEL — Q1/Q2/Q3 right panel (display only)
// ─────────────────────────────────────────────

const USE_CASE_LABELS = {
  'app-monitoring': 'Application monitoring',
  'ai-monitoring': 'AI agent monitoring',
  'unified': 'Unified observability',
  'security': 'Security & audit analysis',
};

const VOLUME_LABELS = {
  starter: '< 10 GB/day',
  growing: '10–100 GB/day',
  scale: '100 GB–1 TB/day',
  enterprise: '1+ TB/day',
  demo: 'Demo environment',
};

const VOLUME_INFRA = {
  starter: 'Lightweight managed cluster',
  growing: 'Serverless collection',
  scale: 'Serverless collection — Optimized engine (columnar)',
  enterprise: 'Dedicated high-throughput cluster',
  demo: 'Demo cluster with sample data',
};

const SetupContextPanel = ({ recommendationContext }) => {
  const { useCase, totalDailyVolume } = recommendationContext;
  const hasAny = useCase || totalDailyVolume;

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="inspect"
        title="Setup so far"
        subtitle="Shapes your recommendations"
      />
      <OuiSpacer size="l" />
      {!hasAny ? (
        <div className="onboardWizard__infoPlaceholder">
          <OuiText size="s" color="subdued" style={{ textAlign: 'center' }}>
            <p>Your answers will appear here as you go.</p>
          </OuiText>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {useCase && (
            <div style={{
              padding: '12px 14px',
              border: '1px solid',
              borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
              borderRadius: 10,
              background: 'var(--g-surface, #fff)',
            }}>
              <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
                <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
                  Use case
                </strong>
              </OuiText>
              <OuiText size="s">
                <strong>{USE_CASE_LABELS[useCase] || useCase}</strong>
              </OuiText>
            </div>
          )}
          {totalDailyVolume && (
            <div style={{
              padding: '12px 14px',
              border: '1px solid',
              borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
              borderRadius: 10,
              background: 'var(--g-surface, #fff)',
            }}>
              <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
                <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
                  Expected daily volume
                </strong>
              </OuiText>
              <OuiText size="s">
                <strong>{VOLUME_LABELS[totalDailyVolume] || totalDailyVolume}</strong>
              </OuiText>
              <OuiText size="xs" color="subdued" style={{ marginTop: 6 }}>
                <OuiIcon type="iInCircle" size="s" /> Recommended: {VOLUME_INFRA[totalDailyVolume] || '—'}
              </OuiText>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// RECOMMENDATION LOGIC — centralized mapper for use case + volume
// ─────────────────────────────────────────────

/**
 * Compute source recommendations based on use case and volume.
 * Returns an object mapping source keys to { badge, badgeNote, badgeColor }.
 * Fallback to defaults if recommendationContext is missing.
 */
const computeSourceRecommendations = (recommendationContext) => {
  const { useCase, totalDailyVolume } = recommendationContext || {};
  
  // Base defaults (fallback if no context)
  const defaults = {
    cloudwatch: { badge: 'Recommended', badgeColor: 'success' },
    'eks-logs': { badge: 'Recommended', badgeColor: 'success' },
    'vpc-flow': { badge: 'Review', badgeNote: 'high volume', badgeColor: 'warning' },
    's3-access': { badge: 'Optional', badgeColor: 'subdued' },
    prometheus: { badge: 'Recommended', badgeColor: 'success' },
    'otel-app': { badge: 'Recommended', badgeColor: 'success' },
  };

  // Start with defaults
  const recommendations = { ...defaults };

  // Adjust by USE CASE
  if (useCase === 'security') {
    // Security & audit analysis: promote VPC Flow Logs and S3 access logs
    recommendations['vpc-flow'] = { badge: 'Recommended', badgeNote: 'network forensics', badgeColor: 'success' };
    recommendations['s3-access'] = { badge: 'Recommended', badgeNote: 'audit trail', badgeColor: 'success' };
  }

  // Adjust by VOLUME
  if (totalDailyVolume === 'starter' || totalDailyVolume === 'demo') {
    // Lean scope for low-volume/demo — keep VPC Flow Logs as Review unless security use case
    if (useCase !== 'security') {
      recommendations['vpc-flow'] = { badge: 'Review', badgeNote: 'high volume', badgeColor: 'warning' };
    }
  } else if (totalDailyVolume === 'scale' || totalDailyVolume === 'enterprise') {
    // High volume: update VPC Flow note to reflect scale, but keep badge unless security promoted it
    if (useCase !== 'security') {
      recommendations['vpc-flow'] = { badge: 'Review', badgeNote: 'high volume at your scale', badgeColor: 'warning' };
    }
  }

  return recommendations;
};

/**
 * Get the list of recommended source keys based on recommendations.
 * Returns array of keys with 'Recommended' badge.
 */
const getRecommendedSourceKeys = (recommendations) => {
  return Object.keys(recommendations).filter(
    (key) => recommendations[key].badge === 'Recommended'
  );
};

/**
 * Olly's detection summary message. Opt-out model: all sources are included
 * by default; the user unchecks any they don't want via the interactive cards.
 */
const getDetectionSummaryMessage = () => {
  return "I've included all 6 sources with a sensible default scope. Expand a card to see a sample, adjust which log groups / clusters / VPCs / buckets are included, or just continue.";
};

/**
 * Get telemetry storage recommendation based on volume.
 */
const getStorageRecommendation = (recommendationContext) => {
  const { totalDailyVolume } = recommendationContext || {};
  
  const recommendations = {
    starter: 'OpenSearch Serverless Collection — minimal sizing',
    growing: 'OpenSearch Serverless Collection — Optimized engine',
    scale: 'OpenSearch Serverless Collection — Optimized engine (columnar storage for time-series efficiency)',
    enterprise: 'OpenSearch Serverless Collection — Optimized engine (sized for enterprise ingest)',
    demo: 'OpenSearch Serverless Collection — demo configuration',
  };

  return recommendations[totalDailyVolume] || 'OpenSearch Serverless Collection (Optimized engine)';
};

/**
 * Get signal emphasis text based on use case (for Instrument branch).
 * Returns a phrase describing which signals are emphasized.
 */
const getSignalEmphasis = (recommendationContext) => {
  const { useCase } = recommendationContext || {};
  
  const emphasis = {
    'app-monitoring': 'logs, metrics, and traces',
    'ai-monitoring': 'traces and metrics (agent monitoring)',
    'unified': 'logs, metrics, and traces',
    'security': 'logs and audit events',
  };

  return emphasis[useCase] || 'logs, metrics, and traces';
};

// ─────────────────────────────────────────────
// SHARED WRAP-UP HELPERS (branch-agnostic — used by W1/W2/W3 convergence)
// ─────────────────────────────────────────────

// Example existing collections offered in W1 "Select an existing collection".
const EXAMPLE_COLLECTIONS = [
  {
    key: 'prod-observability-cluster',
    name: 'prod-observability-cluster',
    meta: 'Serverless Collection · us-west-2 · Active',
  },
  {
    key: 'dev-telemetry-collection',
    name: 'dev-telemetry-collection',
    meta: 'Serverless Collection · us-east-1 · Active',
  },
];

/**
 * Human-readable label for the Q3 branch that was taken.
 */
const getBranchPathLabel = (selections) => {
  const labels = {
    'aws-services': 'From existing AWS services',
    'instrument-app': 'Instrument application',
    'migrate': 'Migrate from another tool',
  };
  return labels[selections?.[2]] || '—';
};

/**
 * Human-readable label for the destination choice made in W1.
 */
const getDestinationLabel = (destinationChoice) => {
  if (!destinationChoice) return 'Not selected';
  if (destinationChoice === 'new') return 'New collection';
  if (destinationChoice === 'custom') return 'Custom collection settings';
  if (destinationChoice.startsWith('collection:')) {
    return destinationChoice.slice('collection:'.length);
  }
  return destinationChoice;
};

/**
 * Branch-specific summary line(s) for the Step 1 final check (W3).
 * Reads whatever branch state exists and adapts. Reuses shared helpers.
 * Returns { label, value } for the branch specifics row.
 */
const getBranchSpecifics = ({ selections, recommendationContext, instrumentTarget, migrateSource, selectedScope, sourceScope }) => {
  const branch = selections?.[2];

  if (branch === 'aws-services') {
    // Use the user's actual selected scope (opt-out model); fall back to all detected.
    const keys = (selectedScope && selectedScope.length ? selectedScope : ALL_DETECTED_KEYS);
    // Per-source detail lines: instance count + est GB/day, or "all …".
    const lines = keys.map((k) => getSourceScopeLine(k, sourceScope));
    return {
      label: 'Selected sources',
      value: lines.length ? lines : 'None selected',
    };
  }

  if (branch === 'instrument-app') {
    const target = INSTRUMENT_TARGET_LABELS[instrumentTarget] || instrumentTarget || '—';
    return {
      label: 'Instrumentation',
      value: `${target} · OTel collector`,
    };
  }

  if (branch === 'migrate') {
    const src = MIGRATE_SOURCE_LABELS[migrateSource] || migrateSource || '—';
    return {
      label: 'Forwarding from',
      value: `${src} · live forwarding (historical data & query migration are out of scope for onboarding)`,
    };
  }

  return { label: 'Setup', value: '—' };
};

// ─────────────────────────────────────────────
// COLLECTOR SNIPPETS FOR INSTRUMENT BRANCH
// ─────────────────────────────────────────────

const COLLECTOR_SNIPPETS = {
  kubernetes: `# otel-collector as a DaemonSet
receivers: [otlp, kubeletstats, filelog]
exporters: [opensearch]`,
  docker: `# otel-collector sidecar / compose service
receivers: [otlp, docker_stats, filelog]
exporters: [opensearch]`,
  linux: `# otel-collector (systemd)
receivers: [otlp, hostmetrics, filelog]
exporters: [opensearch]`,
  windows: `# otel-collector (Windows service)
receivers: [otlp, windowsperfcounters, windowseventlog]
exporters: [opensearch]`,
  ec2: `# otel-collector on EC2
receivers: [otlp, hostmetrics, awsecscontainermetrics]
exporters: [opensearch]`,
};

const INSTRUMENT_TARGET_LABELS = {
  kubernetes: 'Kubernetes',
  docker: 'Docker',
  linux: 'Linux',
  windows: 'Windows',
  ec2: 'EC2 instance',
};

// ─────────────────────────────────────────────
// MIGRATE SNIPPETS AND DATA FOR MIGRATE BRANCH
// ─────────────────────────────────────────────

const MIGRATE_SNIPPETS = {
  splunk: `# Redirect Splunk forwarding to OpenSearch via OTel / Data Prepper
# outputs.conf → point HEC/forwarder at an OTel collector
receivers: [splunk_hec]
exporters: [opensearch]`,
  datadog: `# Datadog Agent dual-ship via OTLP
# enable OTLP ingest, add exporter
receivers: [otlp]
exporters: [opensearch]`,
  elastic: `# Elastic → OpenSearch is near-native (Beats / Logstash)
# logstash output → opensearch { }   (repoint existing pipeline)
input: [beats]
output: [opensearch]`,
  'vendor-neutral': `# Already running OpenTelemetry Collector — just add the exporter
exporters:
  opensearch: { endpoint: <your-collection-endpoint> }`,
};

const MIGRATE_SOURCE_LABELS = {
  splunk: 'Splunk',
  datadog: 'Datadog',
  elastic: 'Elastic',
  'vendor-neutral': 'Vendor-neutral collector',
};

// ─────────────────────────────────────────────
// SOURCE DETECTION PANEL (right, display-only)
// ─────────────────────────────────────────────

const DETECTED_SOURCES = [
  {
    key: 'cloudwatch',
    name: 'CloudWatch Logs',
    shape: 'Log group → stream → events, @message mostly JSON',
    fields: '@timestamp, level, service, trace_id, status_code',
    sampleLabel: 'Raw log',
    raw: '{"level":"ERROR","service":"checkout","message":"Payment failed","status_code":502,"trace_id":"abc123"}',
    parsed: 'service=checkout · level=ERROR · status_code=502 · trace_id=abc123',
    note: 'Contains an error event and the common service fields.',
  },
  {
    key: 'eks-logs',
    name: 'EKS container logs',
    shape: 'JSON app logs via Fluent Bit',
    fields: 'namespace, pod, container, node, cluster',
    sampleLabel: 'Raw log',
    raw: '{"namespace":"prod","pod":"checkout-api-6d8f9c","container":"app","node":"ip-10-0-1-15","log":"{\\"level\\":\\"INFO\\",\\"msg\\":\\"GET /checkout 200\\",\\"latency_ms\\":128}"}',
    parsed: 'namespace=prod · pod=checkout-api-6d8f9c · container=app · node=ip-10-0-1-15 · latency_ms=128',
    note: 'A Kubernetes app log with pod/namespace context and request latency.',
  },
  {
    key: 'vpc-flow',
    name: 'VPC Flow Logs',
    shape: 'Space-delimited network flow records',
    fields: 'srcaddr, dstaddr, protocol, bytes, action',
    sampleLabel: 'Raw record',
    raw: '2 123456789012 eni-0abc123 10.0.1.15 10.0.2.44 443 51510 6 12 8400 1719849500 1719849560 ACCEPT OK',
    parsed: 'srcaddr=10.0.1.15 · dstaddr=10.0.2.44 · srcport=443 · dstport=51510 · protocol=tcp · bytes=8400 · action=ACCEPT',
    note: 'An accepted flow showing the core network fields. High-volume — can dominate ingest.',
  },
  {
    key: 's3-access',
    name: 'S3 access logs',
    shape: 'Newline + space-delimited request records',
    fields: 'bucket, requester, operation, key, http_status',
    sampleLabel: 'Raw record',
    raw: '79a5 my-bucket [02/Jul/2026:16:20:01 +0000] 203.0.113.10 user/Alice REST.GET.OBJECT photos/cat.jpg "GET /my-bucket/photos/cat.jpg" 200 1024 10',
    parsed: 'bucket=my-bucket · requester=Alice · operation=REST.GET.OBJECT · key=photos/cat.jpg · http_status=200 · bytes=1024',
    note: 'One S3 request record — useful for access audit and object analysis.',
  },
  {
    key: 'prometheus',
    name: 'Prometheus metrics',
    shape: 'Time series (metric name + labels)',
    fields: 'service, namespace, pod, method, code',
    sampleLabel: 'Metric sample',
    raw: 'http_requests_total{method="post",code="500",service="checkout"} 3 1719849600',
    parsed: 'metric=http_requests_total · type=counter · value=3 · labels: method=post, code=500, service=checkout',
    note: 'A time-series metric sample (not a log) — an error-code series confirms labels parse.',
  },
  {
    key: 'otel-app',
    name: 'App logs (OTel)',
    shape: 'Structured OTel log records',
    fields: 'severity, body, service.name, host.name, http.*, trace_id',
    sampleLabel: 'Raw log',
    raw: '{"severity":"ERROR","body":"Payment failed","service.name":"checkout","http.method":"POST","http.status_code":502,"trace_id":"4bf92f3577b3","span_id":"00f067aa0ba9"}',
    parsed: 'severity=ERROR · service.name=checkout · http.method=POST · http.status_code=502 · trace_id=4bf92f3577b3 · span_id=00f067aa0ba9',
    note: 'A structured OTel log record with trace correlation (trace_id/span_id) built in.',
  },
];

// All detected source keys — used as the default scope (opt-out model).
const ALL_DETECTED_KEYS = DETECTED_SOURCES.map((s) => s.key);

// ─────────────────────────────────────────────
// RESOURCE-LEVEL SCOPING (AWS-services branch only)
// Only the four multi-instance sources get an "Adjust" instance list.
// Prometheus / OTel do NOT — they show a read-only "Included: all …" line.
// Defaults are opt-out: prod/high-value ON, non-prod/high-volume/already-audited OFF.
// ─────────────────────────────────────────────

const SOURCE_RESOURCES = {
  cloudwatch: {
    unit: 'log groups',
    scopeLabel: 'prod scope',
    instances: [
      { id: '/aws/eks/prod/application', label: '/aws/eks/prod/application', meta: '18 GB/day · 6 streams', gb: 18, defaultOn: true },
      { id: '/aws/lambda/payment-api', label: '/aws/lambda/payment-api', meta: '2 GB/day · 12 streams', gb: 2, defaultOn: true },
      { id: '/aws/apigateway/checkout', label: '/aws/apigateway/checkout', meta: '4 GB/day · 3 streams', gb: 4, defaultOn: true },
      { id: '/aws/lambda/dev-sandbox', label: '/aws/lambda/dev-sandbox', meta: '0.3 GB/day · 2 streams · low signal', gb: 0.3, defaultOn: false },
    ],
  },
  'eks-logs': {
    unit: 'clusters',
    scopeLabel: 'prod scope',
    instances: [
      { id: 'prod-app-cluster', label: 'prod-app-cluster', meta: 'us-west-2 · application · host · dataplane · 14 GB/day', gb: 14, defaultOn: true },
      { id: 'staging-services', label: 'staging-services', meta: 'us-west-2 · application · 6 GB/day', gb: 6, defaultOn: true },
      { id: 'dev-playground', label: 'dev-playground', meta: 'us-east-1 · application · 2 GB/day · non-prod', gb: 2, defaultOn: false },
    ],
  },
  'vpc-flow': {
    unit: 'VPCs',
    scopeLabel: 'prod scope',
    instances: [
      { id: 'vpc-prod', label: 'vpc-prod (10.0.0.0/16)', meta: '3 subnets · 14 ENIs · 38 GB/day', gb: 38, defaultOn: true },
      { id: 'vpc-staging', label: 'vpc-staging (10.1.0.0/16)', meta: '2 subnets · 6 ENIs · 11 GB/day · high volume', gb: 11, defaultOn: false },
      { id: 'vpc-mgmt', label: 'vpc-mgmt (10.9.0.0/16)', meta: '1 subnet · 2 ENIs · 4 GB/day', gb: 4, defaultOn: false },
    ],
  },
  's3-access': {
    unit: 'buckets',
    scopeLabel: 'prod scope',
    instances: [
      { id: 'checkout-assets-prod', label: 'checkout-assets-prod', meta: '1.2 GB/day', gb: 1.2, defaultOn: true },
      { id: 'user-uploads-prod', label: 'user-uploads-prod', meta: '0.8 GB/day', gb: 0.8, defaultOn: true },
      { id: 'terraform-state-bucket', label: 'terraform-state-bucket', meta: '0.05 GB/day · audit-only, low traffic', gb: 0.05, defaultOn: false },
      { id: 'cloudtrail-archive', label: 'cloudtrail-archive', meta: '2.1 GB/day · already audited elsewhere', gb: 2.1, defaultOn: false },
    ],
  },
};

// Read-only "Included: all …" lines for sources with no resource layer.
const SOURCE_INCLUDED_ALL = {
  prometheus: 'Included: all namespaces',
  'otel-app': 'Included: all services (via the collector)',
};

// Largest single source's full potential GB/day — used to scale per-source bars
// so volume is comparable across sources.
const MAX_SOURCE_POTENTIAL_GB = Math.max(
  ...Object.values(SOURCE_RESOURCES).map((r) =>
    r.instances.reduce((sum, i) => sum + i.gb, 0)
  )
);

// Format a GB/day number for display (trim trailing .0).
const formatGb = (gb) => {
  const rounded = Math.round(gb * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

// Default per-source instance selection (opt-out defaults above).
const getDefaultSourceScope = () => {
  const scope = {};
  Object.keys(SOURCE_RESOURCES).forEach((key) => {
    scope[key] = SOURCE_RESOURCES[key].instances
      .filter((i) => i.defaultOn)
      .map((i) => i.id);
  });
  return scope;
};

// Compute { selectedCount, totalCount, gb, unit, scopeLabel } for a source.
// Falls back to the default selection if sourceScope[sourceKey] is unset.
const getResourceSummary = (sourceKey, sourceScope) => {
  const res = SOURCE_RESOURCES[sourceKey];
  if (!res) return null;
  const ids =
    sourceScope && sourceScope[sourceKey]
      ? sourceScope[sourceKey]
      : res.instances.filter((i) => i.defaultOn).map((i) => i.id);
  const selected = res.instances.filter((i) => ids.includes(i.id));
  const gb = selected.reduce((sum, i) => sum + i.gb, 0);
  return {
    selectedCount: selected.length,
    totalCount: res.instances.length,
    gb,
    unit: res.unit,
    scopeLabel: res.scopeLabel,
  };
};

// One-line wrap-up summary per selected source (e.g.
// "CloudWatch Logs — 3 of 4 log groups, ~24 GB/day", or "all namespaces").
const getSourceScopeLine = (sourceKey, sourceScope) => {
  const name = (DETECTED_SOURCES.find((s) => s.key === sourceKey) || {}).name || sourceKey;
  if (SOURCE_INCLUDED_ALL[sourceKey]) {
    const allText = sourceKey === 'prometheus' ? 'all namespaces' : 'all services';
    return `${name} — ${allText}`;
  }
  const summary = getResourceSummary(sourceKey, sourceScope);
  if (!summary) return name;
  return `${name} — ${summary.selectedCount} of ${summary.totalCount} ${summary.unit}, ~${formatGb(summary.gb)} GB/day`;
};

// Total estimated GB/day across the selected sources (multi-instance sources only).
const getTotalEstGbPerDay = (selectedScope, sourceScope) => {
  const scope = selectedScope && selectedScope.length ? selectedScope : ALL_DETECTED_KEYS;
  let total = 0;
  scope.forEach((key) => {
    const summary = getResourceSummary(key, sourceScope);
    if (summary) total += summary.gb;
  });
  return total;
};

// Per-source colors for the segmented volume bar (data-viz hues).
const SOURCE_COLORS = {
  cloudwatch: '#6366f1',   // indigo (accent)
  'eks-logs': '#10b981',   // green
  'vpc-flow': '#d97706',   // amber
  's3-access': '#0ea5e9',  // sky
  prometheus: '#8b5cf6',   // violet
  'otel-app': '#ec4899',   // pink
};

// Build the segmented volume breakdown across selected sources.
// Only multi-instance sources contribute GB/day (Prometheus/OTel are unmetered "all").
const getVolumeBreakdown = (selectedScope, sourceScope) => {
  const scope = selectedScope && selectedScope.length ? selectedScope : ALL_DETECTED_KEYS;
  const segments = [];
  scope.forEach((key) => {
    const summary = getResourceSummary(key, sourceScope);
    const gb = summary ? summary.gb : 0;
    if (gb > 0) {
      segments.push({
        key,
        name: (DETECTED_SOURCES.find((s) => s.key === key) || {}).name || key,
        gb,
        color: SOURCE_COLORS[key] || '#6366f1',
      });
    }
  });
  const total = segments.reduce((sum, seg) => sum + seg.gb, 0);
  segments.forEach((seg) => { seg.pct = total ? (seg.gb / total) * 100 : 0; });
  const largest = segments.slice().sort((a, b) => b.gb - a.gb)[0] || null;
  return { segments, total, largest };
};

const BADGE_STYLE = {
  success: { background: 'rgba(16,185,129,0.1)', color: '#059669' },
  warning: { background: 'rgba(217,119,6,0.1)', color: '#b45309' },
  subdued: { background: 'rgba(10,10,10,0.06)', color: '#6b7280' },
};

// A single thin volume bar (per-source or per-instance). `frac` is 0..1 of the
// bar's own max; dimmed when not selected.
const VolumeBar = ({ frac, color, dimmed, height = 6 }) => (
  <div style={{
    width: '100%',
    height,
    borderRadius: 999,
    background: 'var(--g-bg, rgba(10,10,10,0.06))',
    overflow: 'hidden',
  }}>
    <div style={{
      width: `${Math.max(0, Math.min(1, frac)) * 100}%`,
      height: '100%',
      borderRadius: 999,
      background: color,
      opacity: dimmed ? 0.3 : 1,
      transition: 'width 200ms ease, opacity 160ms ease',
    }} />
  </div>
);

// Segmented total-volume bar across all selected sources (header).
const SegmentedVolumeBar = ({ segments }) => (
  <div style={{
    display: 'flex',
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    background: 'var(--g-bg, rgba(10,10,10,0.06))',
    gap: 2,
  }}>
    {segments.map((seg) => (
      <div
        key={seg.key}
        title={`${seg.name} · ~${formatGb(seg.gb)} GB/day`}
        style={{
          width: `${seg.pct}%`,
          height: '100%',
          background: seg.color,
          transition: 'width 220ms ease',
        }}
      />
    ))}
  </div>
);

// INTERACTIVE scope-selection panel — this is the ONE deliberate exception to the
// "right panel = display only" rule. Cards can be checked/unchecked and expanded.
// selectedScope + onToggleSource are owned by the parent; expand state is local.
const SourceDetectionPanel = ({ recommendationContext, selectedScope, onToggleSource, sourceScope, onToggleResource }) => {
  const recommendations = computeSourceRecommendations(recommendationContext);
  const scope = selectedScope || ALL_DETECTED_KEYS;
  const [expanded, setExpanded] = useState({});
  // Local: which sources have their RAW/PARSED sample ("View sample") open.
  const [viewingSample, setViewingSample] = useState({});
  const toggleSample = (key) =>
    setViewingSample((prev) => ({ ...prev, [key]: !prev[key] }));

  const allExpanded = DETECTED_SOURCES.every((s) => expanded[s.key]);
  const toggleExpand = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Live volume breakdown for the header segmented bar + caption.
  const volume = getVolumeBreakdown(selectedScope, sourceScope);
  const largestPct = volume.largest && volume.total
    ? Math.round((volume.largest.gb / volume.total) * 100)
    : 0;
  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpanded({});
    } else {
      const next = {};
      DETECTED_SOURCES.forEach((s) => { next[s.key] = true; });
      setExpanded(next);
    }
  };

  return (
    <div className="onboardWizard__rightContent onboardWizard__scopePanel">
      <RightPanelHeader
        icon="logstashInput"
        title="Detected Data Sources"
        subtitle="All sources included — uncheck any you don't want."
      />
      <OuiSpacer size="m" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <OuiText size="xs" color="subdued">
          <strong>{scope.length} of {DETECTED_SOURCES.length} sources · ~{formatGb(volume.total)} GB/day total</strong>
        </OuiText>
        <button
          type="button"
          className="onboardWizard__scopeLink"
          onClick={toggleExpandAll}
          style={{ fontSize: 12 }}>
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
      {/* Segmented total-volume bar + largest-source caption */}
      {volume.segments.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SegmentedVolumeBar segments={volume.segments} />
          {volume.largest && (
            <OuiText size="xs" color="subdued" style={{ marginTop: 6 }}>
              <span>
                <span style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: volume.largest.color,
                  marginRight: 6,
                }} />
                {volume.largest.name} — {largestPct}% of ingest
              </span>
            </OuiText>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DETECTED_SOURCES.map((src) => {
          const rec = recommendations[src.key];
          const isSelected = scope.includes(src.key);
          const isOpen = !!expanded[src.key];
          return (
            <div
              key={src.key}
              style={{
                padding: '12px 14px',
                border: '1px solid',
                borderColor: isSelected
                  ? 'var(--g-surface-border, rgba(10,10,10,0.1))'
                  : 'var(--g-surface-border, rgba(10,10,10,0.08))',
                borderRadius: 10,
                background: 'var(--g-surface, #fff)',
                opacity: isSelected ? 1 : 0.55,
                transition: 'opacity 160ms ease',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <OuiCheckbox
                  id={`scope-${src.key}`}
                  checked={isSelected}
                  onChange={() => onToggleSource(src.key)}
                  aria-label={`Include ${src.name}`}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <OuiText size="s"><strong>{src.name}</strong></OuiText>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                        whiteSpace: 'nowrap',
                        ...BADGE_STYLE[rec.badgeColor],
                      }}>
                        {rec.badge}{rec.badgeNote ? ` · ${rec.badgeNote}` : ''}
                      </span>
                      <button
                        type="button"
                        className="onboardWizard__chevronBtn"
                        onClick={() => toggleExpand(src.key)}
                        aria-label={isOpen ? `Collapse ${src.name}` : `Expand ${src.name}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                        <OuiIcon type={isOpen ? 'arrowUp' : 'arrowDown'} size="s" color="primary" />
                      </button>
                    </div>
                  </div>
                  <OuiText size="xs" color="subdued" style={{ marginTop: 2 }}>
                    <span>{src.shape}</span>
                  </OuiText>
                  {/* Collapsed-card scope summary — blue clickable (multi-instance) */}
                  {!isOpen && SOURCE_RESOURCES[src.key] && (() => {
                    const summary = getResourceSummary(src.key, sourceScope);
                    return (
                      <button
                        type="button"
                        className="onboardWizard__scopeLink"
                        onClick={() => toggleExpand(src.key)}
                        style={{ marginTop: 6, fontSize: 12, textAlign: 'left' }}>
                        {summary.scopeLabel} · {summary.selectedCount} of {summary.totalCount} {summary.unit} · ~{formatGb(summary.gb)} GB/day
                      </button>
                    );
                  })()}
                  {!isOpen && SOURCE_INCLUDED_ALL[src.key] && (
                    <OuiText size="xs" color="subdued" style={{ marginTop: 6 }}>
                      <span>{SOURCE_INCLUDED_ALL[src.key]}</span>
                    </OuiText>
                  )}

                  {isOpen && (
                    <div style={{ marginTop: 12 }}>
                      {/* PRIMARY: resource scope (multi-instance sources) */}
                      {SOURCE_RESOURCES[src.key] && (() => {
                        const res = SOURCE_RESOURCES[src.key];
                        const summary = getResourceSummary(src.key, sourceScope);
                        const selectedIds =
                          (sourceScope && sourceScope[src.key]) ||
                          res.instances.filter((i) => i.defaultOn).map((i) => i.id);
                        const maxInstGb = Math.max(...res.instances.map((i) => i.gb));
                        const heading = `Scope · which ${res.unit}`;
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                              <span className="onboardWizard__scopeHeading">{heading}</span>
                              <OuiText size="xs" color="subdued">
                                <span>{summary.selectedCount} of {summary.totalCount} · ~{formatGb(summary.gb)} GB/day</span>
                              </OuiText>
                            </div>
                            {/* Per-source volume bar */}
                            <div style={{ margin: '8px 0 12px' }}>
                              <VolumeBar
                                frac={summary.gb / MAX_SOURCE_POTENTIAL_GB}
                                color={SOURCE_COLORS[src.key]}
                                dimmed={!isSelected}
                              />
                            </div>
                            {/* Instance checklist (blue checkboxes, opt-out defaults) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {res.instances.map((inst) => {
                                const on = selectedIds.includes(inst.id);
                                return (
                                  <div key={inst.id} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 8,
                                    padding: '8px 10px',
                                    border: '1px solid',
                                    borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
                                    borderRadius: 8,
                                    background: 'var(--g-surface, #fff)',
                                    opacity: on ? 1 : 0.5,
                                    transition: 'opacity 160ms ease',
                                  }}>
                                    <OuiCheckbox
                                      id={`res-${src.key}-${inst.id}`}
                                      checked={on}
                                      onChange={() => onToggleResource(src.key, inst.id)}
                                      aria-label={`Include ${inst.label}`}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                        <OuiText size="xs" style={{ fontFamily: 'var(--g-font-mono, monospace)' }}>
                                          <span>{inst.label}</span>
                                        </OuiText>
                                        <OuiText size="xs" color="subdued" style={{ whiteSpace: 'nowrap', fontFamily: 'var(--g-font-mono, monospace)' }}>
                                          <span>{formatGb(inst.gb)} GB/day</span>
                                        </OuiText>
                                      </div>
                                      <div style={{ margin: '5px 0 3px' }}>
                                        <VolumeBar
                                          frac={inst.gb / maxInstGb}
                                          color={SOURCE_COLORS[src.key]}
                                          dimmed={!on}
                                          height={4}
                                        />
                                      </div>
                                      <OuiText size="xs" color="subdued">
                                        <span>{inst.meta}</span>
                                      </OuiText>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* No resource layer — read-only "Included: all …" line */}
                      {SOURCE_INCLUDED_ALL[src.key] && (
                        <div>
                          <span className="onboardWizard__scopeHeading">Scope</span>
                          <OuiText size="xs" color="subdued" style={{ marginTop: 6 }}>
                            <span>{SOURCE_INCLUDED_ALL[src.key]}</span>
                          </OuiText>
                        </div>
                      )}

                      {/* SECONDARY: sample behind a blue "View sample" toggle */}
                      <div style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: '1px dashed var(--g-surface-border, rgba(10,10,10,0.12))',
                      }}>
                        <button
                          type="button"
                          className="onboardWizard__scopeLink"
                          onClick={() => toggleSample(src.key)}
                          style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <OuiIcon type={viewingSample[src.key] ? 'arrowUp' : 'arrowDown'} size="s" />
                          {viewingSample[src.key] ? 'Hide sample' : 'View sample'}
                        </button>
                        {viewingSample[src.key] && (
                          <div style={{ marginTop: 10 }}>
                            <OuiText size="xs" color="subdued" style={{ marginBottom: 4, fontFamily: 'var(--g-font-mono, monospace)' }}>
                              <span>{src.fields}</span>
                            </OuiText>
                            <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
                              <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
                                {src.sampleLabel}
                              </strong>
                            </OuiText>
                            <pre className="onboardWizard__logPreview" style={{ marginBottom: 10 }}>
                              {src.raw}
                            </pre>
                            <div style={{
                              padding: '8px 12px',
                              border: '1px solid',
                              borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
                              borderRadius: 8,
                              background: 'var(--g-bg, rgba(10,10,10,0.02))',
                              fontFamily: 'var(--g-font-mono, monospace)',
                              fontSize: 12,
                              lineHeight: 1.6,
                              marginBottom: 8,
                            }}>
                              {src.parsed}
                            </div>
                            <OuiText size="xs" color="subdued">
                              <em>{src.note}</em>
                            </OuiText>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// DATA PREVIEW PANEL (right, display-only)
// ─────────────────────────────────────────────

const PREVIEW_DATA = {
  cloudwatch: {
    name: 'CloudWatch Logs',
    sectionLabel: 'Raw log',
    raw: '{"level":"ERROR","service":"checkout","message":"Payment failed","status_code":502,"trace_id":"abc123"}',
    parsed: 'service=checkout · level=ERROR · status_code=502 · trace_id=abc123',
    why: 'Contains an error event and the common service fields.',
  },
  'eks-logs': {
    name: 'EKS container logs',
    sectionLabel: 'Raw log',
    raw: '{"level":"INFO","namespace":"payments","pod":"checkout-7d9f8b-xkp2q","container":"app","message":"Request processed","trace_id":"def456","status_code":200}',
    parsed: 'namespace=payments · pod=checkout-7d9f8b-xkp2q · level=INFO · status_code=200 · trace_id=def456',
    why: 'A normal request log showing the Kubernetes pod fields alongside service fields.',
  },
  'vpc-flow': {
    name: 'VPC Flow Logs',
    sectionLabel: 'Raw record',
    raw: '2 123456789012 eni-0abc123 10.0.1.15 10.0.2.44 443 51510 6 12 8400 1719849500 1719849560 ACCEPT OK',
    parsed: 'srcaddr=10.0.1.15 · dstaddr=10.0.2.44 · protocol=tcp · bytes=8400 · action=ACCEPT',
    why: 'An accepted flow showing the core network fields.',
  },
  's3-access': {
    name: 'S3 access logs',
    sectionLabel: 'Raw record',
    raw: 'a1b2c3 my-bucket [01/Jul/2026:12:00:00 +0000] 203.0.113.5 arn:aws:iam::123:user/app REST.GET.OBJECT logs/app.log "GET /logs/app.log HTTP/1.1" 200 - 4096 4096 12 11 "-" "aws-sdk-java/2.0"',
    parsed: 'bucket=my-bucket · requester=arn:aws:iam::123:user/app · operation=REST.GET.OBJECT · key=logs/app.log · http_status=200',
    why: 'A successful GET showing bucket, requester, and operation fields.',
  },
  prometheus: {
    name: 'Prometheus metrics',
    sectionLabel: 'Metric sample',
    raw: 'http_requests_total{method="post",code="500",service="checkout"} 3 1719849600',
    parsed: 'metric=http_requests_total · type=counter · value=3 · labels: method=post, code=500, service=checkout',
    why: 'An error-code series — confirms labels parse correctly.',
  },
  'otel-app': {
    name: 'App logs (OTel)',
    sectionLabel: 'Raw log',
    raw: '{"severity":"ERROR","body":"Payment gateway timeout","service.name":"checkout","host.name":"ip-10-0-1-42","http.method":"POST","http.status_code":504,"trace_id":"ghi789"}',
    parsed: 'severity=ERROR · service.name=checkout · http.status_code=504 · trace_id=ghi789 · host.name=ip-10-0-1-42',
    why: 'An OTel-structured error with service, host, and HTTP semantic attributes.',
  },
};

const DataPreviewPanel = ({ source }) => {
  const data = PREVIEW_DATA[source];
  if (!data) return null;
  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="inspect"
        title={data.name}
        subtitle="Sample data — read only"
      />
      <OuiSpacer size="l" />
      {/* Raw section */}
      <OuiText size="xs" color="subdued" style={{ marginBottom: 6 }}>
        <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
          {data.sectionLabel}
        </strong>
      </OuiText>
      <pre className="onboardWizard__logPreview" style={{ marginBottom: 14 }}>
        {data.raw}
      </pre>
      {/* Parsed section */}
      <OuiText size="xs" color="subdued" style={{ marginBottom: 6 }}>
        <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
          Parsed fields
        </strong>
      </OuiText>
      <div style={{
        padding: '10px 14px',
        border: '1px solid',
        borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
        borderRadius: 10,
        background: 'var(--g-surface, #fff)',
        fontFamily: 'var(--g-font-mono, monospace)',
        fontSize: 12,
        lineHeight: 1.6,
        marginBottom: 14,
      }}>
        {data.parsed}
      </div>
      {/* Why shown */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 8,
        background: 'rgba(99,102,241,0.05)',
        border: '1px solid rgba(99,102,241,0.15)',
      }}>
        <OuiIcon type="iInCircle" size="s" color="primary" style={{ marginTop: 1, flexShrink: 0 }} />
        <OuiText size="xs" color="subdued">
          <em>{data.why}</em>
        </OuiText>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// INSTRUMENT BRANCH PANELS (right, display-only)
// ─────────────────────────────────────────────

const InstrumentCollectorConfigPanel = ({ instrumentTarget }) => {
  const targetLabel = INSTRUMENT_TARGET_LABELS[instrumentTarget] || instrumentTarget;
  const snippet = COLLECTOR_SNIPPETS[instrumentTarget] || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="logo_docker"
        title={`OTel Collector · ${targetLabel}`}
        subtitle="Paste into your project — read only"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__codeBlock">
        <button
          type="button"
          className="onboardWizard__copyBtn"
          onClick={handleCopy}
          aria-label="Copy configuration to clipboard">
          <OuiIcon type={copied ? 'check' : 'copy'} size="s" />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <OuiCode language="yaml" className="onboardWizard__code">
          {snippet}
        </OuiCode>
      </div>
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p>
          This configuration is tuned for your use case. Paste it into your
          OTel collector configuration file and restart the collector.
        </p>
      </OuiText>
    </div>
  );
};

const InstrumentRecommendedConfigPanel = ({ recommendationContext }) => {
  const signals = getSignalEmphasis(recommendationContext);
  const storage = getStorageRecommendation(recommendationContext);

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="checkInCircleFilled"
        title="Recommended Configuration"
        subtitle="Based on your setup"
      />
      <OuiSpacer size="l" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Signals */}
        <div style={{
          padding: '12px 14px',
          border: '1px solid',
          borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
          borderRadius: 10,
          background: 'var(--g-surface, #fff)',
        }}>
          <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
            <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
              Signals
            </strong>
          </OuiText>
          <OuiText size="s">
            <strong>{signals}</strong>
          </OuiText>
        </div>
        {/* Telemetry storage */}
        <div style={{
          padding: '12px 14px',
          border: '1px solid',
          borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
          borderRadius: 10,
          background: 'var(--g-surface, #fff)',
        }}>
          <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
            <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
              Telemetry storage
            </strong>
          </OuiText>
          <OuiText size="s">
            <strong>{storage}</strong>
          </OuiText>
        </div>
      </div>
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p style={{ margin: 0 }}>
          You can adjust these settings later from the Data Management page.
        </p>
      </OuiText>
    </div>
  );
};

// ─────────────────────────────────────────────
// MIGRATE BRANCH PANELS (right, display-only)
// ─────────────────────────────────────────────

const MigrateForwardingConfigPanel = ({ migrateSource }) => {
  const sourceLabel = MIGRATE_SOURCE_LABELS[migrateSource] || migrateSource;
  const snippet = MIGRATE_SNIPPETS[migrateSource] || '';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Note specific to Elastic about ease of cutover
  const elasticNote = migrateSource === 'elastic'
    ? 'OpenSearch forked from Elasticsearch — your existing Beats and Logstash configs work with minimal changes.'
    : 'This redirects your LIVE telemetry pipeline. It does not move historical data or translate saved searches/dashboards.';

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="exportAction"
        title={`Forward to OpenSearch · ${sourceLabel}`}
        subtitle="Reconfigure your existing forwarder — read only"
      />
      <OuiSpacer size="l" />
      <div className="onboardWizard__codeBlock">
        <button
          type="button"
          className="onboardWizard__copyBtn"
          onClick={handleCopy}
          aria-label="Copy configuration to clipboard">
          <OuiIcon type={copied ? 'check' : 'copy'} size="s" />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <OuiCode language="yaml" className="onboardWizard__code">
          {snippet}
        </OuiCode>
      </div>
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p>
          {elasticNote}
        </p>
      </OuiText>
    </div>
  );
};

const MigrateRecommendedConfigPanel = ({ recommendationContext }) => {
  const signals = getSignalEmphasis(recommendationContext);
  const storage = getStorageRecommendation(recommendationContext);

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="checkInCircleFilled"
        title="Recommended Configuration"
        subtitle="Based on your setup"
      />
      <OuiSpacer size="l" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Signals */}
        <div style={{
          padding: '12px 14px',
          border: '1px solid',
          borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
          borderRadius: 10,
          background: 'var(--g-surface, #fff)',
        }}>
          <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
            <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
              Signals
            </strong>
          </OuiText>
          <OuiText size="s">
            <strong>{signals}</strong>
          </OuiText>
        </div>
        {/* Telemetry storage */}
        <div style={{
          padding: '12px 14px',
          border: '1px solid',
          borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
          borderRadius: 10,
          background: 'var(--g-surface, #fff)',
        }}>
          <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
            <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
              Telemetry storage
            </strong>
          </OuiText>
          <OuiText size="s">
            <strong>{storage}</strong>
          </OuiText>
        </div>
      </div>
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p style={{ margin: 0 }}>
          You can adjust these settings later from the Data Management page.
        </p>
      </OuiText>
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED WRAP-UP PANELS (right, display-only)
// ─────────────────────────────────────────────

// Small reusable read-only summary card used across wrap-up panels.
const WrapupCard = ({ label, value }) => (
  <div style={{
    padding: '12px 14px',
    border: '1px solid',
    borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
    borderRadius: 10,
    background: 'var(--g-surface, #fff)',
  }}>
    <OuiText size="xs" color="subdued" style={{ marginBottom: 4 }}>
      <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
        {label}
      </strong>
    </OuiText>
    {Array.isArray(value) ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {value.map((line, i) => (
          <OuiText key={i} size="s"><strong>{line}</strong></OuiText>
        ))}
      </div>
    ) : (
      <OuiText size="s">
        <strong>{value}</strong>
      </OuiText>
    )}
  </div>
);

// W1 — Destination (read-only). Reflects destinationChoice / destinationPhase.
const DestinationPanel = ({ destinationChoice, destinationPhase }) => {
  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="database"
        title="Destination"
        subtitle="Where your data lands"
      />
      <OuiSpacer size="l" />
      {destinationPhase === 'picking-existing' ? (
        <>
          <OuiText size="xs" color="subdued" style={{ marginBottom: 6 }}>
            <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>
              Existing collections
            </strong>
          </OuiText>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EXAMPLE_COLLECTIONS.map((c) => (
              <div key={c.key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                border: '1px solid',
                borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
                borderRadius: 10,
                background: 'var(--g-surface, #fff)',
              }}>
                <OuiIcon type="logo_opensearch" size="m" />
                <div>
                  <OuiText size="s"><strong>{c.name}</strong></OuiText>
                  <OuiText size="xs" color="subdued"><span>{c.meta}</span></OuiText>
                </div>
              </div>
            ))}
          </div>
          <OuiSpacer size="m" />
          <OuiText size="xs" color="subdued">
            <p style={{ margin: 0 }}>Pick one on the left to route your data here.</p>
          </OuiText>
        </>
      ) : (
        <WrapupCard label="Destination" value={getDestinationLabel(destinationChoice)} />
      )}
    </div>
  );
};

// W2 — Data handling (read-only). Reflects toggle state.
const DataHandlingPanel = ({ dataHandling }) => {
  const rows = [
    { label: 'Remove PID (mask PII)', on: dataHandling.removePID },
    { label: 'Add to service catalog', on: dataHandling.serviceCatalog },
  ];
  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="inspect"
        title="Data Handling"
        subtitle="Optional safeguards"
      />
      <OuiSpacer size="l" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            border: '1px solid',
            borderColor: 'var(--g-surface-border, rgba(10,10,10,0.1))',
            borderRadius: 10,
            background: 'var(--g-surface, #fff)',
          }}>
            <OuiText size="s"><span>{r.label}</span></OuiText>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              ...(r.on
                ? { background: 'rgba(16,185,129,0.1)', color: '#059669' }
                : { background: 'rgba(10,10,10,0.06)', color: '#6b7280' }),
            }}>
              {r.on ? 'On' : 'Off'}
            </span>
          </div>
        ))}
      </div>
      <OuiSpacer size="m" />
      <OuiText size="xs" color="subdued">
        <p style={{ margin: 0 }}>Both are optional. Toggle on the left, then continue.</p>
      </OuiText>
    </div>
  );
};

// W3 — Step 1 summary (read-only). Adapts to whichever branch was taken.
const Step1SummaryPanel = ({
  recommendationContext,
  selections,
  instrumentTarget,
  migrateSource,
  destinationChoice,
  dataHandling,
  selectedScope,
  sourceScope,
}) => {
  const branchSpecifics = getBranchSpecifics({
    selections,
    recommendationContext,
    instrumentTarget,
    migrateSource,
    selectedScope,
    sourceScope,
  });
  const safeguards = [
    dataHandling.removePID ? 'Remove PID' : null,
    dataHandling.serviceCatalog ? 'Service catalog' : null,
  ].filter(Boolean);

  const rows = [
    { label: 'Path', value: getBranchPathLabel(selections) },
    { label: 'Use case', value: USE_CASE_LABELS[recommendationContext?.useCase] || '—' },
    { label: 'Expected daily volume', value: VOLUME_LABELS[recommendationContext?.totalDailyVolume] || '—' },
    { label: branchSpecifics.label, value: branchSpecifics.value },
    { label: 'Signals', value: getSignalEmphasis(recommendationContext) },
    { label: 'Telemetry storage', value: getStorageRecommendation(recommendationContext) },
    { label: 'Destination', value: getDestinationLabel(destinationChoice) },
    { label: 'Data handling', value: safeguards.length ? safeguards.join(', ') : 'None' },
  ];

  return (
    <div className="onboardWizard__rightContent">
      <RightPanelHeader
        icon="checkInCircleFilled"
        title="Step 1 Summary"
        subtitle="Everything you configured"
      />
      <OuiSpacer size="l" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((row) => (
          <WrapupCard key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// RIGHT PANEL CONTENT ROUTER
// ─────────────────────────────────────────────

const RightPanelContent = ({
  step,
  selectedOption,
  confirmed,
  allSelections,
  previewSource,
  recommendationContext,
  instrumentTarget,
  migrateSource,
  destinationChoice,
  destinationPhase,
  dataHandling,
  selectedScope,
  onToggleSource,
  sourceScope,
  onToggleResource,
}) => {
  const { rightPanel } = step;

  switch (rightPanel.contentType) {
    case 'setup-context':
      return <SetupContextPanel recommendationContext={recommendationContext} />;
    case 'getting-started':
      return <GettingStartedPanel />;
    case 'environment':
      return <EnvironmentPanel selectedOption={selectedOption} />;
    case 'source-detection':
      // Interactive scope selection (this step only — deliberate exception).
      return (
        <SourceDetectionPanel
          recommendationContext={recommendationContext}
          selectedScope={selectedScope}
          onToggleSource={onToggleSource}
          sourceScope={sourceScope}
          onToggleResource={onToggleResource}
        />
      );
    case 'eks-discovery':
      return (
        <EKSDiscoveryPanel
          discoveryPhase={
            confirmed ? 'found' : selectedOption ? 'scanning' : 'scanning'
          }
        />
      );
    case 'collector-setup':
      return <CollectorSetupPanel confirmed={confirmed} />;
    case 'telemetry-storage':
      return <TelemetryStoragePanel selectedOption={selectedOption} />;
    case 'summary':
      return <SummaryPanel allSelections={allSelections} recommendationContext={recommendationContext} selectedScope={selectedScope} sourceScope={sourceScope} />;
    case 'live-counters':
      return <LiveCountersPanel />;
    case 'instrument-collector-config':
      return <InstrumentCollectorConfigPanel instrumentTarget={instrumentTarget} />;
    case 'instrument-recommended-config':
      return <InstrumentRecommendedConfigPanel recommendationContext={recommendationContext} />;
    case 'migrate-forwarding-config':
      return <MigrateForwardingConfigPanel migrateSource={migrateSource} />;
    case 'migrate-recommended-config':
      return <MigrateRecommendedConfigPanel recommendationContext={recommendationContext} />;
    case 'wrapup-destination':
      return <DestinationPanel destinationChoice={destinationChoice} destinationPhase={destinationPhase} />;
    case 'wrapup-datahandling':
      return <DataHandlingPanel dataHandling={dataHandling} />;
    case 'wrapup-summary':
      return (
        <Step1SummaryPanel
          recommendationContext={recommendationContext}
          selections={allSelections}
          instrumentTarget={instrumentTarget}
          migrateSource={migrateSource}
          destinationChoice={destinationChoice}
          dataHandling={dataHandling}
          selectedScope={selectedScope}
          sourceScope={sourceScope}
        />
      );
    default:
      return (
        <div className="onboardWizard__rightContent">
          <RightPanelHeader
            icon="iInCircle"
            title={rightPanel.title}
            subtitle={rightPanel.subtitle}
          />
          <OuiSpacer size="l" />
          <div className="onboardWizard__infoPlaceholder">
            <OuiText size="s" color="subdued" style={{ textAlign: 'center' }}>
              <p>Select an option to see more details here.</p>
            </OuiText>
          </div>
        </div>
      );
  }
};

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────

export const OnboardingWizardPage = () => {
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext.theme === 'v9-dark';
  const mascotColor = isDark ? ['#FFFFFF', '#D9DEE5'] : ['#14558E', '#153A5A'];
  const mascotEyeColor = isDark ? '#181028' : '#fff';

  const [showIntro, setShowIntro] = useState(true);
  const [introExiting, setIntroExiting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [confirmedSteps, setConfirmedSteps] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [rightPanelFade, setRightPanelFade] = useState(true);
  // Data-preview state — tracks which source is currently previewed on the right
  const [previewSource, setPreviewSource] = useState(null);
  // Preview sub-flow phase: null | 'asking' | 'previewing'
  const [previewPhase, setPreviewPhase] = useState(null);
  // Recommendation context — populated by Q1 (useCase) and Q2 (totalDailyVolume)
  const [recommendationContext, setRecommendationContext] = useState({
    useCase: null,
    totalDailyVolume: null,
  });
  // Instrument target — populated by Instrument branch State A
  const [instrumentTarget, setInstrumentTarget] = useState(null);
  // Migrate source — populated by Migrate branch State A
  const [migrateSource, setMigrateSource] = useState(null);
  // AWS detection scope — default = ALL detected sources (opt-out model).
  // Badges are advisory only; this drives the actual downstream scope.
  const [selectedScope, setSelectedScope] = useState(ALL_DETECTED_KEYS);
  // Optional resource-level scope per source: { sourceKey: [instanceId, ...] }.
  // Defaults follow the opt-out model (prod/high-value ON).
  const [sourceScope, setSourceScope] = useState(getDefaultSourceScope);
  // ── Shared wrap-up state (W1/W2/W3 convergence) ──
  // Destination choice: null | 'new' | 'custom' | 'collection:<key>'
  const [destinationChoice, setDestinationChoice] = useState(null);
  // Destination sub-phase: null | 'picking-existing' | 'custom-note'
  const [destinationPhase, setDestinationPhase] = useState(null);
  // Data-handling safeguards toggled in W2
  const [dataHandling, setDataHandling] = useState({
    removePID: false,
    serviceCatalog: false,
  });
  const feedRef = useRef(null);
  const feedEndRef = useRef(null);
  const streamTimers = useRef([]);

  const handleStartOnboarding = () => {
    setIntroExiting(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  const totalSteps = STEPS.length;
  const totalMainSteps = STEPS[STEPS.length - 1].mainStep;
  const step = STEPS[currentStep];
  const currentSelection =
    selections[currentStep] ?? step.defaultSelection ?? null;
  const isConfirmed = !!confirmedSteps[currentStep];

  // Stream the current step's question text when step changes — character by character
  useEffect(() => {
    // Clear previous timers
    streamTimers.current.forEach(clearTimeout);
    streamTimers.current = [];

    // Use dynamicQuestion if available, passing selections for context
    const fullText = step.dynamicQuestion
      ? step.dynamicQuestion(selections)
      : step.question;
    setStreamedText('');
    setIsStreaming(true);

    const CHAR_SPEED = 22; // ms per character
    const MASCOT_PULSE_DURATION = 3000; // mascot pops in and pulses for 3s before typing starts
    let charIdx = 0;

    const typeNext = () => {
      if (charIdx < fullText.length) {
        charIdx++;
        setStreamedText(fullText.slice(0, charIdx));
        const timer = setTimeout(typeNext, CHAR_SPEED);
        streamTimers.current.push(timer);
      } else {
        setIsStreaming(false);
      }
    };

    const startTimer = setTimeout(typeNext, MASCOT_PULSE_DURATION);
    streamTimers.current.push(startTimer);

    return () => {
      streamTimers.current.forEach(clearTimeout);
      streamTimers.current = [];
    };
  }, [currentStep, step.question]);

  // Auto-discovery step: auto-confirm after scanning animation
  useEffect(() => {
    if (step.optionType === 'auto-discovery' && !isConfirmed && !isProcessing) {
      // Wait for the streaming text to finish, then auto-confirm
      const streamDuration = step.question.split(/(\s+)/).length * 30 + 500;
      const timer = setTimeout(() => {
        setIsProcessing(true);
        // Show scanning for 2 seconds, then confirm (discovery found)
        setTimeout(() => {
          setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
          setIsProcessing(false);
          // Update the streamed text to the discovery result (use dynamic message)
          setStreamedText(getDetectionSummaryMessage(recommendationContext));
        }, 2000);
      }, streamDuration);
      return () => clearTimeout(timer);
    }
  }, [currentStep, step.optionType, isConfirmed, isProcessing, recommendationContext]);

  // Fade in the right panel when step changes
  useEffect(() => {
    setRightPanelFade(false);
    const timer = setTimeout(() => setRightPanelFade(true), 80);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Fade in the right panel when preview source changes
  useEffect(() => {
    if (previewSource) {
      setRightPanelFade(false);
      const timer = setTimeout(() => setRightPanelFade(true), 80);
      return () => clearTimeout(timer);
    }
  }, [previewSource]);

  // Reset preview state when leaving the detection step
  useEffect(() => {
    if (currentStep !== 3) {
      setPreviewPhase(null);
      setPreviewSource(null);
    }
  }, [currentStep]);
  useEffect(() => {
    requestAnimationFrame(() => {
      if (feedEndRef.current) {
        feedEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }, [currentStep, isConfirmed, isProcessing, isStreaming, streamedText, previewPhase, previewSource]);

  const handleChipSelect = useCallback(
    (key) => {
      if (isConfirmed || isProcessing) return;

      // OTel collector step (index 6) "Go back" → Q3 (index 2)
      if (currentStep === 6 && key === 'goback') {
        setCurrentStep(2);
        return;
      }

      // Q1 (index 0) — store useCase into recommendationContext
      if (currentStep === 0) {
        setRecommendationContext((prev) => ({ ...prev, useCase: key }));
      }

      // Q2 (index 1) — store totalDailyVolume into recommendationContext
      if (currentStep === 1) {
        setRecommendationContext((prev) => ({ ...prev, totalDailyVolume: key }));
      }

      // Instrument State A (index 4) — store instrumentTarget
      if (currentStep === 4) {
        setInstrumentTarget(key);
      }

      // Instrument State B (index 5) — "Show me a different target" goes back to State A
      if (currentStep === 5 && key === 'different-target') {
        setCurrentStep(4);
        setConfirmedSteps((prev) => {
          const newConfirmed = { ...prev };
          delete newConfirmed[4];
          delete newConfirmed[5];
          return newConfirmed;
        });
        return;
      }

      // Migrate State A (index 8) — store migrateSource
      if (currentStep === 8) {
        setMigrateSource(key);
      }

      // Migrate State B (index 9) — "Choose a different source" goes back to State A
      if (currentStep === 9 && key === 'different-source') {
        setCurrentStep(8);
        setConfirmedSteps((prev) => {
          const newConfirmed = { ...prev };
          delete newConfirmed[8];
          delete newConfirmed[9];
          return newConfirmed;
        });
        return;
      }

      setSelections((prev) => ({ ...prev, [currentStep]: key }));
      setIsProcessing(true);
      setTimeout(() => {
        setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
        setIsProcessing(false);
      }, 1000);
    },
    [currentStep, isConfirmed, isProcessing]
  );

  // Handle the post-detection interactive chips (preview flow).
  // These fire while step 3 (auto-discovery) is already confirmed.
  const handleDetectionChip = useCallback(
    (key) => {
      if (key === 'use-recommended') {
        setPreviewPhase(null);
        setPreviewSource(null);
        // Converge into the shared wrap-up (W1) instead of jumping to Review
        const w1 = STEPS.findIndex((s) => s.subStep === 'wrap-destination');
        setCurrentStep(w1);
        return;
      }
      if (key === 'preview-source') {
        setPreviewPhase('asking');
        setPreviewSource(null);
        return;
      }
      if (key === 'preview-another') {
        setPreviewPhase('asking');
        setPreviewSource(null);
        return;
      }
      if (key === 'preview-continue') {
        setPreviewPhase(null);
        setPreviewSource(null);
        // Converge into the shared wrap-up (W1) instead of jumping to Review
        const w1 = STEPS.findIndex((s) => s.subStep === 'wrap-destination');
        setCurrentStep(w1);
        return;
      }
      // "Done — use these sources" → converge into the shared wrap-up (W1)
      if (key === 'scope-done') {
        const w1 = STEPS.findIndex((s) => s.subStep === 'wrap-destination');
        setCurrentStep(w1);
        return;
      }
      // "Use only recommended" → trim scope to recommended keys
      if (key === 'scope-recommended') {
        const recs = computeSourceRecommendations(recommendationContext);
        setSelectedScope(getRecommendedSourceKeys(recs));
        return;
      }
    },
    [setCurrentStep, recommendationContext]
  );

  // Toggle a single source in/out of the AWS detection scope (interactive cards).
  const handleToggleScope = useCallback((key) => {
    setSelectedScope((prev) => {
      const base = prev || ALL_DETECTED_KEYS;
      return base.includes(key)
        ? base.filter((k) => k !== key)
        : [...base, key];
    });
  }, []);

  // Toggle a single resource instance within a source (opt-in "Adjust" list).
  const handleToggleResource = useCallback((sourceKey, instanceId) => {
    setSourceScope((prev) => {
      const res = SOURCE_RESOURCES[sourceKey];
      const current =
        (prev && prev[sourceKey]) ||
        res.instances.filter((i) => i.defaultOn).map((i) => i.id);
      const next = current.includes(instanceId)
        ? current.filter((id) => id !== instanceId)
        : [...current, instanceId];
      return { ...prev, [sourceKey]: next };
    });
  }, []);

  // Handle the shared wrap-up chips (W1 → W2 → W3 → Step 2).
  // Navigation is driven directly (like handleDetectionChip); wrap-up steps
  // are never added to confirmedSteps and do not use the generic auto-advance.
  const handleWrapupChip = useCallback(
    (key) => {
      const w1 = STEPS.findIndex((s) => s.subStep === 'wrap-destination');
      const w2 = STEPS.findIndex((s) => s.subStep === 'wrap-datahandling');
      const w3 = STEPS.findIndex((s) => s.subStep === 'wrap-summary');
      const reviewIdx = STEPS.findIndex((s) => s.mainStep === 2);

      // ── W1: Destination ──
      if (key === 'dest-new') {
        setDestinationChoice('new');
        setDestinationPhase(null);
        setCurrentStep(w2);
        return;
      }
      if (key === 'dest-existing') {
        setDestinationPhase('picking-existing');
        return;
      }
      if (key === 'dest-custom') {
        setDestinationChoice('custom');
        setDestinationPhase('custom-note');
        return;
      }
      if (key === 'dest-custom-continue') {
        setDestinationPhase(null);
        setCurrentStep(w2);
        return;
      }
      if (key.startsWith('collection:')) {
        setDestinationChoice(key);
        setDestinationPhase(null);
        setCurrentStep(w2);
        return;
      }

      // ── W2: Data handling toggles + continue ──
      if (key === 'toggle-pid') {
        setDataHandling((prev) => ({ ...prev, removePID: !prev.removePID }));
        return;
      }
      if (key === 'toggle-catalog') {
        setDataHandling((prev) => ({ ...prev, serviceCatalog: !prev.serviceCatalog }));
        return;
      }
      if (key === 'datahandling-continue') {
        setCurrentStep(w3);
        return;
      }

      // ── W3: final check ──
      if (key === 'wrapup-to-step2') {
        setCurrentStep(reviewIdx);
        return;
      }
      if (key === 'wrapup-make-changes') {
        setDestinationPhase(null);
        setCurrentStep(w1);
        return;
      }
    },
    [setCurrentStep]
  );

  const handleMultiSelectToggle = useCallback(
    (key) => {
      if (isConfirmed || isProcessing) return;
      const current = Array.isArray(selections[currentStep])
        ? selections[currentStep]
        : [];
      const updated = current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
      setSelections((prev) => ({ ...prev, [currentStep]: updated }));
    },
    [currentStep, isConfirmed, isProcessing, selections]
  );

  const handleMultiSelectConfirm = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
      setIsProcessing(false);
    }, 1000);
  }, [currentStep, isProcessing]);

  const handleSkip = useCallback(() => {
    if (isConfirmed || isProcessing) return;
    setSelections((prev) => ({ ...prev, [currentStep]: [] }));
    setIsProcessing(true);
    setTimeout(() => {
      setConfirmedSteps((prev) => ({ ...prev, [currentStep]: true }));
      setIsProcessing(false);
    }, 700);
  }, [currentStep, isConfirmed, isProcessing]);

  // Auto-advance to next step after confirmation.
  //
  // Index map (0-based) after Prompt 5:
  //   0  Q1 use case        → 1
  //   1  Q2 volume          → 2
  //   2  Q3 data location   → branches: aws→3, instrument→4, migrate→8
  //   3  AWS detection      → user-driven (handleDetectionChip) → W1
  //   4  Instrument State A → 5
  //   5  Instrument State B → 6
  //   6  Instrument State C → 7
  //   7  Instrument State D → "looks-good" → W1 (wrap-up); "customize" stays
  //   8  Migrate State A    → 9
  //   9  Migrate State B    → 10
  //   10 Migrate State C    → 11
  //   11 Migrate State D    → "looks-good" → W1 (wrap-up); "customize" stays
  //   12 W1 destination     → user-driven (handleWrapupChip)
  //   13 W2 data handling   → user-driven (handleWrapupChip)
  //   14 W3 final check     → user-driven → Step 2 (Review)
  //   15 OTel collector     (legacy, unreached)
  //   16 Telemetry storage  (legacy, unreached)
  //   17 Review             (mainStep 2)
  //   18 Collecting         (mainStep 3)
  useEffect(() => {
    if (isConfirmed && currentStep < totalSteps - 1) {
      const currentStepDef = STEPS[currentStep];

      // Detection step: user drives via handleDetectionChip
      if (currentStepDef.optionType === 'auto-discovery') {
        return;
      }

      // Placeholder steps — don't auto-advance
      if (currentStepDef.optionType === 'placeholder') {
        return;
      }

      // Wrap-up steps: user drives via handleWrapupChip
      if (currentStepDef.optionType === 'wrapup') {
        return;
      }

      const w1 = STEPS.findIndex((s) => s.subStep === 'wrap-destination');

      const timer = setTimeout(() => {
        setCurrentStep((prev) => {
          const prevDef = STEPS[prev];

          // Q3 — branch on selection
          if (prevDef.subStep === 3) {
            const choice = selections[prev];
            if (choice === 'aws-services') return 3;   // → detection
            if (choice === 'instrument-app') return 4; // → Instrument State A
            if (choice === 'migrate') {
              return STEPS.findIndex((s) => s.subStep === '3-migrate-source');
            }
            return 3; // fallback
          }

          // Instrument State D / Migrate State D — converge to wrap-up on "looks-good"
          if (prevDef.subStep === '3-instrument-confirm' || prevDef.subStep === '3-migrate-confirm') {
            const choice = selections[prev];
            if (choice === 'customize') {
              return prev; // Stay (placeholder "Manual config coming soon.")
            }
            return w1; // "looks-good" → W1 wrap-up
          }

          // Default: sequential (Instrument/Migrate intermediate states)
          return prev + 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, currentStep, totalSteps, selections]);

  const handleStepClick = useCallback(
    (stepIdx) => {
      if (stepIdx < currentStep && confirmedSteps[stepIdx]) {
        setCurrentStep(stepIdx);
        // Reset subsequent steps
        const newSelections = { ...selections };
        const newConfirmed = { ...confirmedSteps };
        for (let i = stepIdx; i < totalSteps; i++) {
          delete newSelections[i];
          delete newConfirmed[i];
        }
        setSelections(newSelections);
        setConfirmedSteps(newConfirmed);
      }
    },
    [currentStep, confirmedSteps, selections, totalSteps]
  );

  const [isExiting, setIsExiting] = useState(false);

  const handleFinishLater = () => {
    setIsExiting(true);
    setTimeout(() => {
      window.location.hash = '/sample-pages';
    }, 600);
  };

  // Last step: selections navigate away
  const handleFinalNavigation = () => {
    setIsExiting(true);
    setTimeout(() => {
      window.location.hash = '/sample-pages';
    }, 600);
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    const matchedOption = step.options.find(
      (opt) => opt.label.toLowerCase() === text.toLowerCase()
    );
    if (matchedOption) {
      handleChipSelect(matchedOption.key);
    }
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  // Build the conversation messages from completed steps + current step
  const buildConversation = () => {
    const messages = [];
    const currentMainStep = step.mainStep;

    // Only show chat history from sub-steps within the same main step
    for (let i = 0; i < currentStep; i++) {
      const pastStep = STEPS[i];
      const pastSelection = selections[i];

      // Skip steps from previous main steps — only show sub-step history
      if (pastStep.mainStep !== currentMainStep) continue;

      // Only show history for steps the user actually visited/confirmed.
      // This keeps unvisited branch steps (e.g. Instrument steps when the user
      // took the Migrate branch) out of the chat history after convergence.
      if (!confirmedSteps[i]) continue;

      // Assistant question (skip empty-question states, e.g. State B/D)
      if (pastStep.question) {
        messages.push(
          <div
            key={`q-${i}`}
            className="threadPage__message threadPage__message--assistant">
            <div className="threadPage__bubble threadPage__bubble--assistant">
              <OuiText size="s">
                <p>{pastStep.question}</p>
              </OuiText>
            </div>
          </div>
        );
      }

      // User selection as user message
      if (pastSelection) {
        const selectionLabel = getSelectionLabel(pastStep, pastSelection);
        messages.push(
          <div
            key={`a-${i}`}
            className="threadPage__message threadPage__message--user">
            <div className="threadPage__bubble threadPage__bubble--user">
              <OuiText size="s">
                <p>{selectionLabel}</p>
              </OuiText>
            </div>
          </div>
        );
      }

      // Confirmation
      if (confirmedSteps[i] && pastStep.confirmation) {
        const confirmText = typeof pastStep.confirmation === 'function'
          ? pastStep.confirmation(pastSelection, recommendationContext)
          : pastStep.confirmation;
        messages.push(
          <div
            key={`c-${i}`}
            className="threadPage__message threadPage__message--assistant">
            <div className="threadPage__bubble threadPage__bubble--assistant">
              <div className="onboardWizard__confirmInline">
                <OuiIcon type="checkInCircleFilled" size="s" color="success" />
                <OuiText size="xs">
                  <span>{confirmText}</span>
                </OuiText>
              </div>
            </div>
          </div>
        );
      }
    }

    // Current step: assistant question (with typing animation)
    messages.push(
      <div
        key={`q-${currentStep}`}
        className="threadPage__message threadPage__message--assistant">
        <div className="onboardWizard__assistantRow">
          <div
            className={`onboardWizard__assistantAvatar onboardWizard__assistantAvatar--popIn${
              isStreaming && !streamedText
                ? ' onboardWizard__assistantAvatar--pulsing'
                : ''
            }`}>
            <Mascot
              size={28}
              idle
              bob={false}
              follow={false}
              color={mascotColor}
              eyeColor={mascotEyeColor}
            />
          </div>
          <div className="threadPage__bubble threadPage__bubble--assistant">
            {streamedText && (
              <OuiText size="s">
                {streamedText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>
                    {paragraph}
                    {isStreaming &&
                      idx === streamedText.split('\n\n').length - 1 && (
                        <span className="onboardWizard__typeCursor" />
                      )}
                  </p>
                ))}
              </OuiText>
            )}
            {!isStreaming && !isConfirmed && (
              <div className="onboardWizard__optionsReveal onboardWizard__optionsReveal--inline">
                {renderOptions()}
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // If the current step has a selection, show user message
    if (currentSelection && isConfirmed) {
      const selectionLabel = getSelectionLabel(step, currentSelection);
      messages.push(
        <div
          key={`a-${currentStep}`}
          className="threadPage__message threadPage__message--user">
          <div className="threadPage__bubble threadPage__bubble--user">
            <OuiText size="s">
              <p>{selectionLabel}</p>
            </OuiText>
          </div>
        </div>
      );
    }

    // Processing indicator
    if (isProcessing) {
      messages.push(
        <div
          key="processing"
          className="threadPage__message threadPage__message--assistant">
          <div className="threadPage__bubble threadPage__bubble--assistant">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <OuiLoadingSpinner size="s" />
              <OuiText size="xs" color="subdued">
                Processing...
              </OuiText>
            </div>
          </div>
        </div>
      );
    }

    // Confirmation for current step
    if (isConfirmed && step.confirmation) {
      const confirmText = typeof step.confirmation === 'function'
        ? step.confirmation(currentSelection, recommendationContext)
        : step.confirmation;
      messages.push(
        <div
          key={`c-${currentStep}`}
          className="threadPage__message threadPage__message--assistant">
          <div className="threadPage__bubble threadPage__bubble--assistant">
            <div className="onboardWizard__confirmInline">
              <OuiIcon type="checkInCircleFilled" size="s" color="success" />
              <OuiText size="xs">
                <span>{confirmText}</span>
              </OuiText>
            </div>
          </div>
        </div>
      );
    }

    // ── Post-detection scope selection (step index 3, auto-discovery confirmed) ──
    // Interaction now lives in the right-panel cards (check/expand). The left
    // shows a single dynamic "Done" chip reflecting the current selection count.
    if (currentStep === 3 && isConfirmed && step.optionType === 'auto-discovery' && !isStreaming) {
      const count = (selectedScope || ALL_DETECTED_KEYS).length;
      const isRecommendedScope =
        count === getRecommendedSourceKeys(computeSourceRecommendations(recommendationContext)).length;
      messages.push(
        <div key="scope-chips" className="threadPage__message threadPage__message--assistant">
          <div className="threadPage__bubble threadPage__bubble--assistant">
            <div className="onboardWizard__optionsReveal onboardWizard__optionsReveal--inline">
              <div className="onboardWizard__chips">
                <button type="button" className="onboardWizard__chip onboardWizard__chip--confirm"
                  onClick={() => handleDetectionChip('scope-done')}
                  disabled={count === 0}>
                  <span>Done — use {count === 1 ? 'this source' : `these ${count} sources`}</span>
                </button>
                {!isRecommendedScope && (
                  <button type="button" className="onboardWizard__chip"
                    onClick={() => handleDetectionChip('scope-recommended')}>
                    <span>Use only recommended</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Shared wrap-up chips (W1/W2/W3) — LEFT interactive ──
    if (step.optionType === 'wrapup' && !isStreaming) {
      // W1 — Destination
      if (step.subStep === 'wrap-destination') {
        if (destinationPhase === 'picking-existing') {
          messages.push(
            <div key="wrap-existing" className="threadPage__message threadPage__message--assistant">
              <div className="threadPage__bubble threadPage__bubble--assistant">
                <OuiText size="s"><p>Which collection should receive your data?</p></OuiText>
                <div className="onboardWizard__optionsReveal onboardWizard__optionsReveal--inline" style={{ marginTop: 10 }}>
                  <div className="onboardWizard__chips">
                    {EXAMPLE_COLLECTIONS.map((c) => (
                      <button key={c.key} type="button" className="onboardWizard__chip"
                        onClick={() => handleWrapupChip(`collection:${c.key}`)}>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (destinationPhase === 'custom-note') {
          messages.push(
            <div key="wrap-custom-note" className="threadPage__message threadPage__message--assistant">
              <div className="threadPage__bubble threadPage__bubble--assistant">
                <OuiText size="s"><p>Manual collection settings coming soon.</p></OuiText>
                <div className="onboardWizard__optionsReveal onboardWizard__optionsReveal--inline" style={{ marginTop: 10 }}>
                  <div className="onboardWizard__chips">
                    <button type="button" className="onboardWizard__chip onboardWizard__chip--confirm"
                      onClick={() => handleWrapupChip('dest-custom-continue')}>
                      <span>Continue</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          messages.push(
            <div key="wrap-dest-chips" className="threadPage__message threadPage__message--assistant">
              <div className="threadPage__bubble threadPage__bubble--assistant">
                <div className="onboardWizard__optionsReveal onboardWizard__optionsReveal--inline">
                  <div className="onboardWizard__chips">
                    <button type="button" className="onboardWizard__chip onboardWizard__chip--confirm"
                      onClick={() => handleWrapupChip('dest-new')}>
                      <span>Store in a new collection</span>
                    </button>
                    <button type="button" className="onboardWizard__chip"
                      onClick={() => handleWrapupChip('dest-existing')}>
                      <span>Select an existing collection</span>
                    </button>
                    <button type="button" className="onboardWizard__chip"
                      onClick={() => handleWrapupChip('dest-custom')}>
                      <span>Customize</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      }

      // W2 — Data handling (toggle chips + continue)
      if (step.subStep === 'wrap-datahandling') {
        messages.push(
          <div key="wrap-datahandling-chips" className="threadPage__message threadPage__message--assistant">
            <div className="threadPage__bubble threadPage__bubble--assistant">
              <div className="onboardWizard__optionsReveal onboardWizard__optionsReveal--inline">
                <div className="onboardWizard__chips">
                  <button type="button"
                    className={`onboardWizard__chip${dataHandling.removePID ? ' onboardWizard__chip--selected' : ''}`}
                    onClick={() => handleWrapupChip('toggle-pid')}>
                    <span>Remove PID (mask PII){dataHandling.removePID ? ' ✓' : ''}</span>
                  </button>
                  <button type="button"
                    className={`onboardWizard__chip${dataHandling.serviceCatalog ? ' onboardWizard__chip--selected' : ''}`}
                    onClick={() => handleWrapupChip('toggle-catalog')}>
                    <span>Add to service catalog{dataHandling.serviceCatalog ? ' ✓' : ''}</span>
                  </button>
                  <button type="button" className="onboardWizard__chip onboardWizard__chip--confirm"
                    onClick={() => handleWrapupChip('datahandling-continue')}>
                    <span>Skip / continue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // W3 — Step 1 final check
      if (step.subStep === 'wrap-summary') {
        messages.push(
          <div key="wrap-summary-chips" className="threadPage__message threadPage__message--assistant">
            <div className="threadPage__bubble threadPage__bubble--assistant">
              <div className="onboardWizard__optionsReveal onboardWizard__optionsReveal--inline">
                <div className="onboardWizard__chips">
                  <button type="button" className="onboardWizard__chip onboardWizard__chip--confirm"
                    onClick={() => handleWrapupChip('wrapup-to-step2')}>
                    <span>Looks good — continue to Step 2</span>
                  </button>
                  <button type="button" className="onboardWizard__chip"
                    onClick={() => handleWrapupChip('wrapup-make-changes')}>
                    <span>Make changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    return messages;
  };

  // Render interactive options (chips or multi-select) for the current step
  const renderOptions = () => {
    if (isConfirmed) return null;

    if (step.optionType === 'chips') {
      return (
        <>
          <div className="onboardWizard__chips">
            {step.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`onboardWizard__chip${
                  currentSelection === opt.key
                    ? ' onboardWizard__chip--selected'
                    : ''
                }${opt.primary ? ' onboardWizard__chip--confirm' : ''}${
                  opt.empty ? ' onboardWizard__chip--empty' : ''
                }`}
                onClick={() =>
                  isLastStep
                    ? handleFinalNavigation(opt.key)
                    : handleChipSelect(opt.key)
                }
                disabled={isConfirmed || isProcessing}>
                <span>{opt.label}</span>
                {opt.description && (
                  <span className="onboardWizard__chipDescription">
                    {opt.description}
                  </span>
                )}
              </button>
            ))}
          </div>
          {step.skipLabel && (
            <div
              className="onboardWizard__multiActions"
              style={{ marginTop: 8 }}>
              <button
                type="button"
                className="onboardWizard__skipLink"
                onClick={handleSkip}
                disabled={isProcessing}>
                {step.skipLabel}
              </button>
            </div>
          )}
        </>
      );
    }

    if (step.optionType === 'multiselect') {
      return (
        <div className="onboardWizard__multiSelect">
          {step.options.map((opt) => {
            const checked =
              Array.isArray(currentSelection) &&
              currentSelection.includes(opt.key);
            return (
              <div key={opt.key} className="onboardWizard__multiOption">
                <OuiCheckbox
                  id={`transform-${opt.key}`}
                  label={opt.label}
                  checked={checked}
                  onChange={() => handleMultiSelectToggle(opt.key)}
                  disabled={isConfirmed || isProcessing}
                />
                <OuiText
                  size="xs"
                  color="subdued"
                  className="onboardWizard__multiDesc">
                  {opt.description}
                </OuiText>
              </div>
            );
          })}
          {!isConfirmed && (
            <div className="onboardWizard__multiActions">
              <button
                type="button"
                className="onboardWizard__chip onboardWizard__chip--confirm"
                onClick={handleMultiSelectConfirm}
                disabled={
                  isProcessing ||
                  !currentSelection ||
                  (Array.isArray(currentSelection) &&
                    currentSelection.length === 0)
                }>
                Apply transformations
              </button>
              <button
                type="button"
                className="onboardWizard__skipLink"
                onClick={handleSkip}
                disabled={isProcessing}>
                {step.skipLabel}
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (showIntro) {
    return (
      <div
        className="onboardWizard__introWrapper"
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
        <SessionLeftNav
          isEmptySession={true}
          activeView="session"
          disableActions={true}
          onCreateSession={() => {}}
          onBrowseSessions={() => {}}
          onBrowseLibrary={() => {}}
          onSelectSession={() => {}}
        />
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
          }}>
          <div
            className="samplePagesContentPanel"
            style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <div
              className={`onboardWizard__intro${
                introExiting ? ' onboardWizard__intro--exiting' : ''
              }`}>
              <div className="onboardWizard__introContent">
                <div className="onboardWizard__logoGlow">
                  <OpenSearch3DLogo size={320} />
                </div>
                <OuiSpacer size="l" />
                <OuiTitle size="l">
                  <h1>Welcome to OpenSearch</h1>
                </OuiTitle>
                <OuiSpacer size="s" />
                <OuiText color="subdued">
                  <p>
                    Set up your observability pipeline in minutes. We'll guide
                    you through connecting your data sources, configuring
                    collectors, and getting insights from your telemetry.
                  </p>
                </OuiText>
                <OuiSpacer size="xl" />
                <button
                  type="button"
                  className="onboardWizard__introCta"
                  onClick={handleStartOnboarding}>
                  Get started
                </button>
                <OuiSpacer size="m" />
                <OuiSmallButtonEmpty
                  iconType="arrowRight"
                  iconSide="right"
                  onClick={() => {
                    window.location.hash = '/sample-pages';
                  }}>
                  Skip onboarding
                </OuiSmallButtonEmpty>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="onboardWizard__outerWrapper"
      style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      {/* Left nav — matches Day N session experience */}
      <SessionLeftNav
        isEmptySession={true}
        activeView="session"
        disableActions={true}
        onCreateSession={() => {}}
        onBrowseSessions={() => {}}
        onBrowseLibrary={() => {}}
        onSelectSession={() => {}}
      />

      {/* Content area with chrome panel */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
        }}>
        <div
          className="samplePagesContentPanel"
          style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div
            className={`onboardWizard${
              isExiting ? ' onboardWizard--exiting' : ''
            }${
              step.rightPanel && step.rightPanel.contentType === 'source-detection'
                ? ' onboardWizard--wideRight'
                : ''
            }`}>
            {/* Left Panel — Thread-style chat interaction */}
            <div className="onboardWizard__left">
              <div className="onboardWizard__leftPanel">
                <div className="threadPage__body">
                  <div className="threadPage__conversationCol">
                    {/* Step indicator header */}
                    <div
                      className="onboardWizard__stepIndicator"
                      style={{ padding: '12px 16px 0' }}>
                      <OuiTitle size="xxxs">
                        <h6>
                          Step {step.mainStep} of {totalMainSteps}
                        </h6>
                      </OuiTitle>
                      <OuiTitle size="s">
                        <h3>{step.title}</h3>
                      </OuiTitle>
                      <div
                        className="onboardWizard__timeline"
                        style={{ marginTop: 8 }}>
                        {Array.from(
                          { length: totalMainSteps },
                          (_, mainIdx) => {
                            const mainNum = mainIdx + 1;
                            const isMainDone = step.mainStep > mainNum;
                            const isMainCurrent = step.mainStep === mainNum;
                            // Find the first sub-step index for this main step (for navigation)
                            const firstSubIdx = STEPS.findIndex(
                              (s) => s.mainStep === mainNum
                            );
                            if (isMainDone) {
                              return (
                                <button
                                  key={mainIdx}
                                  type="button"
                                  className="onboardWizard__timelineDot onboardWizard__timelineDot--done"
                                  onClick={() => handleStepClick(firstSubIdx)}
                                  aria-label={`Go back to step ${mainNum}: ${STEPS[firstSubIdx].title}`}
                                  title={STEPS[firstSubIdx].title}
                                />
                              );
                            }
                            if (isMainCurrent) {
                              return (
                                <span
                                  key={mainIdx}
                                  className="onboardWizard__timelineDot onboardWizard__timelineDot--current"
                                />
                              );
                            }
                            return (
                              <span
                                key={mainIdx}
                                className="onboardWizard__timelineDot onboardWizard__timelineDot--inactive"
                              />
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Conversation feed — reuses threadPage__feed pattern */}
                    <div className="threadPage__feed" ref={feedRef}>
                      {buildConversation()}
                      <div ref={feedEndRef} />
                    </div>

                    {/* Input area */}
                    <div className="threadPage__inputArea">
                      <div className="threadPage__inputWrapper">
                        <OuiCompressedTextArea
                          placeholder="Ask anything or use / for commands"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          rows={2}
                          resize="none"
                          fullWidth
                          className="threadPage__textarea"
                        />
                        <div className="threadPage__inputActions">
                          <OuiButtonIcon
                            iconType="plus"
                            aria-label="Add attachment"
                            size="s"
                            color="text"
                          />
                          <OuiButtonIcon
                            iconType="sortUp"
                            aria-label="Send message"
                            display="fill"
                            size="s"
                            isDisabled={!message.trim() || isProcessing}
                            onClick={handleSend}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="onboardWizard__right">
              <div
                className={`onboardWizard__rightPanel${
                  rightPanelFade ? ' onboardWizard__rightPanel--fadeIn' : ''
                }`}
                key={`${currentStep}-${previewSource}`}>
                <RightPanelContent
                  step={step}
                  selectedOption={currentSelection}
                  confirmed={isConfirmed}
                  allSelections={selections}
                  previewSource={previewSource}
                  recommendationContext={recommendationContext}
                  instrumentTarget={instrumentTarget}
                  migrateSource={migrateSource}
                  destinationChoice={destinationChoice}
                  destinationPhase={destinationPhase}
                  dataHandling={dataHandling}
                  selectedScope={selectedScope}
                  onToggleSource={handleToggleScope}
                  sourceScope={sourceScope}
                  onToggleResource={handleToggleResource}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skip onboarding — bottom center, outside overflow:hidden containers */}
      <div className="onboardWizard__skipLink--fixed">
        <OuiSmallButtonEmpty
          iconType="arrowRight"
          iconSide="right"
          onClick={() => {
            window.location.hash = '/sample-pages';
          }}>
          Skip onboarding
        </OuiSmallButtonEmpty>
      </div>
    </div>
  );
};

// Helper to get a label for a user's selection
function getSelectionLabel(step, selection) {
  if (Array.isArray(selection)) {
    if (selection.length === 0) return 'Skipped';
    return selection
      .map((key) => {
        const opt = step.options.find((o) => o.key === key);
        return opt ? opt.label : key;
      })
      .join(', ');
  }
  const opt = step.options.find((o) => o.key === selection);
  return opt ? opt.label : selection;
}

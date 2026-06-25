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

import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import moment, { Moment } from 'moment'; // eslint-disable-line import/named
import dateMath from '@opensearch/datemath';

// @ts-ignore - JS component import
import { EuiPopover } from '../../popover';
// @ts-ignore - JS component import
import { EuiButton, EuiButtonEmpty, EuiButtonIcon } from '../../button';
// @ts-ignore - JS component import
import { EuiFlexGroup, EuiFlexItem } from '../../flex';
// @ts-ignore - JS component import
import { EuiSpacer } from '../../spacer';
// @ts-ignore - JS component import
import { EuiText } from '../../text';
// @ts-ignore - JS component import
import { EuiTitle } from '../../title';
// @ts-ignore - JS component import
import { EuiFieldText } from '../../form/field_text';
// @ts-ignore - JS component import
import { EuiSelect } from '../../form/select';
// @ts-ignore - JS component import
import { EuiFormLabel } from '../../form/form_label';
// @ts-ignore - JS component import
import { EuiHorizontalRule } from '../../horizontal_rule';
// @ts-ignore - JS component import
import { EuiListGroup, EuiListGroupItem } from '../../list_group';
import { EuiIcon } from '../../icon';
import { EuiDatePicker } from '../date_picker';

import {
  prettyDuration,
  commonDurationRanges,
} from '../super_date_picker/pretty_duration';

import { DurationRange } from '../types';

/**
 * Relative quick-select ranges shown in the sidebar.
 * These are the "Last X" style ranges.
 */
const RELATIVE_RANGES: DurationRange[] = [
  { start: 'now-15m', end: 'now', label: 'Last 15 minutes' },
  { start: 'now-30m', end: 'now', label: 'Last 30 minutes' },
  { start: 'now-3h', end: 'now', label: 'Last 3 hours' },
  { start: 'now-6h', end: 'now', label: 'Last 6 hours' },
  { start: 'now-12h', end: 'now', label: 'Last 12 hours' },
  { start: 'now-24h', end: 'now', label: 'Last 24 hours' },
  { start: 'now-2d', end: 'now', label: 'Last 2 days' },
  { start: 'now-7d', end: 'now', label: 'Last 7 days' },
  { start: 'now-14d', end: 'now', label: 'Last 14 days' },
  { start: 'now-30d', end: 'now', label: 'Last 30 days' },
  { start: 'now-90d', end: 'now', label: 'Last 90 days' },
  { start: 'now-7M', end: 'now', label: 'Last 7 months' },
  { start: 'now-1y', end: 'now', label: 'Last 1 year' },
  { start: 'now-2y', end: 'now', label: 'Last 2 years' },
  { start: 'now-5y', end: 'now', label: 'Last 5 years' },
];

/**
 * Common timezone options.
 */
const TIMEZONE_OPTIONS = [
  { value: 'UTC', text: 'UTC' },
  { value: 'America/New_York', text: 'GMT-05 (Eastern US & Canada)' },
  { value: 'America/Chicago', text: 'GMT-06 (Central US & Canada)' },
  { value: 'America/Denver', text: 'GMT-07 (Mountain US & Canada)' },
  { value: 'America/Los_Angeles', text: 'GMT-08 (Pacific US & Canada)' },
  { value: 'America/Anchorage', text: 'GMT-09 (Alaska)' },
  { value: 'Pacific/Honolulu', text: 'GMT-10 (Hawaii)' },
  { value: 'Europe/London', text: 'GMT+00 (London)' },
  { value: 'Europe/Paris', text: 'GMT+01 (Central Europe)' },
  { value: 'Europe/Helsinki', text: 'GMT+02 (Eastern Europe)' },
  { value: 'Asia/Kolkata', text: 'GMT+05:30 (India)' },
  { value: 'Asia/Shanghai', text: 'GMT+08 (China)' },
  { value: 'Asia/Tokyo', text: 'GMT+09 (Japan)' },
  { value: 'Australia/Sydney', text: 'GMT+11 (Sydney)' },
];

/** Shape of a recent range entry */
interface RecentRange {
  start: string;
  end: string;
  label: string;
}

export interface EuiDatePickerUnifiedProps {
  /** Start date string, e.g. 'now-15m' or an absolute ISO date */
  start: string;
  /** End date string, e.g. 'now' or an absolute ISO date */
  end: string;
  /** Callback fired when the time range changes */
  onTimeChange: (params: {
    start: string;
    end: string;
    isQuickSelection: boolean;
    isInvalid: boolean;
  }) => void;
  /** Commonly used quick-select ranges */
  commonlyUsedRanges?: DurationRange[];
  /** Date format string for display (moment format) */
  dateFormat?: string;
  /** Whether the picker is disabled */
  isDisabled?: boolean;
  /** Whether to show the Update button */
  showUpdateButton?: boolean;
  /** Whether to use compressed styling */
  compressed?: boolean;
  /** URL for the documentation link in the footer */
  documentationUrl?: string;
}

export const EuiDatePickerUnified: React.FC<EuiDatePickerUnifiedProps> = ({
  start,
  end,
  onTimeChange,
  commonlyUsedRanges = commonDurationRanges,
  dateFormat = 'MMM D, YYYY @ HH:mm:ss.SSS',
  isDisabled = false,
  showUpdateButton = true,
  compressed = false,
  documentationUrl = '#/components/date-picker',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Pending from/to values inside the popover
  const [pendingStart, setPendingStart] = useState(start);
  const [pendingEnd, setPendingEnd] = useState(end);

  // Calendar popover state
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);

  // Timezone
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  // Recents — persisted across open/close via ref-backed state
  const [recentRanges, setRecentRanges] = useState<RecentRange[]>([]);

  const displayText = useMemo(
    () => prettyDuration(start, end, commonlyUsedRanges, dateFormat),
    [start, end, commonlyUsedRanges, dateFormat]
  );

  // --- Popover lifecycle ---

  const openPopover = useCallback(() => {
    if (!isDisabled) {
      setPendingStart(start);
      setPendingEnd(end);
      setIsStartCalendarOpen(false);
      setIsEndCalendarOpen(false);
      setIsOpen(true);
    }
  }, [isDisabled, start, end]);

  const closePopover = useCallback(() => {
    // Don't close the main popover if a calendar sub-popover is open
    if (isStartCalendarOpen || isEndCalendarOpen) return;
    setIsOpen(false);
  }, [isStartCalendarOpen, isEndCalendarOpen]);

  // --- Apply helpers ---

  const addToRecents = useCallback(
    (newStart: string, newEnd: string) => {
      const label = prettyDuration(
        newStart,
        newEnd,
        [...RELATIVE_RANGES, ...commonlyUsedRanges],
        dateFormat
      );
      setRecentRanges((prev) => {
        // Deduplicate
        const filtered = prev.filter(
          (r) => !(r.start === newStart && r.end === newEnd)
        );
        return [{ start: newStart, end: newEnd, label }, ...filtered].slice(
          0,
          10
        );
      });
    },
    [commonlyUsedRanges, dateFormat]
  );

  const applyAndClose = useCallback(
    (newStart: string, newEnd: string, isQuickSelection: boolean) => {
      addToRecents(newStart, newEnd);
      onTimeChange({
        start: newStart,
        end: newEnd,
        isQuickSelection,
        isInvalid: false,
      });
      closePopover();
    },
    [onTimeChange, closePopover, addToRecents]
  );

  // --- Event handlers ---

  const handleRelativeRangeClick = useCallback(
    (range: DurationRange) => {
      applyAndClose(range.start, range.end, true);
    },
    [applyAndClose]
  );

  const handleApply = useCallback(() => {
    applyAndClose(pendingStart, pendingEnd, false);
  }, [pendingStart, pendingEnd, applyAndClose]);

  const handleCancel = useCallback(() => {
    closePopover();
  }, [closePopover]);

  const handleResetToNow = useCallback(() => {
    setPendingEnd(new Date().toISOString());
  }, []);

  const handleUpdateClick = useCallback(() => {
    addToRecents(start, end);
    onTimeChange({
      start,
      end,
      isQuickSelection: false,
      isInvalid: false,
    });
  }, [start, end, onTimeChange, addToRecents]);

  const getBounds = useCallback(() => {
    const startMoment = dateMath.parse(start);
    const endMoment = dateMath.parse(end, { roundUp: true });
    return {
      min:
        startMoment && startMoment.isValid()
          ? startMoment
          : moment().subtract(15, 'minute'),
      max: endMoment && endMoment.isValid() ? endMoment : moment(),
    };
  }, [start, end]);

  const handleStepBackward = useCallback(() => {
    const { min, max } = getBounds();
    const diff = max.diff(min);
    const newStart = moment(min)
      .subtract(diff + 1, 'ms')
      .toISOString();
    const newEnd = moment(min).subtract(1, 'ms').toISOString();
    addToRecents(newStart, newEnd);
    onTimeChange({
      start: newStart,
      end: newEnd,
      isQuickSelection: false,
      isInvalid: false,
    });
  }, [getBounds, onTimeChange, addToRecents]);

  const handleStepForward = useCallback(() => {
    const { min, max } = getBounds();
    const diff = max.diff(min);
    const newStart = moment(max).add(1, 'ms').toISOString();
    const newEnd = moment(max)
      .add(diff + 1, 'ms')
      .toISOString();
    addToRecents(newStart, newEnd);
    onTimeChange({
      start: newStart,
      end: newEnd,
      isQuickSelection: false,
      isInvalid: false,
    });
  }, [getBounds, onTimeChange, addToRecents]);

  const handleRecentClick = useCallback(
    (recent: RecentRange) => {
      applyAndClose(recent.start, recent.end, false);
    },
    [applyAndClose]
  );

  const handleStartCalendarChange = useCallback((date: Moment) => {
    if (date) {
      setPendingStart(date.toISOString());
    }
  }, []);

  const handleEndCalendarChange = useCallback((date: Moment) => {
    if (date) {
      setPendingEnd(date.toISOString());
    }
  }, []);

  // --- Derived values ---

  const startMoment = useMemo(
    () => moment(pendingStart, moment.ISO_8601, true),
    [pendingStart]
  );
  const endMoment = useMemo(() => moment(pendingEnd, moment.ISO_8601, true), [
    pendingEnd,
  ]);

  // --- Render ---

  const renderSidebar = () => (
    <div
      className="euiDatePickerUnified__sidebar"
      style={{
        width: 180,
        minWidth: 180,
        overflowY: 'auto',
        maxHeight: 360,
        borderRight: '1px solid rgba(128, 128, 128, 0.35)',
        paddingRight: 12,
      }}>
      <EuiListGroup flush gutterSize="none" maxWidth={false}>
        {RELATIVE_RANGES.map((range, i) => (
          <EuiListGroupItem
            key={i}
            label={range.label}
            onClick={() => handleRelativeRangeClick(range)}
            size="s"
            wrapText={false}
            data-test-subj={`euiDatePickerUnified-relative-${i}`}
          />
        ))}
      </EuiListGroup>
    </div>
  );

  const renderMainContent = () => (
    <div style={{ flex: 1, minWidth: 0, paddingLeft: 16 }}>
      {/* Header */}
      <EuiTitle size="xs">
        <h4>Time range</h4>
      </EuiTitle>

      <EuiSpacer size="s" />

      {/* From / To inputs */}
      <EuiFlexGroup gutterSize="m" responsive={false}>
        <EuiFlexItem>
          <EuiFormLabel>From</EuiFormLabel>
          <EuiSpacer size="xs" />
          <EuiFlexGroup gutterSize="xs" responsive={false} alignItems="center">
            <EuiFlexItem>
              <EuiFieldText
                compressed
                fullWidth
                value={pendingStart}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPendingStart(e.target.value)
                }
                aria-label="Start date"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                button={
                  <EuiButtonIcon
                    iconType="calendar"
                    aria-label="Select start date from calendar"
                    display="base"
                    size="s"
                    onClick={() => setIsStartCalendarOpen(!isStartCalendarOpen)}
                  />
                }
                isOpen={isStartCalendarOpen}
                closePopover={() => setIsStartCalendarOpen(false)}
                anchorPosition="downRight"
                panelPaddingSize="s">
                <EuiDatePicker
                  inline
                  showTimeSelect
                  shadow={false}
                  selected={startMoment.isValid() ? startMoment : moment()}
                  onChange={handleStartCalendarChange}
                />
                <EuiSpacer size="s" />
                <EuiButton
                  size="s"
                  fullWidth
                  onClick={() => setIsStartCalendarOpen(false)}
                  data-test-subj="euiDatePickerUnified-startCalendarSelect">
                  Select
                </EuiButton>
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup
            gutterSize="xs"
            alignItems="center"
            justifyContent="spaceBetween"
            responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiFormLabel>To</EuiFormLabel>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                size="xs"
                flush="right"
                onClick={handleResetToNow}
                style={{ fontSize: 11 }}
                data-test-subj="euiDatePickerUnified-resetToNow">
                Reset to now
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xs" />
          <EuiFlexGroup gutterSize="xs" responsive={false} alignItems="center">
            <EuiFlexItem>
              <EuiFieldText
                compressed
                fullWidth
                value={pendingEnd}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPendingEnd(e.target.value)
                }
                aria-label="End date"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                button={
                  <EuiButtonIcon
                    iconType="calendar"
                    aria-label="Select end date from calendar"
                    display="base"
                    size="s"
                    onClick={() => setIsEndCalendarOpen(!isEndCalendarOpen)}
                  />
                }
                isOpen={isEndCalendarOpen}
                closePopover={() => setIsEndCalendarOpen(false)}
                anchorPosition="downRight"
                panelPaddingSize="s">
                <EuiDatePicker
                  inline
                  showTimeSelect
                  shadow={false}
                  selected={endMoment.isValid() ? endMoment : moment()}
                  onChange={handleEndCalendarChange}
                />
                <EuiSpacer size="s" />
                <EuiButton
                  size="s"
                  fullWidth
                  onClick={() => setIsEndCalendarOpen(false)}
                  data-test-subj="euiDatePickerUnified-endCalendarSelect">
                  Select
                </EuiButton>
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      {/* Cancel / Apply buttons */}
      <EuiFlexGroup justifyContent="flexEnd" gutterSize="s" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            size="s"
            onClick={handleCancel}
            data-test-subj="euiDatePickerUnified-cancel">
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            size="s"
            fill
            onClick={handleApply}
            data-test-subj="euiDatePickerUnified-apply">
            Apply
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>

      {/* Recent section */}
      {recentRanges.length > 0 && (
        <>
          <EuiHorizontalRule margin="m" style={{ opacity: 1 }} />
          <EuiTitle size="xxs">
            <h5>Recent</h5>
          </EuiTitle>
          <EuiSpacer size="s" />
          <div
            style={{ maxHeight: 160, overflowY: 'auto', overflowX: 'hidden' }}
            className="euiDatePickerUnified__recents">
            {recentRanges.map((recent, i) => (
              <EuiFlexGroup
                key={i}
                gutterSize="s"
                alignItems="center"
                responsive={false}
                style={{ cursor: 'pointer', padding: '4px 0' }}
                onClick={() => handleRecentClick(recent)}
                data-test-subj={`euiDatePickerUnified-recent-${i}`}>
                <EuiFlexItem grow={false}>
                  <EuiIcon type="clock" size="s" color="subdued" />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size="xs" color="default">
                    {recent.label}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderFooter = () => (
    <>
      <EuiHorizontalRule margin="none" style={{ opacity: 0.8 }} />
      <EuiFlexGroup
        alignItems="center"
        justifyContent="spaceBetween"
        responsive={false}
        gutterSize="none"
        style={{ paddingTop: 16 }}>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            size="xs"
            iconType="popout"
            iconSide="right"
            href={documentationUrl}
            target="_blank"
            data-test-subj="euiDatePickerUnified-docsLink">
            Documentation
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false} style={{ minWidth: 240 }}>
          <EuiSelect
            compressed
            options={TIMEZONE_OPTIONS}
            value={
              TIMEZONE_OPTIONS.find((tz) => tz.value === timezone)
                ? timezone
                : 'UTC'
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setTimezone(e.target.value)
            }
            aria-label="Timezone"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );

  const triggerButton = (
    <EuiButton
      className={classNames('euiDatePickerUnified__trigger', {
        'euiDatePickerUnified__trigger--compressed': compressed,
      })}
      onClick={openPopover}
      isDisabled={isDisabled}
      iconType="calendar"
      iconSide="left"
      size={compressed ? 's' : 's'}
      data-test-subj="euiDatePickerUnified-triggerButton">
      {displayText}
    </EuiButton>
  );

  return (
    <EuiFlexGroup gutterSize="xs" responsive={false} alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          iconType="arrowLeft"
          aria-label="Previous time window"
          display="base"
          size="s"
          isDisabled={isDisabled}
          onClick={handleStepBackward}
          data-test-subj="euiDatePickerUnified-stepBackward"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiPopover
          button={triggerButton}
          isOpen={isOpen}
          closePopover={closePopover}
          anchorPosition="downLeft"
          panelPaddingSize="m"
          data-test-subj="euiDatePickerUnified-popover">
          <div
            style={{ width: 680 }}
            data-test-subj="euiDatePickerUnified-panel">
            <EuiFlexGroup
              gutterSize="none"
              responsive={false}
              style={{ height: 360 }}>
              {/* Left sidebar — relative ranges */}
              <EuiFlexItem grow={false}>{renderSidebar()}</EuiFlexItem>

              {/* Right main area */}
              <EuiFlexItem>{renderMainContent()}</EuiFlexItem>
            </EuiFlexGroup>

            {/* Footer — docs link + timezone */}
            {renderFooter()}
          </div>
        </EuiPopover>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          iconType="arrowRight"
          aria-label="Next time window"
          display="base"
          size="s"
          isDisabled={isDisabled}
          onClick={handleStepForward}
          data-test-subj="euiDatePickerUnified-stepForward"
        />
      </EuiFlexItem>
      {showUpdateButton && (
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType="refresh"
            aria-label="Refresh"
            display="fill"
            color="primary"
            size="s"
            isDisabled={isDisabled}
            onClick={handleUpdateClick}
            data-test-subj="euiDatePickerUnified-updateButton"
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

EuiDatePickerUnified.displayName = 'EuiDatePickerUnified';

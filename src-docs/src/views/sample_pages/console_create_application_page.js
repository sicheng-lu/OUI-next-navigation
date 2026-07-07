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

import React, { useState } from 'react';

// ─────────────────────────────────────────────
// STYLES (self-contained — AWS Console prototype)
// ─────────────────────────────────────────────

const colors = {
  navBg: '#232f3e',
  navText: '#ffffff',
  pageBg: '#f2f3f3',
  cardBg: '#ffffff',
  textPrimary: '#16191f',
  textSecondary: '#545b64',
  textMuted: '#687078',
  borderLight: '#d5dbdb',
  borderMedium: '#aab7b8',
  linkBlue: '#0073bb',
  awsOrange: '#ff9900',
  awsOrangeHover: '#ec7211',
  successGreen: '#1d8102',
  successBg: '#f2f8f0',
  successBorder: '#6aaf35',
  infoBlueBg: '#f1faff',
  infoBlueBorder: '#0073bb',
};

const fonts = {
  base: "'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif",
};

// ─────────────────────────────────────────────
// AWS CONSOLE TOP NAV
// ─────────────────────────────────────────────
const ConsoleTopNav = () => (
  <header
    style={{
      backgroundColor: colors.navBg,
      padding: '0 20px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #37475a',
      fontFamily: fonts.base,
    }}>
    <nav
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      aria-label="AWS Console navigation">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span
          style={{
            color: colors.navText,
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
          <svg width="20" height="12" viewBox="0 0 40 24" fill="none">
            <path
              d="M14.5 15.5c-4.7 0-8.8-1.8-12-4.5C5.7 14.3 9.8 16.5 14.5 16.5s8.8-2.2 12-5.5c-3.2 2.7-7.3 4.5-12 4.5z"
              fill="#FF9900"
            />
            <path
              d="M14.5 3C8.2 3 2.8 6.5.5 11.5c2.3-3.5 6.5-5.8 11.5-5.8s9.2 2.3 11.5 5.8C21.2 6.5 20.8 3 14.5 3z"
              fill="#ffffff"
            />
          </svg>
          AWS
        </span>
        <span style={{ color: '#aab7b8', fontSize: '13px' }}>Services</span>
        <span style={{ color: '#aab7b8', fontSize: '13px' }}>
          Resource Groups
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: colors.navText, fontSize: '12px' }}>
          user@example.com
        </span>
        <span style={{ color: '#aab7b8', fontSize: '12px' }}>
          US East (N. Virginia)
        </span>
      </div>
    </nav>
  </header>
);

// ─────────────────────────────────────────────
// BREADCRUMB
// ─────────────────────────────────────────────
const Breadcrumb = ({ items }) => (
  <nav
    aria-label="Breadcrumb"
    style={{ marginBottom: '16px', fontFamily: fonts.base }}>
    <ol
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        gap: '4px',
        fontSize: '13px',
      }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center' }}>
          {i > 0 && (
            <span style={{ color: colors.textMuted, margin: '0 6px' }}>/</span>
          )}
          {i < items.length - 1 ? (
            <a
              href="#"
              style={{ color: colors.linkBlue, textDecoration: 'none' }}>
              {item}
            </a>
          ) : (
            <span style={{ color: colors.textPrimary }}>{item}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

// ─────────────────────────────────────────────
// INFO PANEL
// ─────────────────────────────────────────────
const InfoPanel = ({ children }) => (
  <div
    style={{
      backgroundColor: colors.infoBlueBg,
      border: `1px solid ${colors.infoBlueBorder}`,
      borderLeft: `4px solid ${colors.infoBlueBorder}`,
      borderRadius: '2px',
      padding: '12px 16px',
      marginBottom: '20px',
      fontSize: '13px',
      color: colors.textPrimary,
      fontFamily: fonts.base,
    }}>
    {children}
  </div>
);

// ─────────────────────────────────────────────
// SUCCESS PANEL
// ─────────────────────────────────────────────
const SuccessPanel = ({ children }) => (
  <div
    style={{
      backgroundColor: colors.successBg,
      border: `1px solid ${colors.successBorder}`,
      borderLeft: `4px solid ${colors.successGreen}`,
      borderRadius: '2px',
      padding: '16px 20px',
      marginBottom: '20px',
      fontSize: '14px',
      color: colors.textPrimary,
      fontFamily: fonts.base,
    }}>
    {children}
  </div>
);

// ─────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────
const FormField = ({ label, required, helpText, children }) => (
  <div style={{ marginBottom: '20px' }}>
    <label
      style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 700,
        color: colors.textPrimary,
        marginBottom: '4px',
        fontFamily: fonts.base,
      }}>
      {label}
      {required && <span style={{ color: '#d13212' }}> *</span>}
    </label>
    {helpText && (
      <p
        style={{
          fontSize: '12px',
          color: colors.textMuted,
          margin: '0 0 6px 0',
        }}>
        {helpText}
      </p>
    )}
    {children}
  </div>
);

// ─────────────────────────────────────────────
// TEXT INPUT
// ─────────────────────────────────────────────
const TextInput = ({ value, onChange, placeholder, disabled }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    style={{
      width: '100%',
      maxWidth: '400px',
      padding: '6px 10px',
      fontSize: '14px',
      border: `1px solid ${disabled ? colors.borderLight : colors.borderMedium}`,
      borderRadius: '2px',
      fontFamily: fonts.base,
      backgroundColor: disabled ? '#f2f3f3' : '#ffffff',
      color: disabled ? colors.textMuted : colors.textPrimary,
      outline: 'none',
      boxSizing: 'border-box',
    }}
  />
);

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────
export const ConsoleCreateApplicationPage = () => {
  const [applicationName, setApplicationName] = useState(
    'my-observability-app'
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const handleCreate = () => {
    setIsCreating(true);
    // Simulate creation delay
    setTimeout(() => {
      setIsCreating(false);
      setIsCreated(true);
    }, 1500);
  };

  if (isCreated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: colors.pageBg,
          fontFamily: fonts.base,
        }}>
        <ConsoleTopNav />

        <main style={{ padding: '20px 32px', maxWidth: '1200px' }}>
          <Breadcrumb
            items={[
              'Amazon OpenSearch Service',
              'Applications',
              applicationName,
            ]}
          />

          <SuccessPanel>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill={colors.successGreen} />
                <path
                  d="M5 8l2 2 4-4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                Application <strong>{applicationName}</strong> created
                successfully.
              </span>
            </div>
          </SuccessPanel>

          {/* Detail page header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.textPrimary,
                margin: 0,
              }}>
              {applicationName}
            </h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  backgroundColor: '#ffffff',
                  color: colors.textPrimary,
                  border: `1px solid ${colors.borderMedium}`,
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: fonts.base,
                }}>
                Edit
              </button>
              <button
                style={{
                  backgroundColor: '#ffffff',
                  color: '#d13212',
                  border: `1px solid ${colors.borderMedium}`,
                  borderRadius: '4px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: fonts.base,
                }}>
                Delete
              </button>
              <button
                onClick={() => {
                  window.location.href = '/#/onboarding-wizard';
                }}
                style={{
                  backgroundColor: colors.awsOrange,
                  color: '#0f1b2d',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: fonts.base,
                }}>
                Get started
              </button>
            </div>
          </div>

          {/* Details card */}
          <section
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '4px',
              padding: '24px',
              marginBottom: '20px',
            }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: colors.textPrimary,
                margin: '0 0 20px 0',
              }}>
              Application details
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px 48px',
              }}>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textMuted,
                    marginBottom: '4px',
                  }}>
                  Application name
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: colors.textPrimary,
                  }}>
                  {applicationName}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textMuted,
                    marginBottom: '4px',
                  }}>
                  Status
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: colors.successGreen,
                    fontWeight: 600,
                  }}>
                  Active
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textMuted,
                    marginBottom: '4px',
                  }}>
                  Created
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: colors.textPrimary,
                  }}>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.textMuted,
                    marginBottom: '4px',
                  }}>
                  Region
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: colors.textPrimary,
                  }}>
                  US East (N. Virginia)
                </div>
              </div>
            </div>
          </section>

          {/* Resources card */}
          <section
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: '4px',
              padding: '24px',
            }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: colors.textPrimary,
                margin: '0 0 16px 0',
              }}>
              Provisioned resources
            </h2>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                fontFamily: fonts.base,
              }}>
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${colors.borderLight}`,
                  }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontWeight: 400,
                      color: colors.textSecondary,
                      width: '30%',
                    }}>
                    Resource type
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontWeight: 400,
                      color: colors.textSecondary,
                      width: '40%',
                    }}>
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontWeight: 400,
                      color: colors.textSecondary,
                    }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                  <td style={{ padding: '10px 12px', color: colors.textPrimary }}>
                    Serverless collection
                  </td>
                  <td style={{ padding: '10px 12px', color: colors.linkBlue }}>
                    collection-1783380218887
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: colors.successGreen,
                    }}>
                    Active
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                  <td style={{ padding: '10px 12px', color: colors.textPrimary }}>
                    OpenSearch UI
                  </td>
                  <td style={{ padding: '10px 12px', color: colors.linkBlue }}>
                    opensearchui-1783380218887
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: colors.successGreen,
                    }}>
                    Active
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.pageBg,
        fontFamily: fonts.base,
      }}>
      <ConsoleTopNav />

      {/* Page content */}
      <main style={{ padding: '20px 32px', maxWidth: '1200px' }}>
        <Breadcrumb
          items={[
            'Amazon OpenSearch Service',
            'Applications',
            'Create application',
          ]}
        />

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 8px 0',
          }}>
          Create observability use case
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: '0 0 24px 0',
          }}>
          Create an OpenSearch UI application to visualize and explore your
          observability data with a unified experience.
        </p>

        {/* Form card */}
        <section
          style={{
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.borderLight}`,
            borderRadius: '4px',
            padding: '24px',
            marginBottom: '20px',
          }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.textPrimary,
              margin: '0 0 16px 0',
            }}>
            Application settings
          </h2>

          <FormField
            label="Application name"
            required
            helpText="A unique name to identify this application. Use lowercase letters, numbers, and hyphens.">
            <TextInput
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              placeholder="my-observability-app"
              disabled={isCreated}
            />
          </FormField>

          {/* Configuration defaults */}
          <div style={{ marginBottom: '0' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: colors.textPrimary,
                margin: '0 0 4px 0',
              }}>
              View configuration defaults
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: colors.textSecondary,
                margin: '0 0 16px 0',
              }}>
              We'll provision the following resources for an additional cost.
              Customize your selection by switching to Manual setup.
            </p>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                fontFamily: fonts.base,
              }}>
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${colors.borderLight}`,
                  }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontWeight: 400,
                      color: colors.textSecondary,
                      width: '40%',
                    }}>
                    Resource type
                    <span style={{ marginLeft: '4px', fontSize: '10px' }}>▽</span>
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontWeight: 400,
                      color: colors.textSecondary,
                    }}>
                    Value{' '}
                    <span
                      style={{
                        marginLeft: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}>
                      ✎
                    </span>
                    <span style={{ float: 'right', fontSize: '10px' }}>▽</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: colors.textPrimary,
                    }}>
                    Serverless collection
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: colors.textPrimary,
                    }}>
                    collection-1783380218887
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: colors.textPrimary,
                    }}>
                    OpenSearch UI
                  </td>
                  <td
                    style={{
                      padding: '10px 12px',
                      color: colors.textPrimary,
                    }}>
                    opensearchui-1783380218887
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </section>

        {/* Action bar */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
          <button
            onClick={() => {
              window.location.href = '/#/marketing';
            }}
            style={{
              backgroundColor: '#ffffff',
              color: colors.textPrimary,
              border: `1px solid ${colors.borderMedium}`,
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 400,
              cursor: 'pointer',
              fontFamily: fonts.base,
            }}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreated || isCreating || !applicationName.trim()}
            style={{
              backgroundColor:
                isCreated || isCreating ? '#aab7b8' : colors.awsOrange,
              color: '#0f1b2d',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 700,
              cursor:
                isCreated || isCreating ? 'not-allowed' : 'pointer',
              fontFamily: fonts.base,
              opacity: isCreated || isCreating ? 0.7 : 1,
            }}>
            {isCreating
              ? 'Creating...'
              : isCreated
              ? 'Created'
              : 'Create application'}
          </button>
        </div>

        {isCreating && (
          <p
            style={{
              fontSize: '13px',
              color: colors.textMuted,
              marginTop: '12px',
            }}>
            Provisioning your application and serverless collection…
          </p>
        )}
      </main>
    </div>
  );
};

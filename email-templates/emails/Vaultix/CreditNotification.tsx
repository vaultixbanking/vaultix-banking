import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Heading,
  Section,
  Hr,
  Row,
  Column,
  Button,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface CreditNotificationProps {
  username?: string;
  amount?: string;
  currency?: string;
  newBalance?: string;
  description?: string;
  transactionDate?: string;
}

const CreditNotification: React.FC<CreditNotificationProps> = ({
  username = 'John',
  amount = '5,000.00',
  currency = 'USD',
  newBalance = '12,500.00',
  description = 'Account Funding',
  transactionDate = 'Jan 15, 2025 at 2:30 PM',
}) => {
  return (
    <Html>
      <Head />
      <Preview>You received {currency} {amount} in your Vaultix account</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="max-w-xl mx-auto py-10 px-4">
            <Section className="bg-white rounded-2xl overflow-hidden shadow-lg">
              {/* Header */}
              <Section className="bg-blue-700 py-8 px-8 text-center">
                <Section className="mx-auto mb-3">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </Section>
                <Text className="text-white text-xl font-bold m-0">Vaultix</Text>
              </Section>

              {/* Body */}
              <Section className="px-8 pt-8 pb-4">
                {/* Credit Icon */}
                <Section className="text-center mb-6">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto' }}>
                    <circle cx="28" cy="28" r="28" fill="#16a34a" />
                    <line x1="28" y1="18" x2="28" y2="38" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                    <line x1="18" y1="28" x2="38" y2="28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </Section>

                <Heading className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Money Received!
                </Heading>
                <Text className="text-gray-500 text-center text-base mb-6">
                  Hi {username}, your Vaultix account has been credited.
                </Text>

                {/* Amount Box */}
                <Section className="bg-green-50 border border-green-200 rounded-xl py-5 px-6 mb-6 text-center">
                  <Text className="text-green-800 text-xs font-semibold uppercase tracking-wide mb-1">
                    Amount Credited
                  </Text>
                  <Text className="text-green-600 text-3xl font-bold m-0">
                    +{currency} {amount}
                  </Text>
                </Section>

                {/* Transaction Details */}
                <Section className="mb-4">
                  <Row className="border-b border-gray-100 py-3">
                    <Column>
                      <Text className="text-gray-400 text-sm m-0">Description</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-gray-900 text-sm font-semibold m-0">{description}</Text>
                    </Column>
                  </Row>
                  <Row className="border-b border-gray-100 py-3">
                    <Column>
                      <Text className="text-gray-400 text-sm m-0">Date &amp; Time</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-gray-900 text-sm font-semibold m-0">{transactionDate}</Text>
                    </Column>
                  </Row>
                  <Row className="py-3">
                    <Column>
                      <Text className="text-gray-400 text-sm m-0">New Balance</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-green-600 text-base font-bold m-0">{currency} {newBalance}</Text>
                    </Column>
                  </Row>
                </Section>

                {/* Alert */}
                <Section className="bg-green-50 border border-green-200 rounded-xl py-4 px-5 mb-6">
                  <Text className="text-green-800 text-sm m-0">
                    ✅ This credit has been applied to your account and is available for use immediately.
                  </Text>
                </Section>

                <Section className="text-center mb-6">
                  <Button
                    href="https://vaultixbank.org/login"
                    className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-base"
                  >
                    View Account
                  </Button>
                </Section>

                <Hr className="border-gray-200 my-4" />
                <Text className="text-gray-400 text-xs text-center">
                  If you don't recognize this transaction, please{' '}
                  <Link href="https://vaultixbank.org/support" className="text-blue-600 underline">contact support</Link>
                  {' '}immediately.
                </Text>
              </Section>

              {/* Footer */}
              <Section className="text-center px-8 py-6 border-t border-gray-100">
                <Text className="text-gray-400 text-xs mb-1">&copy; 2025 Vaultix Bank. All rights reserved.</Text>
                <Text className="text-gray-300 text-xs mb-2">123 Financial District, New York, NY 10001</Text>
                <Text className="text-gray-300 text-xs m-0">
                  <Link href="https://vaultixbank.org/privacy" className="text-gray-400 underline">Privacy Policy</Link>
                  {' '}&bull;{' '}
                  <Link href="https://vaultixbank.org/terms" className="text-gray-400 underline">Terms of Service</Link>
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default CreditNotification;

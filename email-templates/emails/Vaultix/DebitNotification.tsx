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

interface DebitNotificationProps {
  username?: string;
  amount?: string;
  currency?: string;
  newBalance?: string;
  transactionType?: string;
  transactionId?: string;
  transactionDate?: string;
}

const DebitNotification: React.FC<DebitNotificationProps> = ({
  username = 'John',
  amount = '1,200.00',
  currency = 'USD',
  newBalance = '11,300.00',
  transactionType = 'Wire Transfer',
  transactionId = 'WD-1704067200-4521',
  transactionDate = 'Jan 15, 2025 at 3:45 PM',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Debit of {currency} {amount} from your Vaultix account</Preview>
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
                {/* Debit Icon */}
                <Section className="text-center mb-6">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto' }}>
                    <circle cx="28" cy="28" r="28" fill="#dc2626" />
                    <line x1="18" y1="28" x2="38" y2="28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </Section>

                <Heading className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Money Sent
                </Heading>
                <Text className="text-gray-500 text-center text-base mb-6">
                  Hi {username}, a debit transaction has been processed on your Vaultix account.
                </Text>

                {/* Amount Box */}
                <Section className="bg-red-50 border border-red-200 rounded-xl py-5 px-6 mb-6 text-center">
                  <Text className="text-red-800 text-xs font-semibold uppercase tracking-wide mb-1">
                    Amount Debited
                  </Text>
                  <Text className="text-red-600 text-3xl font-bold m-0">
                    -{currency} {amount}
                  </Text>
                </Section>

                {/* Transaction Details */}
                <Section className="mb-4">
                  <Row className="border-b border-gray-100 py-3">
                    <Column>
                      <Text className="text-gray-400 text-sm m-0">Transaction Type</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-gray-900 text-sm font-semibold m-0">{transactionType}</Text>
                    </Column>
                  </Row>
                  <Row className="border-b border-gray-100 py-3">
                    <Column>
                      <Text className="text-gray-400 text-sm m-0">Transaction ID</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-gray-900 text-xs font-mono font-semibold m-0">{transactionId}</Text>
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
                      <Text className="text-gray-400 text-sm m-0">Remaining Balance</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-gray-900 text-base font-bold m-0">{currency} {newBalance}</Text>
                    </Column>
                  </Row>
                </Section>

                {/* Alert */}
                <Section className="bg-red-50 border border-red-200 rounded-xl py-4 px-5 mb-6">
                  <Text className="text-red-800 text-sm m-0">
                    🔔 This debit has been processed from your account.
                  </Text>
                </Section>

                <Section className="text-center mb-6">
                  <Button
                    href="https://vaultixbank.org/login"
                    className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-base"
                  >
                    View Transaction
                  </Button>
                </Section>

                <Hr className="border-gray-200 my-4" />
                <Text className="text-gray-400 text-xs text-center">
                  If you didn't authorize this transaction, please{' '}
                  <Link href="https://vaultixbank.org/support" className="text-red-600 font-semibold underline">contact support immediately</Link>.
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

export default DebitNotification;

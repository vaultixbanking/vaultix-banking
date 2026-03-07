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
        <Body className="bg-slate-100 font-sans">
          <Container className="max-w-[560px] mx-auto py-10 px-4">
            <Section className="bg-white rounded-xl overflow-hidden border border-slate-200">
              {/* Header */}
              <Section className="bg-slate-900 py-7 px-8 text-center">
                <Text className="text-white text-xl font-bold tracking-tight m-0">VAULTIX</Text>
              </Section>

              {/* Body */}
              <Section className="px-8 pt-8 pb-6">
                <Section className="text-center mb-6">
                  <Text style={{ fontSize: 24, lineHeight: '56px', width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'inline-block', margin: '0 auto' }}>💰</Text>
                </Section>

                <Heading className="text-[22px] font-bold text-center text-slate-900 mb-2">
                  Money Received
                </Heading>
                <Text className="text-slate-500 text-center text-[15px] mb-6">
                  Hi {username}, your Vaultix account has been credited.
                </Text>

                {/* Amount Box */}
                <Section className="bg-green-50 border border-green-200 rounded-xl py-5 px-6 mb-5 text-center">
                  <Text className="text-green-900 text-[11px] font-semibold uppercase tracking-wider mb-1 m-0">
                    Amount Credited
                  </Text>
                  <Text className="text-green-600 text-[28px] font-bold m-0">
                    +{currency} {amount}
                  </Text>
                </Section>

                {/* Transaction Details */}
                <Section className="mb-5">
                  <Row className="border-b border-slate-100 py-3">
                    <Column>
                      <Text className="text-slate-500 text-sm font-medium m-0">Description</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-slate-900 text-sm font-semibold m-0">{description}</Text>
                    </Column>
                  </Row>
                  <Row className="border-b border-slate-100 py-3">
                    <Column>
                      <Text className="text-slate-500 text-sm font-medium m-0">Date &amp; Time</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-slate-900 text-sm font-semibold m-0">{transactionDate}</Text>
                    </Column>
                  </Row>
                  <Row className="py-3">
                    <Column>
                      <Text className="text-slate-500 text-sm font-medium m-0">New Balance</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-green-600 text-sm font-bold m-0">{currency} {newBalance}</Text>
                    </Column>
                  </Row>
                </Section>

                {/* Alert */}
                <Section className="bg-green-50 border border-green-200 rounded-lg py-3.5 px-4 mb-6">
                  <Text className="text-green-900 text-[13px] m-0">
                    ✅ This credit is available in your account immediately.
                  </Text>
                </Section>

                <Section className="text-center mb-6">
                  <Button
                    href="https://vaultixbank.org/login"
                    className="bg-green-600 text-white px-7 py-3 rounded-lg font-semibold text-sm"
                  >
                    View Account
                  </Button>
                </Section>

                <Hr className="border-slate-200 my-4" />
                <Text className="text-slate-400 text-xs text-center">
                  Didn't expect this?{' '}
                  <Link href="https://vaultixbank.org/support" className="text-slate-900 font-semibold">Contact support</Link>
                </Text>
              </Section>

              {/* Footer */}
              <Section className="text-center px-8 py-5 border-t border-slate-200">
                <Text className="text-slate-400 text-[11px] m-0">&copy; 2025 Vaultix Bank. All rights reserved.</Text>
                <Text className="text-slate-400 text-[11px] mt-1.5 m-0">
                  <Link href="https://vaultixbank.org/privacy" className="text-slate-400 underline">Privacy</Link>
                  {' '}&middot;{' '}
                  <Link href="https://vaultixbank.org/terms" className="text-slate-400 underline">Terms</Link>
                  {' '}&middot;{' '}
                  <Link href="https://vaultixbank.org/support" className="text-slate-400 underline">Support</Link>
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

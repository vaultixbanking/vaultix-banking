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
                  <Text style={{ fontSize: 24, lineHeight: '56px', width: 56, height: 56, borderRadius: '50%', backgroundColor: '#fef2f2', display: 'inline-block', margin: '0 auto' }}>💸</Text>
                </Section>

                <Heading className="text-[22px] font-bold text-center text-slate-900 mb-2">
                  Money Sent
                </Heading>
                <Text className="text-slate-500 text-center text-[15px] mb-6">
                  Hi {username}, a transaction has been processed on your account.
                </Text>

                {/* Amount Box */}
                <Section className="bg-red-50 border border-red-200 rounded-xl py-5 px-6 mb-5 text-center">
                  <Text className="text-red-900 text-[11px] font-semibold uppercase tracking-wider mb-1 m-0">
                    Amount Debited
                  </Text>
                  <Text className="text-red-600 text-[28px] font-bold m-0">
                    -{currency} {amount}
                  </Text>
                </Section>

                {/* Transaction Details */}
                <Section className="mb-5">
                  <Row className="border-b border-slate-100 py-3">
                    <Column>
                      <Text className="text-slate-500 text-sm font-medium m-0">Transaction ID</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-slate-900 text-xs font-mono font-semibold m-0">{transactionId}</Text>
                    </Column>
                  </Row>
                  <Row className="border-b border-slate-100 py-3">
                    <Column>
                      <Text className="text-slate-500 text-sm font-medium m-0">Type</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-slate-900 text-sm font-semibold m-0">{transactionType}</Text>
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
                      <Text className="text-slate-500 text-sm font-medium m-0">Remaining Balance</Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-slate-900 text-sm font-bold m-0">{currency} {newBalance}</Text>
                    </Column>
                  </Row>
                </Section>

                {/* Alert */}
                <Section className="bg-red-50 border border-red-200 rounded-lg py-3.5 px-4 mb-6">
                  <Text className="text-red-900 text-[13px] m-0">
                    🔔 This debit has been processed from your account.
                  </Text>
                </Section>

                <Section className="text-center mb-6">
                  <Button
                    href="https://vaultixbank.org/login"
                    className="bg-red-600 text-white px-7 py-3 rounded-lg font-semibold text-sm"
                  >
                    View Transaction
                  </Button>
                </Section>

                <Hr className="border-slate-200 my-4" />
                <Text className="text-slate-400 text-xs text-center">
                  Didn't authorize this?{' '}
                  <Link href="https://vaultixbank.org/support" className="text-red-600 font-semibold">Contact support immediately</Link>
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

export default DebitNotification;

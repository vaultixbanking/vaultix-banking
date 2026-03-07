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

interface WelcomeEmailProps {
  username: string;
  accountNumber?: string;
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  username = 'there',
  accountNumber = '8881234567',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Vaultix, {username}! Your account is ready.</Preview>
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
                  <Text style={{ fontSize: 24, lineHeight: '56px', width: 56, height: 56, borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'inline-block', margin: '0 auto' }}>✅</Text>
                </Section>

                <Heading className="text-[22px] font-bold text-center text-slate-900 mb-2">
                  Welcome to Vaultix, {username}!
                </Heading>
                <Text className="text-slate-500 text-center text-[15px] leading-relaxed mb-6">
                  Your email has been verified and your secure banking account is now active.
                </Text>

                {/* Account Number Box */}
                <Section className="bg-slate-50 border border-slate-200 rounded-xl py-5 px-6 mb-6 text-center">
                  <Text className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1 m-0">
                    Your Account Number
                  </Text>
                  <Text className="text-slate-900 text-2xl font-bold font-mono m-0">
                    {accountNumber}
                  </Text>
                </Section>

                {/* Features */}
                <Row className="mb-6">
                  <Column className="text-center px-1">
                    <Section className="bg-slate-50 border border-slate-200 rounded-lg py-3.5 px-2.5">
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>🔒</Text>
                      <Text className="text-slate-900 text-xs font-semibold m-0">Secure Banking</Text>
                      <Text className="text-slate-400 text-[11px] m-0">256-bit encryption</Text>
                    </Section>
                  </Column>
                  <Column className="text-center px-1">
                    <Section className="bg-slate-50 border border-slate-200 rounded-lg py-3.5 px-2.5">
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>🕐</Text>
                      <Text className="text-slate-900 text-xs font-semibold m-0">24/7 Access</Text>
                      <Text className="text-slate-400 text-[11px] m-0">Bank anytime</Text>
                    </Section>
                  </Column>
                  <Column className="text-center px-1">
                    <Section className="bg-slate-50 border border-slate-200 rounded-lg py-3.5 px-2.5">
                      <Text style={{ fontSize: 20, marginBottom: 4 }}>🛡️</Text>
                      <Text className="text-slate-900 text-xs font-semibold m-0">FDIC Insured</Text>
                      <Text className="text-slate-400 text-[11px] m-0">Up to $250,000</Text>
                    </Section>
                  </Column>
                </Row>

                {/* CTA */}
                <Section className="text-center mb-7">
                  <Button
                    href="https://vaultixbank.org/login"
                    className="bg-slate-900 text-white px-7 py-3 rounded-lg font-semibold text-sm"
                  >
                    Go to Dashboard
                  </Button>
                </Section>

                <Hr className="border-slate-200 my-6" />

                {/* Next Steps */}
                <Text className="text-slate-900 text-base font-semibold mb-4 m-0">Getting Started</Text>

                <Row className="mb-3.5">
                  <Column className="w-8">
                    <Text className="bg-slate-900 text-white text-xs font-bold w-6 h-6 leading-6 text-center rounded-full m-0">1</Text>
                  </Column>
                  <Column>
                    <Text className="text-slate-900 font-semibold text-sm m-0">Complete your profile</Text>
                    <Text className="text-slate-500 text-[13px] mt-0.5 m-0">Add preferences and security settings</Text>
                  </Column>
                </Row>
                <Row className="mb-3.5">
                  <Column className="w-8">
                    <Text className="bg-slate-900 text-white text-xs font-bold w-6 h-6 leading-6 text-center rounded-full m-0">2</Text>
                  </Column>
                  <Column>
                    <Text className="text-slate-900 font-semibold text-sm m-0">Fund your account</Text>
                    <Text className="text-slate-500 text-[13px] mt-0.5 m-0">Make your first deposit and start banking</Text>
                  </Column>
                </Row>
                <Row className="mb-3">
                  <Column className="w-8">
                    <Text className="bg-slate-900 text-white text-xs font-bold w-6 h-6 leading-6 text-center rounded-full m-0">3</Text>
                  </Column>
                  <Column>
                    <Text className="text-slate-900 font-semibold text-sm m-0">Send &amp; receive money</Text>
                    <Text className="text-slate-500 text-[13px] mt-0.5 m-0">Enjoy fast, secure transfers worldwide</Text>
                  </Column>
                </Row>

                {/* Support */}
                <Section className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-6">
                  <Text className="text-slate-900 font-semibold text-[13px] mb-1 m-0">Need help?</Text>
                  <Text className="text-slate-500 text-xs m-0">
                    Our support team is available 24/7 —{' '}
                    <Link href="https://vaultixbank.org/support" className="text-slate-900 font-semibold no-underline">
                      Contact Support &rarr;
                    </Link>
                  </Text>
                </Section>
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

export default WelcomeEmail;
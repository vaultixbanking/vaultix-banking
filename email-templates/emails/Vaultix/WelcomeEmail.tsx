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
  Button
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
                {/* Check Icon */}
                <Section className="text-center mb-6">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto' }}>
                    <circle cx="24" cy="24" r="24" fill="#2563eb" />
                    <polyline points="16,24 22,30 32,18" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Section>

                <Heading className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Welcome to Vaultix, {username}! 🎉
                </Heading>
                <Text className="text-gray-500 text-center text-base mb-6 leading-relaxed">
                  Your email has been verified and your secure banking account is now fully active. We're thrilled to have you on board!
                </Text>

                {/* Account Number Box */}
                <Section className="bg-blue-50 border border-blue-200 rounded-xl py-5 px-6 mb-6 text-center">
                  <Text className="text-blue-800 text-xs font-semibold uppercase tracking-wide mb-1">
                    Your Account Number
                  </Text>
                  <Text className="text-blue-900 text-2xl font-bold font-mono m-0">
                    {accountNumber}
                  </Text>
                </Section>

                {/* Features */}
                <Row className="mb-6">
                  <Column className="text-center px-2">
                    <Section className="bg-gray-50 border border-gray-200 rounded-xl py-4 px-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ margin: '0 auto 8px' }}>
                        <rect x="1" y="4" width="22" height="16" rx="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <Text className="text-gray-900 text-xs font-semibold m-0">Secure Banking</Text>
                      <Text className="text-gray-400 text-xs m-0">256-bit encryption</Text>
                    </Section>
                  </Column>
                  <Column className="text-center px-2">
                    <Section className="bg-gray-50 border border-gray-200 rounded-xl py-4 px-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ margin: '0 auto 8px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <Text className="text-gray-900 text-xs font-semibold m-0">24/7 Access</Text>
                      <Text className="text-gray-400 text-xs m-0">Bank anytime</Text>
                    </Section>
                  </Column>
                  <Column className="text-center px-2">
                    <Section className="bg-gray-50 border border-gray-200 rounded-xl py-4 px-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ margin: '0 auto 8px' }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <Text className="text-gray-900 text-xs font-semibold m-0">FDIC Insured</Text>
                      <Text className="text-gray-400 text-xs m-0">Up to $250,000</Text>
                    </Section>
                  </Column>
                </Row>

                {/* CTA */}
                <Section className="text-center mb-6">
                  <Button
                    href="https://vaultixbank.org/login"
                    className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-base"
                  >
                    Go to Dashboard
                  </Button>
                </Section>

                <Hr className="border-gray-200 my-6" />

                {/* Next Steps */}
                <Heading className="text-lg font-semibold text-gray-900 mb-4">
                  What's Next?
                </Heading>

                <Row className="mb-3">
                  <Column className="w-8">
                    <Text className="bg-blue-700 text-white text-xs font-bold w-6 h-6 leading-6 text-center rounded-full m-0">1</Text>
                  </Column>
                  <Column>
                    <Text className="text-gray-900 font-medium text-sm m-0">Complete your profile</Text>
                    <Text className="text-gray-400 text-xs m-0">Add your preferences and security settings</Text>
                  </Column>
                </Row>
                <Row className="mb-3">
                  <Column className="w-8">
                    <Text className="bg-blue-700 text-white text-xs font-bold w-6 h-6 leading-6 text-center rounded-full m-0">2</Text>
                  </Column>
                  <Column>
                    <Text className="text-gray-900 font-medium text-sm m-0">Fund your account</Text>
                    <Text className="text-gray-400 text-xs m-0">Make your first deposit and start growing</Text>
                  </Column>
                </Row>
                <Row className="mb-3">
                  <Column className="w-8">
                    <Text className="bg-blue-700 text-white text-xs font-bold w-6 h-6 leading-6 text-center rounded-full m-0">3</Text>
                  </Column>
                  <Column>
                    <Text className="text-gray-900 font-medium text-sm m-0">Send &amp; receive money</Text>
                    <Text className="text-gray-400 text-xs m-0">Enjoy fast, secure transfers worldwide</Text>
                  </Column>
                </Row>

                {/* Support */}
                <Section className="bg-gray-50 rounded-xl p-5 mt-6">
                  <Text className="text-gray-900 font-medium text-sm mb-1">Need help getting started?</Text>
                  <Text className="text-gray-500 text-xs m-0">
                    Our support team is here 24/7.{' '}
                    <Link href="https://vaultixbank.org/support" className="text-blue-600 font-semibold underline">
                      Contact Support &rarr;
                    </Link>
                  </Text>
                </Section>
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

export default WelcomeEmail;
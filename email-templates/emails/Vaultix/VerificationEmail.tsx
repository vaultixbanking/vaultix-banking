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
  Button,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface VerificationEmailProps {
  username?: string;
  verificationLink?: string;
}

const VerificationEmail: React.FC<VerificationEmailProps> = ({
  username = 'there',
  verificationLink = 'https://vaultixbank.org/api/auth/verify-email/sample-token',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your Vaultix account email address</Preview>
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
                <Heading className="text-2xl font-bold text-center text-gray-900 mb-2">
                  Verify Your Email
                </Heading>
                <Text className="text-gray-500 text-center text-base leading-relaxed mb-8">
                  Hi {username}, welcome to Vaultix! Please verify your email address to activate your account.
                </Text>

                <Section className="text-center mb-8">
                  <Button
                    href={verificationLink}
                    className="bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-base"
                  >
                    Verify Email Address
                  </Button>
                </Section>

                <Section className="border-t border-gray-200 pt-6">
                  <Text className="text-gray-400 text-xs text-center leading-relaxed">
                    This link expires in 24 hours. If you didn't create a Vaultix account, you can safely ignore this email.
                  </Text>
                  <Text className="text-gray-300 text-xs text-center break-all mt-4">
                    {verificationLink}
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

export default VerificationEmail;

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
                  <Text style={{ fontSize: 24, lineHeight: '56px', width: 56, height: 56, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'inline-block', margin: '0 auto' }}>✉️</Text>
                </Section>

                <Heading className="text-[22px] font-bold text-center text-slate-900 mb-2">
                  Verify Your Email
                </Heading>
                <Text className="text-slate-500 text-center text-[15px] leading-relaxed mb-6">
                  Hi {username}, thanks for signing up with Vaultix. Please verify your email address to activate your account.
                </Text>

                <Section className="text-center my-7">
                  <Button
                    href={verificationLink}
                    className="bg-slate-900 text-white px-7 py-3 rounded-lg font-semibold text-sm"
                  >
                    Verify Email Address
                  </Button>
                </Section>

                <Hr className="border-slate-200 my-6" />

                <Text className="text-slate-400 text-xs text-center leading-relaxed">
                  This link expires in 24 hours. If you didn't create a Vaultix account, you can safely ignore this email.
                </Text>
                <Text className="text-slate-300 text-[11px] text-center break-all mt-3 font-mono">
                  {verificationLink}
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

export default VerificationEmail;

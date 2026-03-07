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
  Img,
  Row,
  Column,
  Button
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface WelcomeEmailProps {
  username: string;
  accountNumber?: string;
  verificationLink?: string;
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  username = 'there',
  accountNumber = '****1234',
  verificationLink = 'https://vaultix.com/verify'
}) => {
  const previewText = `Welcome to Vaultix - Your financial journey begins here`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="max-w-2xl mx-auto p-8">
            {/* Header with Logo */}
            <Section className="text-center mb-8">
              <Img
                src="https://placehold.co/150x50/2563eb/white?text=Vaultix"
                alt="Vaultix"
                width="150"
                height="50"
                className="mx-auto"
              />
            </Section>

            {/* Main Content Card */}
            <Section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              {/* Hero Icon */}
              <Section className="text-center mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 w-16 h-16 rounded-full mx-auto flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M20 12H4M12 4v16" />
                  </svg>
                </div>
              </Section>

              {/* Welcome Heading */}
              <Heading className="text-3xl font-bold text-center mb-4 text-gray-900">
                Welcome to Vaultix, {username}! 🎉
              </Heading>

              <Text className="text-gray-600 text-center mb-8 text-lg">
                Your secure financial journey begins here. We're thrilled to have you on board!
              </Text>

              {/* Account Information */}
              <Section className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                <Row>
                  <Column align="center">
                    <Text className="text-blue-800 font-medium mb-2">Your Account Number</Text>
                    <Text className="text-2xl font-bold text-blue-900 font-mono">
                      {accountNumber}
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* Features Grid */}
              <Section className="mb-8">
                <Row className="mb-4">
                  <Column className="pr-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      <Text className="font-semibold text-gray-900">Secure Banking</Text>
                      <Text className="text-sm text-gray-600">256-bit encryption</Text>
                    </div>
                  </Column>
                  <Column className="px-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <Text className="font-semibold text-gray-900">24/7 Access</Text>
                      <Text className="text-sm text-gray-600">Bank anytime, anywhere</Text>
                    </div>
                  </Column>
                  <Column className="pl-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <Text className="font-semibold text-gray-900">FDIC Insured</Text>
                      <Text className="text-sm text-gray-600">Up to $250,000</Text>
                    </div>
                  </Column>
                </Row>
              </Section>

              {/* Verification Button */}
              <Section className="text-center mb-8">
                <Button
                  href={verificationLink}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg"
                >
                  Verify Your Email
                </Button>
              </Section>

              <Hr className="border-gray-200 my-6" />

              {/* Next Steps */}
              <Section>
                <Heading className="text-xl font-semibold text-gray-900 mb-4">
                  What's Next?
                </Heading>
                
                <Row className="mb-4">
                  <Column className="w-8 align-top">
                    <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  </Column>
                  <Column className="pl-2">
                    <Text className="text-gray-800 font-medium">Complete your profile</Text>
                    <Text className="text-gray-600 text-sm">Add your preferences and security settings</Text>
                  </Column>
                </Row>

                <Row className="mb-4">
                  <Column className="w-8 align-top">
                    <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  </Column>
                  <Column className="pl-2">
                    <Text className="text-gray-800 font-medium">Set up mobile app</Text>
                    <Text className="text-gray-600 text-sm">Download our app for on-the-go banking</Text>
                  </Column>
                </Row>

                <Row className="mb-4">
                  <Column className="w-8 align-top">
                    <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  </Column>
                  <Column className="pl-2">
                    <Text className="text-gray-800 font-medium">Make your first deposit</Text>
                    <Text className="text-gray-600 text-sm">Start earning interest today</Text>
                  </Column>
                </Row>
              </Section>

              {/* Support Section */}
              <Section className="bg-gray-50 rounded-xl p-6 mt-6">
                <Text className="text-gray-800 font-medium mb-2">Need help getting started?</Text>
                <Text className="text-gray-600 text-sm mb-3">
                  Our support team is here 24/7 to assist you with any questions.
                </Text>
                <Link 
                  href="https://vaultix.com/support"
                  className="text-blue-600 font-medium text-sm underline"
                >
                  Contact Support →
                </Link>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="text-center mt-8">
              <Text className="text-sm text-gray-500 mb-3">
                © 2025 Vaultix. All rights reserved.
              </Text>
              <Text className="text-xs text-gray-400">
                123 Financial District, New York, NY 10001
              </Text>
              <Text className="text-xs text-gray-400 mt-2">
                <Link href="https://vaultix.com/privacy" className="text-gray-400 underline mx-2">
                  Privacy Policy
                </Link>
                •
                <Link href="https://vaultix.com/terms" className="text-gray-400 underline mx-2">
                  Terms of Service
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
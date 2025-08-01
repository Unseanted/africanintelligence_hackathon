import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, List, Text, TextInput } from 'react-native-paper';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useTourLMS } from '../../app/contexts/TourLMSContext';

interface SupportSectionProps {
  expanded: boolean;
  onToggle: () => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showContact: boolean;
  setShowContact: (show: boolean) => void;
  showPrivacy: boolean;
  setShowPrivacy: (show: boolean) => void;
  showTerms: boolean;
  setShowTerms: (show: boolean) => void;
  showApiDocs: boolean;
  setShowApiDocs: (show: boolean) => void;
  contactData: { subject: string; message: string };
  setContactData: (data: { subject: string; message: string }) => void;
  onSendContact: () => void;
}

const SupportSection: React.FC<SupportSectionProps> = ({
  expanded,
  onToggle,
  showHelp,
  setShowHelp,
  showContact,
  setShowContact,
  showPrivacy,
  setShowPrivacy,
  showTerms,
  setShowTerms,
  showApiDocs,
  setShowApiDocs,
  contactData,
  setContactData,
  onSendContact,
}) => {
  const { colors } = useTheme();
  const { user } = useTourLMS();

  const handleOpenApiDocs = () => {
    Linking.openURL('https://api.tourlms.com/docs');
  };

  const handleOpenCommunity = () => {
    Linking.openURL('https://community.tourlms.com');
  };

  const handleOpenStatusPage = () => {
    Linking.openURL('https://status.tourlms.com');
  };

  const styles = StyleSheet.create({
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    settingsCard: {
      borderWidth: 1,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
    divider: {
      marginVertical: 4,
      backgroundColor: colors.borderColor,
    },
    contentContainer: {
      padding: 16,
    },
    titleText: {
      color: colors.text,
      marginBottom: 16,
      fontSize: 16,
      fontWeight: '600',
    },
    subtitleText: {
      color: colors.text,
      marginBottom: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    descriptionText: {
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    listItemText: {
      color: colors.textSecondary,
      marginLeft: 8,
    },
    scrollContainer: {
      maxHeight: 300,
    },
    buttonMargin: {
      marginTop: 16,
    },
    linkText: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    sectionSpacing: {
      marginBottom: 20,
    },
  });

  const faqs = [
    {
      question: "How do I start a course?",
      answer: "Browse available courses in the Courses tab and click 'Enroll' to begin your learning journey. Once enrolled, you can access all course materials and start completing lessons at your own pace."
    },
    {
      question: "How do I earn XP?",
      answer: "You can earn XP by:\n- Completing lessons (+10 XP each)\n- Passing quizzes (+20 XP each)\n- Submitting assignments (+15-50 XP depending on complexity)\n- Participating in discussions (+5 XP per quality post)\n- Maintaining a learning streak"
    },
    {
      question: "What are achievements?",
      answer: "Achievements are special badges that recognize your learning milestones. They come in four tiers:\n\n1. Bronze (basic milestones)\n2. Silver (intermediate accomplishments)\n3. Gold (advanced achievements)\n4. Platinum (exceptional performance)\n\nEach achievement comes with bonus XP and appears on your profile."
    },
    {
      question: "How does the learning streak work?",
      answer: "Your learning streak increases when you complete at least one learning activity each day. Longer streaks unlock special rewards:\n\n- 7-day streak: +10% XP bonus\n- 30-day streak: +25% XP bonus\n- 100-day streak: Exclusive badge and +50% XP bonus"
    },
    {
      question: "Can I download course materials for offline use?",
      answer: "Yes! Most course materials can be downloaded for offline access:\n1. Open the lesson you want to download\n2. Tap the download icon in the top right\n3. Select which resources to download\n\nNote: Some interactive content requires an internet connection."
    }
  ];

  const apiDocsSections = [
    {
      title: "Authentication",
      content: "All API requests require authentication using a Bearer token. Include the following header in your requests:\n\nAuthorization: Bearer {your_access_token}\n\nTokens can be obtained through the OAuth2 flow or generated in your account settings."
    },
    {
      title: "Rate Limits",
      content: "API requests are limited to:\n- 100 requests per minute for free accounts\n- 500 requests per minute for premium accounts\n- 1000 requests per minute for enterprise accounts\n\nIf exceeded, you'll receive a 429 status code. Wait 1 minute before retrying."
    },
    {
      title: "Endpoints",
      content: "Base URL: https://api.tourlms.com/v1\n\nKey endpoints:\n- GET /courses - List all courses\n- GET /users/{id} - Get user profile\n- POST /enrollments - Enroll in a course\n- GET /progress - Get learning progress\n\nAll responses are in JSON format."
    },
    {
      title: "Webhooks",
      content: "Subscribe to real-time events with webhooks. Available events:\n\n- course.completed\n- lesson.started\n- achievement.earned\n- xp.awarded\n\nConfigure webhooks in your developer dashboard."
    },
    {
      title: "SDKs",
      content: "We provide official SDKs for:\n- JavaScript/Node.js\n- Python\n- Java\n- Ruby\n\nSDKs handle authentication, retries, and response parsing automatically."
    }
  ];

  const contactCategories = [
    "Account Issues",
    "Billing Questions",
    "Technical Problems",
    "Course Content",
    "Feature Requests",
    "Other"
  ];

  return (
    <>
      <TouchableOpacity onPress={onToggle}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support & Resources</Text>
          <MaterialCommunityIcons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color={colors.text} 
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <Card style={styles.settingsCard}>
          <Card.Content>
            {/* Help Center Section */}
            <List.Item
              title="Help Center"
              description="Find answers to common questions and tutorials"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="help-circle" color={colors.primary} />}
              onPress={() => setShowHelp(!showHelp)}
            />
            {showHelp && (
              <View style={styles.contentContainer}>
                <Text style={styles.titleText}>Help Resources</Text>
                
                <Text style={styles.subtitleText}>Frequently Asked Questions</Text>
                <List.AccordionGroup>
                  {faqs.map((faq, index) => (
                    <List.Accordion 
                      key={`faq-${index}`}
                      title={faq.question} 
                      id={`faq-${index}`}
                      titleStyle={{ color: colors.text }}
                    >
                      <List.Item
                        title=""
                        description={faq.answer}
                        descriptionNumberOfLines={10}
                        descriptionStyle={styles.descriptionText}
                      />
                    </List.Accordion>
                  ))}
                </List.AccordionGroup>

                <View style={styles.sectionSpacing}>
                  <Text style={styles.subtitleText}>Video Tutorials</Text>
                  <Text style={styles.descriptionText}>
                    Check out our video tutorials for step-by-step guidance:
                  </Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://youtube.com/tourlms')}>
                    <Text style={styles.linkText}>TourLMS YouTube Channel</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.sectionSpacing}>
                  <Text style={styles.subtitleText}>Community Forum</Text>
                  <Text style={styles.descriptionText}>
                    Connect with other learners and get help from the community:
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={handleOpenCommunity}
                    icon="forum"
                    style={styles.buttonMargin}
                  >
                    Visit Community
                  </Button>
                </View>

                <View style={styles.sectionSpacing}>
                  <Text style={styles.subtitleText}>System Status</Text>
                  <Text style={styles.descriptionText}>
                    Check if there are any ongoing outages or maintenance:
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={handleOpenStatusPage}
                    icon="server"
                    style={styles.buttonMargin}
                  >
                    Status Page
                  </Button>
                </View>
              </View>
            )}
            <Divider style={styles.divider} />

            {/* Contact Support Section */}
            <List.Item
              title="Contact Support"
              description="Get in touch with our support team"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="message" color={colors.primary} />}
              onPress={() => setShowContact(!showContact)}
            />
            {showContact && (
              <View style={styles.contentContainer}>
                <Text style={styles.titleText}>Contact Options</Text>
                
                <Text style={styles.subtitleText}>Email Support</Text>
                {user && (
                  <TextInput
                    label="Your Email"
                    value={user.email}
                    mode="outlined"
                    style={{ marginBottom: 12 }}
                    editable={false}
                  />
                )}
                
                <TextInput
                  label="Subject"
                  value={contactData.subject}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  onChangeText={text => setContactData({ ...contactData, subject: text })}
                />

                <TextInput
                  label="Category"
                  value={contactData.subject}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
                  render={props => (
                    <List.Accordion
                      title={contactData.subject || "Select a category"}
                      style={{ paddingHorizontal: 0 }}
                    >
                      {contactCategories.map((category, index) => (
                        <List.Item
                          key={`cat-${index}`}
                          title={category}
                          onPress={() => {
                            setContactData({ ...contactData, subject: category });
                          }}
                        />
                      ))}
                    </List.Accordion>
                  )}
                />

                <TextInput
                  label="Message"
                  value={contactData.message}
                  mode="outlined"
                  multiline
                  numberOfLines={6}
                  style={{ marginBottom: 12 }}
                  onChangeText={text => setContactData({ ...contactData, message: text })}
                />

                <Button 
                  mode="contained" 
                  onPress={onSendContact}
                  style={{ backgroundColor: colors.primary }}
                  icon="send"
                >
                  Send Message
                </Button>

                <View style={[styles.sectionSpacing, { marginTop: 20 }]}>
                  <Text style={styles.subtitleText}>Other Contact Methods</Text>
                  <Text style={styles.descriptionText}>
                    <Text style={{ fontWeight: 'bold' }}>Live Chat:</Text> Available 24/7 in the app
                  </Text>
                  <Text style={styles.descriptionText}>
                    <Text style={{ fontWeight: 'bold' }}>Phone Support:</Text> +1 (800) 123-4567 (9AM-5PM EST)
                  </Text>
                  <Text style={styles.descriptionText}>
                    <Text style={{ fontWeight: 'bold' }}>Emergency:</Text> For urgent account issues, call +1 (800) 987-6543
                  </Text>
                </View>
              </View>
            )}
            <Divider style={styles.divider} />

            {/* Privacy Policy Section */}
            <List.Item
              title="Privacy Policy"
              description="Review our data practices and policies"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="shield-account" color={colors.primary} />}
              onPress={() => setShowPrivacy(!showPrivacy)}
            />
            {showPrivacy && (
              <View style={styles.contentContainer}>
                <ScrollView style={styles.scrollContainer}>
                  <Text style={styles.titleText}>Privacy Policy</Text>
                  <Text style={styles.descriptionText}>
                    Last updated: {new Date().toLocaleDateString()}
                  </Text>

                  <Text style={styles.subtitleText}>1. Information We Collect</Text>
                  <Text style={styles.descriptionText}>
                    We collect several types of information to provide and improve our services:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Account Information: Name, email, profile data
                  </Text>
                  <Text style={styles.listItemText}>
                    • Learning Data: Course progress, quiz scores, interactions
                  </Text>
                  <Text style={styles.listItemText}>
                    • Technical Data: IP address, device information, cookies
                  </Text>
                  <Text style={styles.listItemText}>
                    • Payment Information: Processed securely by our payment partners
                  </Text>

                  <Text style={styles.subtitleText}>2. How We Use Your Data</Text>
                  <Text style={styles.descriptionText}>
                    Your information helps us:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Provide and maintain our services
                  </Text>
                  <Text style={styles.listItemText}>
                    • Personalize your learning experience
                  </Text>
                  <Text style={styles.listItemText}>
                    • Improve our platform and develop new features
                  </Text>
                  <Text style={styles.listItemText}>
                    • Communicate important updates and offers
                  </Text>
                  <Text style={styles.listItemText}>
                    • Ensure platform security and prevent fraud
                  </Text>

                  <Text style={styles.subtitleText}>3. Data Sharing</Text>
                  <Text style={styles.descriptionText}>
                    We only share data when necessary:
                  </Text>
                  <Text style={styles.listItemText}>
                    • With your consent for specific services
                  </Text>
                  <Text style={styles.listItemText}>
                    • With service providers under strict confidentiality
                  </Text>
                  <Text style={styles.listItemText}>
                    • For legal compliance or protection of rights
                  </Text>
                  <Text style={styles.listItemText}>
                    • In business transfers (mergers/acquisitions)
                  </Text>

                  <Text style={styles.subtitleText}>4. Your Rights</Text>
                  <Text style={styles.descriptionText}>
                    You have the right to:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Access, correct, or delete your personal data
                  </Text>
                  <Text style={styles.listItemText}>
                    • Object to or restrict certain processing
                  </Text>
                  <Text style={styles.listItemText}>
                    • Data portability in machine-readable format
                  </Text>
                  <Text style={styles.listItemText}>
                    • Withdraw consent where applicable
                  </Text>

                  <Text style={styles.subtitleText}>5. Data Security</Text>
                  <Text style={styles.descriptionText}>
                    We implement industry-standard measures including:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Encryption of data in transit and at rest
                  </Text>
                  <Text style={styles.listItemText}>
                    • Regular security audits and testing
                  </Text>
                  <Text style={styles.listItemText}>
                    • Access controls and authentication protocols
                  </Text>
                  <Text style={styles.listItemText}>
                    • Employee training on data protection
                  </Text>

                  <Text style={styles.descriptionText}>
                    For the complete policy or to exercise your rights, please contact our Data Protection Officer at dpo@tourlms.com.
                  </Text>
                </ScrollView>
              </View>
            )}
            <Divider style={styles.divider} />

            {/* Terms of Service Section */}
            <List.Item
              title="Terms of Service"
              description="Read our terms and conditions"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="file-document" color={colors.primary} />}
              onPress={() => setShowTerms(!showTerms)}
            />
            {showTerms && (
              <View style={styles.contentContainer}>
                <ScrollView style={styles.scrollContainer}>
                  <Text style={styles.titleText}>Terms of Service</Text>
                  <Text style={styles.descriptionText}>
                    Last updated: {new Date().toLocaleDateString()}
                  </Text>

                  <Text style={styles.subtitleText}>1. Acceptance of Terms</Text>
                  <Text style={styles.descriptionText}>
                    By accessing or using TourLMS, you agree to be bound by these Terms. If you disagree, you may not use our services.
                  </Text>

                  <Text style={styles.subtitleText}>2. Account Responsibilities</Text>
                  <Text style={styles.descriptionText}>
                    You must:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Provide accurate registration information
                  </Text>
                  <Text style={styles.listItemText}>
                    • Maintain account security and confidentiality
                  </Text>
                  <Text style={styles.listItemText}>
                    • Not share accounts or access credentials
                  </Text>
                  <Text style={styles.listItemText}>
                    • Be at least 13 years old (or older in some jurisdictions)
                  </Text>

                  <Text style={styles.subtitleText}>3. User Conduct</Text>
                  <Text style={styles.descriptionText}>
                    You agree not to:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Violate laws or third-party rights
                  </Text>
                  <Text style={styles.listItemText}>
                    • Upload harmful or illegal content
                  </Text>
                  <Text style={styles.listItemText}>
                    • Reverse engineer or hack our systems
                  </Text>
                  <Text style={styles.listItemText}>
                    • Misrepresent your identity or qualifications
                  </Text>
                  <Text style={styles.listItemText}>
                    • Disrupt others' learning experience
                  </Text>

                  <Text style={styles.subtitleText}>4. Intellectual Property</Text>
                  <Text style={styles.descriptionText}>
                    All platform content is protected by copyright. You may:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Access materials for personal learning
                  </Text>
                  <Text style={styles.listItemText}>
                    • Share links to public content
                  </Text>
                  <Text style={styles.descriptionText}>
                    You may not:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Redistribute or resell course materials
                  </Text>
                  <Text style={styles.listItemText}>
                    • Create derivative works without permission
                  </Text>
                  <Text style={styles.listItemText}>
                    • Remove copyright notices
                  </Text>

                  <Text style={styles.subtitleText}>5. Payments and Refunds</Text>
                  <Text style={styles.descriptionText}>
                    • Subscription fees are billed monthly/annually
                  </Text>
                  <Text style={styles.descriptionText}>
                    • Refunds available within 14 days of purchase
                  </Text>
                  <Text style={styles.descriptionText}>
                    • We may change pricing with 30 days notice
                  </Text>

                  <Text style={styles.subtitleText}>6. Termination</Text>
                  <Text style={styles.descriptionText}>
                    We may suspend or terminate accounts for violations. You may cancel anytime.
                  </Text>

                  <Text style={styles.subtitleText}>7. Disclaimers</Text>
                  <Text style={styles.descriptionText}>
                    • We don't guarantee specific learning outcomes
                  </Text>
                  <Text style={styles.descriptionText}>
                    • Courses don't constitute professional certification unless specified
                  </Text>
                  <Text style={styles.descriptionText}>
                    • We're not liable for indirect damages
                  </Text>

                  <Text style={styles.subtitleText}>8. Changes to Terms</Text>
                  <Text style={styles.descriptionText}>
                    We'll notify you of significant changes. Continued use constitutes acceptance.
                  </Text>

                  <Text style={styles.descriptionText}>
                    For questions about these terms, contact legal@tourlms.com.
                  </Text>
                </ScrollView>
              </View>
            )}
            <Divider style={styles.divider} />

            {/* API Documentation Section */}
            <List.Item
              title="Developer Resources"
              description="API documentation and developer tools"
              titleStyle={{ color: colors.text }}
              descriptionStyle={{ color: colors.textSecondary }}
              left={props => <List.Icon {...props} icon="file-code" color={colors.primary} />}
              onPress={() => setShowApiDocs(!showApiDocs)}
            />
            {showApiDocs && (
              <View style={styles.contentContainer}>
                <Text style={styles.titleText}>Developer Center</Text>
                
                <Text style={styles.subtitleText}>API Documentation</Text>
                <List.AccordionGroup>
                  {apiDocsSections.map((section, index) => (
                    <List.Accordion 
                      key={`api-${index}`}
                      title={section.title} 
                      id={`api-${index}`}
                      titleStyle={{ color: colors.text }}
                    >
                      <List.Item
                        title=""
                        description={section.content}
                        descriptionNumberOfLines={10}
                        descriptionStyle={styles.descriptionText}
                      />
                    </List.Accordion>
                  ))}
                </List.AccordionGroup>

                <Button
                  mode="outlined"
                  onPress={handleOpenApiDocs}
                  style={styles.buttonMargin}
                  labelStyle={{ color: colors.primary }}
                  icon="web"
                >
                  View Full API Documentation
                </Button>

                <View style={styles.sectionSpacing}>
                  <Text style={styles.subtitleText}>Developer Tools</Text>
                  <Text style={styles.descriptionText}>
                    <Text style={{ fontWeight: 'bold' }}>API Playground:</Text> Test endpoints directly in your browser
                  </Text>
                  <Text style={styles.descriptionText}>
                    <Text style={{ fontWeight: 'bold' }}>Postman Collection:</Text> Import our ready-to-use collection
                  </Text>
                  <Text style={styles.descriptionText}>
                    <Text style={{ fontWeight: 'bold' }}>API Status:</Text> Check system health and uptime
                  </Text>
                </View>

                <View style={styles.sectionSpacing}>
                  <Text style={styles.subtitleText}>Integration Guides</Text>
                  <Text style={styles.descriptionText}>
                    Step-by-step tutorials for common integrations:
                  </Text>
                  <Text style={styles.listItemText}>
                    • Single Sign-On (SSO) setup
                  </Text>
                  <Text style={styles.listItemText}>
                    • Learning data analytics
                  </Text>
                  <Text style={styles.listItemText}>
                    • Custom course integrations
                  </Text>
                  <Text style={styles.listItemText}>
                    • Webhook implementations
                  </Text>
                </View>

                <View style={styles.sectionSpacing}>
                  <Text style={styles.subtitleText}>Developer Community</Text>
                  <Text style={styles.descriptionText}>
                    Join our developer community for support and collaboration:
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => Linking.openURL('https://github.com/tourlms/developers')}
                    icon="github"
                    style={styles.buttonMargin}
                  >
                    GitHub Community
                  </Button>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}
    </>
  );
};

export default SupportSection;
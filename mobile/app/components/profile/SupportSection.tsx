import React from 'react';
import { View, StyleSheet, ScrollView , TouchableOpacity, Linking } from 'react-native';
import { Card, List, Divider, TextInput, Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


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
  colors: {
    PRIMARY: string;
    CARD_BACKGROUND: string;
    BORDER_COLOR: string;
    TEXT_PRIMARY: string;
    TEXT_SECONDARY: string;
  };
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
  colors,
}) => (
  <>
    <TouchableOpacity onPress={onToggle}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.TEXT_PRIMARY }]}>Support</Text>
        <Icon 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={colors.TEXT_PRIMARY} 
        />
      </View>
    </TouchableOpacity>
    {expanded && (
      <Card style={[styles.settingsCard, { backgroundColor: colors.CARD_BACKGROUND, borderColor: colors.BORDER_COLOR }]}> 
        <Card.Content>
          <List.Item
            title="Help Center"
            description="Find answers to common questions"
            titleStyle={{ color: colors.TEXT_PRIMARY }}
            descriptionStyle={{ color: colors.TEXT_SECONDARY }}
            left={props => <List.Icon {...props} icon="help-circle" color={colors.PRIMARY} />}
            onPress={() => setShowHelp(!showHelp)}
          />
          {showHelp && (
            <View style={{ padding: 16 }}>
              <Text style={{ color: colors.TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Frequently Asked Questions</Text>
              <List.AccordionGroup>
                <List.Accordion title="How do I start a course?" id="1">
                  <List.Item
                    title=""
                    description="Browse available courses in the Courses tab and click 'Enroll' to begin your learning journey."
                    descriptionStyle={{ color: colors.TEXT_SECONDARY }}
                  />
                </List.Accordion>
                <List.Accordion title="How do I earn XP?" id="2">
                  <List.Item
                    title=""
                    description="Complete lessons, participate in discussions, and complete challenges to earn XP points."
                    descriptionStyle={{ color: colors.TEXT_SECONDARY }}
                  />
                </List.Accordion>
                <List.Accordion title="What are achievements?" id="3">
                  <List.Item
                    title=""
                    description="Achievements are badges you earn by completing specific milestones in your learning journey."
                    descriptionStyle={{ color: colors.TEXT_SECONDARY }}
                  />
                </List.Accordion>
              </List.AccordionGroup>
            </View>
          )}
          <Divider style={styles.divider} />
          <List.Item
            title="Contact Support"
            description="Get in touch with our team"
            titleStyle={{ color: colors.TEXT_PRIMARY }}
            descriptionStyle={{ color: colors.TEXT_SECONDARY }}
            left={props => <List.Icon {...props} icon="message" color={colors.PRIMARY} />}
            onPress={() => setShowContact(!showContact)}
          />
          {showContact && (
            <View style={{ padding: 16 }}>
              <Text style={{ color: colors.TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Contact Our Support Team</Text>
              <TextInput
                label="Subject"
                value={contactData.subject}
                mode="outlined"
                style={{ marginBottom: 12 }}
                onChangeText={text => setContactData({ ...contactData, subject: text })}
              />
              <TextInput
                label="Message"
                value={contactData.message}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={{ marginBottom: 12 }}
                onChangeText={text => setContactData({ ...contactData, message: text })}
              />
              <Button mode="contained" onPress={onSendContact}>
                Send Message
              </Button>
            </View>
          )}
          <Divider style={styles.divider} />
          <List.Item
            title="Privacy Policy"
            description="Review our data practices"
            titleStyle={{ color: colors.TEXT_PRIMARY }}
            descriptionStyle={{ color: colors.TEXT_SECONDARY }}
            left={props => <List.Icon {...props} icon="shield-account" color={colors.PRIMARY} />}
            onPress={() => setShowPrivacy(!showPrivacy)}
          />
          {showPrivacy && (
            <View style={{ padding: 16 }}>
              <ScrollView style={{ maxHeight: 300 }}>
                <Text style={{ color: colors.TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Privacy Policy</Text>
                <Text style={{ color: colors.TEXT_SECONDARY, lineHeight: 20 }}>
                  Last updated: {new Date().toLocaleDateString()}{'\n\n'}
                  We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.{'\n\n'}
                  1. The data we collect about you{'\n'}
                  2. How we use your personal data{'\n'}
                  3. Data security{'\n'}
                  4. Your legal rights{'\n\n'}
                  For more information, please contact our support team.
                </Text>
              </ScrollView>
            </View>
          )}
          <Divider style={styles.divider} />
          <List.Item
            title="Terms of Service"
            description="Read our terms and conditions"
            titleStyle={{ color: colors.TEXT_PRIMARY }}
            descriptionStyle={{ color: colors.TEXT_SECONDARY }}
            left={props => <List.Icon {...props} icon="file-document" color={colors.PRIMARY} />}
            onPress={() => setShowTerms(!showTerms)}
          />
          {showTerms && (
            <View style={{ padding: 16 }}>
              <ScrollView style={{ maxHeight: 300 }}>
                <Text style={{ color: colors.TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>Terms of Service</Text>
                <Text style={{ color: colors.TEXT_SECONDARY, lineHeight: 20 }}>
                  Last updated: {new Date().toLocaleDateString()}{'\n\n'}
                  Please read these terms of service carefully before using our platform.{'\n\n'}
                  1. Acceptance of Terms{'\n'}
                  2. User Accounts{'\n'}
                  3. Intellectual Property{'\n'}
                  4. User Conduct{'\n'}
                  5. Termination{'\n\n'}
                  By using our platform, you agree to these terms.
                </Text>
              </ScrollView>
            </View>
          )}
          <Divider style={styles.divider} />
          <List.Item
            title="API Docs"
            description="Access our API documentation"
            titleStyle={{ color: colors.TEXT_PRIMARY }}
            descriptionStyle={{ color: colors.TEXT_SECONDARY }}
            left={props => <List.Icon {...props} icon="file-document" color={colors.PRIMARY} />}
            onPress={() => setShowApiDocs(!showApiDocs)}
          />
          {showApiDocs && (
            <View style={{ padding: 16 }}>
              <Text style={{ color: colors.TEXT_PRIMARY, marginBottom: 16, fontSize: 16 }}>API Documentation</Text>
              <List.AccordionGroup>
                <List.Accordion title="Authentication" id="api1">
                  <List.Item
                    title=""
                    description="All API requests require authentication using a Bearer token."
                    descriptionStyle={{ color: colors.TEXT_SECONDARY }}
                  />
                </List.Accordion>
                <List.Accordion title="Endpoints" id="api2">
                  <List.Item
                    title=""
                    description="Base URL: https://api.tourlms.com/v1"
                    descriptionStyle={{ color: colors.TEXT_SECONDARY }}
                  />
                </List.Accordion>
                <List.Accordion title="Rate Limiting" id="api3">
                  <List.Item
                    title=""
                    description="API requests are limited to 100 requests per minute."
                    descriptionStyle={{ color: colors.TEXT_SECONDARY }}
                  />
                </List.Accordion>
              </List.AccordionGroup>
              <Button
                mode="outlined"
                onPress={() => {
                  Linking.openURL('https://api.tourlms.com/docs');
                }}
                style={{ marginTop: 16 }}
              >
                View Full Documentation
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    )}
  </>
);

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
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 4,
    backgroundColor: '#e0e0e0',
  },
});

export default SupportSection; 
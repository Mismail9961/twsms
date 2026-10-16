import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy | Technology World',
  description: 'Learn how Technology World handles account information, support tickets, attachments, cookies and privacy requests.',
}

const sections: LegalSection[] = [
  {
    id: 'overview', title: 'About this policy',
    content: <><p>This Privacy Policy explains how Technology World handles information when you visit this website, use our support portal, or contact us about our services. It covers clients, employees and other people who interact with the portal.</p><p>Technology World is responsible for the information handled through this service. If you have a question about this policy or how your information is used, you can reach us through our <Link href="/contact">contact page</Link>.</p></>,
  },
  {
    id: 'information', title: 'Information we collect',
    content: <><p>The information involved depends on how you use the service:</p><ul><li><strong>Account and profile information:</strong> your name, email address, password hash, account role and status, and any optional phone number, department or profile image you provide.</li><li><strong>Support records:</strong> ticket details, affected services, device serial numbers, reference links, messages, uploaded files, feedback and the history of support activity.</li><li><strong>Contact enquiries:</strong> your name, email, message and any optional phone number, company or service details you submit. Contact enquiries are stored in an encrypted delivery queue and emailed to our team.</li><li><strong>Technical information:</strong> session identifiers, authentication events and technical logs generated when operating, troubleshooting and protecting the service.</li></ul><p>If you choose Google sign-in, we receive the basic account information needed to identify you, such as your name, email address and profile image.</p></>,
  },
  {
    id: 'use', title: 'How information is used',
    content: <><p>We use information to create and manage accounts, authenticate users, route support requests, investigate issues, communicate service updates and maintain a record of support work.</p><p>Information also helps us manage staff access, review service performance, prevent misuse and diagnose technical problems. Where applicable law requires a legal basis, processing depends on the purpose: providing a requested service, legitimate operational and security interests, meeting a legal obligation, or consent where required.</p></>,
  },
  {
    id: 'sharing', title: 'Access and service providers',
    content: <><p>Access within the portal depends on account roles and ticket permissions. Authorised support staff and administrators can access information needed to manage accounts and deliver support.</p><p>Providers that operate our hosting, database, authentication and email infrastructure may process information as part of delivering those services. Information may also be disclosed where required by law or necessary to address fraud, abuse or security incidents.</p><p>Service providers may process information in countries other than your own. Applicable protections depend on the provider, processing location and relevant law. Contact us if you need more information about how this affects your data.</p></>,
  },
  {
    id: 'cookies', title: 'Cookies and sign-in',
    content: <><p>The portal uses an essential session cookie, <strong>twsms_session</strong>, to keep you signed in. It is configured to expire after seven days and is cleared when you sign out. Google sign-in also uses a short-lived cookie to validate the sign-in request.</p><p>Blocking these cookies may prevent sign-in or other authenticated features from working. You can remove stored cookies through your browser settings. External websites linked from the portal have their own cookie and privacy practices.</p></>,
  },
  {
    id: 'retention', title: 'Retention and security',
    content: <><p>Account and support records are retained for service delivery, continuity of support, security and any applicable recordkeeping obligations. Retention depends on the type of information, the account relationship and any unresolved support or legal matter. Contact us to ask about retention for a particular record.</p><p>The portal uses measures including password hashing, signed session cookies and permission checks to help protect information. No online service can guarantee complete security. Keep your sign-in details private and avoid including passwords, private keys or unnecessary sensitive information in tickets or attachments.</p></>,
  },
  {
    id: 'choices', title: 'Your choices and requests',
    content: <><p>You can review and update the profile details available in your account. You can also contact us to request access to, correction of, or deletion of your information, or to ask about limiting its use.</p><p>Available rights and any exceptions depend on applicable law. We may need to verify your identity before responding, and some records may need to be retained for legal, security or service-related reasons. Where processing relies on consent, you may ask to withdraw it. You may also raise a concern with an appropriate data protection authority where that right applies.</p><p>Use our <Link href="/contact">contact page</Link> and identify your message as a privacy request. Please do not include your password or sensitive identity documents in your initial enquiry.</p></>,
  },
  {
    id: 'updates', title: 'Policy updates',
    content: <><p>We may update this policy as the service or our information practices change. The date at the top identifies the latest revision. Where required, we will provide additional notice of material changes.</p><p>For the guidelines governing use of the portal, please read our <Link href="/terms">Terms &amp; Conditions</Link>.</p></>,
  },
]

export default function PrivacyPage() {
  return <LegalPage kind="privacy" title="Privacy Policy" introduction="Clarity about your information. Understand what we collect, why we use it, and the choices available to you." summary="Your account details and support records help us deliver and manage your support. This policy explains how that information moves through the service and how to raise a privacy request." sections={sections} />
}

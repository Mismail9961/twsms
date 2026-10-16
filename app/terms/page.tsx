import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Technology World',
  description: 'Read the terms for Technology World’s support portal, including account responsibilities, support requests and acceptable use.',
}

const sections: LegalSection[] = [
  {
    id: 'overview', title: 'About these terms',
    content: <><p>These Terms &amp; Conditions govern your use of the Technology World website and support portal. By using the service, you agree to these terms. If you do not agree, please discontinue use and contact us with any questions.</p><p>The portal helps clients and authorised staff submit, track and resolve support requests. If you use it on behalf of an organisation, you must have authority to do so. A separate written service agreement takes precedence where its provisions conflict with these terms.</p></>,
  },
  {
    id: 'accounts', title: 'Accounts and access',
    content: <><p>Provide accurate account details and keep your contact information up to date. You are responsible for protecting your credentials and for activity you authorise through your account.</p><ul><li>Use your own account and keep passwords and verification links private.</li><li>Access only the information and functions permitted by your assigned role.</li><li>Notify Technology World if you suspect unauthorised access or misuse.</li><li>Do not impersonate another person or misrepresent your relationship with an organisation.</li></ul></>,
  },
  {
    id: 'support', title: 'Support requests and services',
    content: <><p>Include accurate, relevant information when opening a ticket. You may be asked for additional details or access arrangements before an issue can be investigated or resolved. Upload only material you are authorised to share.</p><p>Ticket priorities and status updates help organise work. They do not, by themselves, guarantee response times, resolution times or a particular outcome. Service hours, pricing, warranties and any service-level commitments are governed by your applicable written service agreement or accepted quotation.</p><p>The portal is not an emergency response service. For an urgent operational incident, use the escalation arrangements in your service agreement.</p></>,
  },
  {
    id: 'acceptable-use', title: 'Acceptable use',
    content: <><p>Use the portal lawfully and in a way that respects other users and the security of the service. You must not:</p><ul><li>Attempt to bypass access controls, probe for vulnerabilities without authorisation, or access someone else’s records.</li><li>Upload malware, send spam, or disrupt the website or its infrastructure.</li><li>Submit unlawful, threatening, abusive or infringing material.</li><li>Share another person’s confidential or personal information without appropriate authority.</li><li>Use automated tools to extract restricted information or interfere with normal service operation.</li></ul></>,
  },
  {
    id: 'content', title: 'Your content and our materials',
    content: <><p>You retain any rights you hold in the content you submit. You give Technology World permission to store, copy and use that content as needed to operate the portal, provide support and meet applicable obligations.</p><p>Technology World and its licensors retain rights in the website’s branding, design, software and other materials. Access to the service does not transfer ownership of those materials or grant permission to reproduce them beyond what is necessary for authorised use.</p></>,
  },
  {
    id: 'privacy', title: 'Privacy and confidentiality',
    content: <><p>Our <Link href="/privacy">Privacy Policy</Link> explains how information is handled through the portal, including account details, support records, attachments and sign-in cookies.</p><p>Share only information relevant to your request. Do not submit passwords, private keys or unrelated sensitive records in tickets. If support requires confidential access details, agree on an appropriate method with your authorised Technology World contact.</p></>,
  },
  {
    id: 'availability', title: 'Availability and external services',
    content: <><p>The service may be interrupted by maintenance, updates, network problems or events outside our control. Features may change as the portal develops. Any availability commitments are those expressly stated in your service agreement.</p><p>The website may link to third-party sites or offer features such as Google sign-in. Those services are subject to their own terms and policies. Technology World does not control their content or operation.</p></>,
  },
  {
    id: 'liability', title: 'Responsibility and limitations',
    content: <><p>Except for commitments expressly made in a separate agreement, the portal is provided on an “as available” basis. To the extent permitted by applicable law, Technology World does not guarantee uninterrupted access, error-free operation or suitability for every purpose.</p><p>To the extent permitted by applicable law, Technology World is not responsible for indirect or consequential losses arising from use of, or inability to use, the portal. Nothing in these terms excludes liability that cannot legally be excluded, or limits rights or remedies that applicable law does not allow to be waived.</p></>,
  },
  {
    id: 'suspension', title: 'Suspension and closing an account',
    content: <><p>We may restrict or suspend access where reasonably necessary to address misuse, a security concern, a breach of these terms or a legal requirement. Where appropriate, we will explain the restriction and the steps needed to restore access.</p><p>You can stop using the portal and contact us about closing your account. Closing an account does not automatically remove all support records or end obligations under a separate service agreement. Information retention is described in our <Link href="/privacy#retention">Privacy Policy</Link>.</p></>,
  },
  {
    id: 'changes-contact', title: 'Changes, questions and disputes',
    content: <><p>We may revise these terms when the service or applicable requirements change. The latest revision date appears at the top of this page. Where required, material changes will receive additional notice.</p><p>If a concern arises, please <Link href="/contact">contact Technology World</Link> so we can try to resolve it. Any governing-law or dispute-resolution provisions in your separate service agreement continue to apply. Otherwise, applicable law determines the relevant rights and forum.</p></>,
  },
]

export default function TermsPage() {
  return <LegalPage kind="terms" title="Terms & Conditions" introduction="A clear foundation for working together. These guidelines explain your responsibilities and what to expect from our support portal." summary="Use your account responsibly, share only information you are authorised to provide, and follow the portal’s access rules. Specific support commitments remain governed by your service agreement." sections={sections} />
}

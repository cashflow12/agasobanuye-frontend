import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Agasobanuyefilmz',
  description: 'Read how Agasobanuyefilmz protects your privacy and handles any data collected when you stream Agasobanuye movies and series.',
  openGraph: {
    title: 'Privacy Policy - Agasobanuyefilmz',
    description: 'Agasobanuyefilmz is committed to protecting your personal data. Learn more about what we collect and how it\'s used.',
    type: 'website',
    url: 'https://agasobanuyefilmz.store/privacy',
    images: [
      {
        url: 'https://agasobanuyefilmz.store/cover.jpg',
        width: 1200,
        height: 630,
        alt: 'Agasobanuyefilmz Cover Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - Agasobanuyefilmz',
    description: 'Agasobanuyefilmz is committed to protecting your personal data. Learn more about what we collect and how it\'s used.',
    images: ['https://agasobanuyefilmz.store/cover.jpg'],
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-invert max-w-none">
        <section className="mb-8">
          <p>
            At <strong>Agasobanuyefilmz</strong>, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit or use our website to stream Agasobanuye movies and series.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Basic Usage Data:</strong> We may collect anonymous data such as page views, time spent on pages, and device type for improving the platform.
            </li>
            <li>
              <strong>Contact Information:</strong> If you reach out via our contact form, we may collect your name, email address, and message content.
            </li>
            <li>
              We do <strong>not</strong> collect passwords, payment details, or any sensitive personal information unless explicitly provided by you.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>
            We use collected information to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Improve site performance and user experience</li>
            <li>Respond to your inquiries and feedback</li>
            <li>Monitor security and prevent abuse</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cookies</h2>
          <p>
            We may use cookies to remember your preferences or collect analytics data. You can disable cookies in your browser settings, though this may affect some functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
          <p>
            We may use third-party services like Google Analytics or video hosting platforms. These services may collect limited data under their own privacy policies. We do not sell or share your personal data with advertisers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Children's Privacy</h2>
          <p>
            Agasobanuyefilmz is intended for general audiences. We do not knowingly collect personal data from children under 13. If we learn this has happened, we will remove the information immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>
            You can request to view, edit, or delete your personal information by contacting us. We'll respond to requests as soon as possible.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be posted on this page with the latest revision date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <div className="space-y-2">
            <p><strong>Platform:</strong> Agasobanuyefilmz</p>
            <p><strong>Founder:</strong> DJ JoeBoy</p>
            <p><strong>Email:</strong> <a href="mailto:djjoeboyoff@gmail.com" className="text-blue-400 hover:underline">djjoeboyoff@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+250790358767" className="text-blue-400 hover:underline">+250 790 358 767</a></p>
            <p><strong>Location:</strong> Kigali, Rwanda</p>
          </div>
        </section>
      </div>
    </div>
  )
}
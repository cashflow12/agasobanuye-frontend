import type { Metadata } from 'next'
import { FaWhatsapp, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa"

export const metadata: Metadata = {
  title: 'Contact Us - Agasobanuyefilmz',
  description: 'Get in touch with DJ JoeBoy and the Agasobanuyefilmz team for inquiries, collaborations, or support.',
  openGraph: {
    title: 'Contact - Agasobanuyefilmz',
    description: 'Reach out to DJ JoeBoy for any questions about Agasobanuye movies and series.',
    type: 'website',
    url: 'https://agasobanuyefilmz.store/contact',
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
    title: 'Contact - Agasobanuyefilmz',
    description: 'Connect with DJ JoeBoy for all Agasobanuye entertainment inquiries',
    images: ['https://agasobanuyefilmz.store/cover.jpg'],
  },
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Contact DJ JoeBoy</h1>

      <div className="prose prose-invert max-w-none">
        <section className="mb-8">
          <p className="text-lg">
            For bookings, collaborations, or any inquiries about Agasobanuyefilmz, reach out through any of these channels:
          </p>
        </section>

        <section className="mb-10 bg-gray-800/50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">Direct Contacts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FaWhatsapp className="text-green-500" />
                WhatsApp
              </h3>
              <a 
                href="https://wa.me/250790358767" 
                className="text-blue-400 hover:underline block"
              >
                +250 790 358 767
              </a>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                Email
              </h3>
              <a 
                href="mailto:djjoeboyoff@gmail.com" 
                className="text-blue-400 hover:underline block"
              >
                djjoeboyoff@gmail.com
              </a>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Location
              </h3>
              <p>Kigali, Rwanda</p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Follow Us On Social Media</h2>
          <div className="flex justify-center gap-8">
            <a 
              href="https://www.instagram.com/dj_joeboy250?igsh=YzljYTk1ODg3Zg=="
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-full hover:scale-110 transition-transform"
              aria-label="Instagram"
            >
              <FaInstagram className="text-3xl text-white" />
            </a>
            <a 
              href="https://www.youtube.com/@tuyishimeauguster4637"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 p-4 rounded-full hover:scale-110 transition-transform"
              aria-label="YouTube"
            >
              <FaYoutube className="text-3xl text-white" />
            </a>
            <a 
              href="http://tiktok.com/@djjoeboyoff"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black dark:bg-white p-4 rounded-full hover:scale-110 transition-transform"
              aria-label="TikTok"
            >
              <FaTiktok className="text-3xl dark:text-black text-white" />
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
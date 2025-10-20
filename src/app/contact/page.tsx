import type { Metadata } from 'next'
import { FaWhatsapp, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export const metadata: Metadata = {
  title: 'Contact Us - Agasobanuyefilmz',
  description: 'Get in touch with the team behind Agasobanuyefilmz. Contact DJ JoeBoy for inquiries, support, or suggestions.',
  openGraph: {
    title: 'Contact - Agasobanuyefilmz',
    description: 'Reach out to Agasobanuyefilmz for any questions or feedback regarding Agasobanuye movies and series.',
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
    description: 'Reach out to Agasobanuyefilmz for any questions or feedback regarding Agasobanuye movies and series.',
    images: ['https://agasobanuyefilmz.store/cover.jpg'],
  },
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <div className="prose prose-invert max-w-none">
        <section className="mb-8">
          <p>
            Do you have questions, suggestions, or want to collaborate? We're always happy to hear from fans and supporters of Agasobanuye entertainment.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Email</h3>
              <a href="mailto:djjoeboyoff@gmail.com" className="text-blue-400 hover:underline">
                djjoeboyoff@gmail.com
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">WhatsApp</h3>
              <a href="https://wa.me/250790358767" className="text-blue-400 hover:underline">
                +250 790 358 767
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Location</h3>
              <p>Kigali, Rwanda</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Connect With Us</h2>
          <div className="flex gap-6">
            <a 
              href="https://wa.me/250790358767"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-400 transition-colors"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="text-3xl" />
            </a>
            <a 
              href="https://www.instagram.com/dj_joeboy250?igsh=YzljYTk1ODg3Zg==" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-400 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="text-3xl" />
            </a>
            <a 
              href="https://www.youtube.com/@tuyishimeauguster4637" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition-colors"
              aria-label="YouTube"
            >
              <FaYoutube className="text-3xl" />
            </a>
            <a 
              href="http://tiktok.com/@djjoeboyoff" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="TikTok"
            >
              <FaTiktok className="text-3xl" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
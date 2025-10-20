"use client";

import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link
              href="/contact"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/about_us"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/terms"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Terms and Conditions
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-6">
            <Link
              href="https://wa.me/250790358767"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-green-500 transition-colors"
              aria-label="Contact us on WhatsApp"
            >
              <FaWhatsapp className="text-2xl" />
            </Link>
            <Link
              href="https://www.instagram.com/dj_joeboy250?igsh=YzljYTk1ODg3Zg=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-pink-500 transition-colors"
              aria-label="Visit our Instagram page"
            >
              <FaInstagram className="text-2xl" />
            </Link>
            <Link
              href="https://www.youtube.com/@tuyishimeauguster4637"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-red-500 transition-colors"
              aria-label="Visit our YouTube channel"
            >
              <FaYoutube className="text-2xl" />
            </Link>
            <Link
              href="http://tiktok.com/@djjoeboyoff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Visit our TikTok page"
            >
              <FaTiktok className="text-2xl" />
            </Link>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Mujyosi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
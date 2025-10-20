"use client";

import { useState, useEffect } from "react";
import { FaFacebook, FaInstagram, FaYoutube, FaComment, FaTimes, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FloatingSocial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Hide the button when scrolling down, show when scrolling up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const socialLinks = [
    {
      icon: <FaWhatsapp className="text-2xl" />,
      url: "https://wa.me/250790358767",
      color: "bg-green-500",
      label: "WhatsApp"
    },
    {
      icon: <FaInstagram className="text-2xl" />,
      url: "https://www.instagram.com/dj_joeboy250?igsh=YzljYTk1ODg3Zg==",
      color: "bg-gradient-to-br from-purple-500 via-pink-500 to-red-500",
      label: "Instagram"
    },
    {
      icon: <FaYoutube className="text-2xl" />,
      url: "https://www.youtube.com/@tuyishimeauguster4637",
      color: "bg-red-600",
      label: "YouTube"
    },
    {
      icon: <FaTiktok className="text-2xl" />,
      url: "http://tiktok.com/@djjoeboyoff",
      color: "bg-black",
      label: "TikTok"
    }
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openLink = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            {/* Social media buttons */}
            <AnimatePresence>
              {isOpen && (
                <>
                  {socialLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30, rotate: -45 }}
                      animate={{ 
                        opacity: 1, 
                        y: -70 * (index + 1), 
                        rotate: 0,
                        transition: { 
                          delay: index * 0.15, 
                          duration: 0.3, 
                          ease: "backOut",
                          type: "spring",
                          stiffness: 200
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        y: 30, 
                        rotate: 45,
                        transition: { duration: 0.2 }
                      }}
                      className={`absolute top-0 right-0 w-14 h-14 ${link.color} rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-125 hover:shadow-2xl transition-all duration-300`}
                      onClick={() => openLink(link.url)}
                      aria-label={link.label}
                    >
                      {link.icon}
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Main floating button with glow and pulse */}
            <motion.button
              whileHover={{ scale: 1.2, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                scale: [1, 1.1, 1], 
                boxShadow: [
                  "0 0 10px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.8)",
                  "0 0 10px rgba(59, 130, 246, 0.5)"
                ],
                transition: { 
                  scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                  boxShadow: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                }
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ${isOpen ? "bg-gray-800" : "bg-blue-600"} text-white focus:outline-none relative overflow-hidden`}
              onClick={toggleMenu}
              aria-label={isOpen ? "Close social menu" : "Open social menu"}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-50" />
              {isOpen ? (
                <FaTimes className="text-2xl relative z-10" />
              ) : (
                <FaComment className="text-2xl relative z-10" />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingSocial;
"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Home, PlusSquare, User, LogOut } from 'lucide-react';
import { use, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, authenticated } = usePrivy();

  const menuVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "100%" }
  };

  const links = [
    { href: '/home', icon: <Home size={20} />, label: 'Home' },
    { href: '/submitNews', icon: <PlusSquare size={20} />, label: 'Submit News' },
    { href: '/home/UserSub', icon: <User size={20} />, label: 'My Posts' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 px-8 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold">
            Shortify
          </Link>
          
          <div className="flex items-center space-x-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center space-x-2 hover:text-violet-600 transition-colors"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {authenticated && (
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Hamburger Button */}
        <motion.button
          className="fixed top-4 right-4 z-50 p-3 bg-white rounded-xl shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>

        {/* Mobile Menu */}
        <motion.nav
          className="fixed top-0 right-0 h-screen w-64 bg-white shadow-2xl z-40 p-8"
          animate={isOpen ? "open" : "closed"}
          variants={menuVariants}
          initial="closed"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex flex-col space-y-6 mt-16">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {authenticated && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </motion.nav>

        {/* Mobile Overlay */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  );
}
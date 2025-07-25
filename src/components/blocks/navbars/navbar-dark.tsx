"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/analysis', label: 'Analysis' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact Us' },
  ]

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-out">
      <div 
        className={`px-8 py-4 rounded-full border transition-all duration-700 ease-out ${
          isScrolled 
            ? 'bg-[#0A0F17]/98 backdrop-blur-xl border-white/30 shadow-[0_15px_50px_rgba(0,164,255,0.4)] scale-105' 
            : 'bg-[#0A0F17]/70 backdrop-blur-md border-white/15 shadow-[0_5px_20px_rgba(0,164,255,0.2)]'
        }`}
      >
        <div className="flex items-center justify-between min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center mr-10">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#00A4FF] to-[#6B00FF] bg-clip-text text-transparent">
              SIMANA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-5 py-3 text-white/90 hover:text-white transition-all duration-300 ease-out group text-sm font-medium"
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00A4FF]/0 to-[#6B00FF]/0 group-hover:from-[#00A4FF]/25 group-hover:to-[#6B00FF]/25 transition-all duration-300 ease-out"></div>
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out shadow-[0_0_20px_rgba(0,164,255,0.5)]"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#00FFD1] group-hover:w-10 transition-all duration-300 ease-out rounded-full"></div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 ease-out"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden mt-3 overflow-hidden transition-all duration-400 ease-out ${
          isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#0A0F17]/98 backdrop-blur-xl rounded-2xl border border-white/25 shadow-[0_15px_50px_rgba(0,164,255,0.4)] p-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block px-5 py-4 text-white/80 hover:text-white rounded-xl transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-[#00A4FF]/20 hover:to-[#6B00FF]/20 hover:shadow-[0_0_15px_rgba(0,164,255,0.3)] text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

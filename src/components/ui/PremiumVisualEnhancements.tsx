'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export function PremiumVisualEnhancements() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* 4-Color Fluid Mesh Animation Layer (Defined in globals.css) */}
      <div className="animated-bg" />
      
      {/* Enhanced Visibility Dynamic Blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      
      {/* 5-Particle Subtle Cluster Cluster (Fixed positions) */}
      {[...Array(5)].map((_, i) => (
        <motion.div 
           key={i}
           initial={{ opacity: 0, scale: 0 }}
           animate={{ 
             opacity: [0.05, 0.1, 0.05], 
             scale: [0.5, 1, 0.5],
             x: [0, Math.sin(i) * 50, 0],
             y: [0, Math.cos(i) * 50, 0]
           }}
           transition={{ duration: 10 + i, repeat: Infinity, ease: "easeInOut" }}
           className="particle"
           style={{
             width: 4+i,
             height: 4+i,
             left: `${15 + (i * 20)}%`,
             top: `${20 + (i * 15)}%`,
           }}
        />
      ))}
      
      {/* Noise Texture Over Context */}
      <div className="noise" />
      
      {/* Precision Trailing Cursor */}
      <MinimalCursor />
      
      {/* Focal Spotlight Blur */}
      <SubtleBlurSpotlight />
    </div>
  )
}

function MinimalCursor() {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Fluid spring physics
  const springX = useSpring(mouseX, { damping: 20, stiffness: 250 })
  const springY = useSpring(mouseY, { damping: 20, stiffness: 250 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)

      const target = e.target as HTMLElement
      const isSelectable = window.getComputedStyle(target).cursor === 'pointer' || 
                           target.tagName === 'BUTTON' || 
                           target.tagName === 'A' || 
                           target.closest('button') || 
                           target.closest('a') ||
                           target.role === 'button'
      
      setIsPointer(!!isSelectable)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [mouseX, mouseY, isVisible])

  return (
    <div className="hidden lg:block fixed inset-0 pointer-events-none z-[9999]" style={{ pointerEvents: 'none' }}>
      {/* Interaction Core - Glowing Center */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isPointer ? 1.5 : 1,
        }}
        className="fixed w-2 h-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_15px_rgba(167,199,231,0.8)] z-[10000]"
      />
      
      {/* Flowing Ring - Trailing Edge */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 0.3 : 0,
        }}
        animate={{
          scale: isPointer ? 1.8 : 1,
          width: isPointer ? 48 : 32,
          height: isPointer ? 48 : 32,
        }}
        className="fixed border border-[var(--color-primary)]/40 rounded-full z-[9999]"
      />
    </div>
  )
}

function SubtleBlurSpotlight() {
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mouseX, mouseY])

  return (
    <motion.div
      style={{
        left: mouseX,
        top: mouseY,
        x: '-50%',
        y: '-50%',
      }}
      className="blur-spotlight hidden lg:block z-[5000]"
    />
  )
}

export function PageEntrance({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)', scale: 0.97 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  )
}

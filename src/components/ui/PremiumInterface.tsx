'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useSpring, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function PremiumInterfaceProvider() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <>
      <MultiLayerBackground />
      <AdvancedCursor />
      <MouseBlurSpotlight />
    </>
  )
}

function MultiLayerBackground() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    }

    window.addEventListener('mousemove', handleMove)

    return () => {
      window.removeEventListener('mousemove', handleMove)
    }
  }, [mouseX, mouseY])

  const x1 = useTransform(mouseX, [-500, 500], [20, -20])
  const y1 = useTransform(mouseY, [-500, 500], [20, -20])
  const x2 = useTransform(mouseX, [-500, 500], [-30, 30])
  const y2 = useTransform(mouseY, [-500, 500], [-30, 30])

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background pointer-events-none">
      {/* Noise Overlay */}
      <div className="absolute inset-0 noise z-30 opacity-[0.03] dark:opacity-[0.05]"></div>

      {/* Layer 1: Dot Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Layer 2: Mesh Gradients */}
      <motion.div
        style={{ x: x1, y: y1 }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] blur-[120px] bg-black/[0.04] dark:bg-white/[0.03] rounded-full animate-float"
      />

      <motion.div
        style={{ x: x2, y: y2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] blur-[150px] bg-black/[0.05] dark:bg-white/[0.04] rounded-full animate-float animation-delay-2000"
      />

      {/* Layer 3: Mouse Glow */}
      <MouseGlow />
    </div>
  )
}

function MouseGlow() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

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
        transform: 'translate(-50%, -50%)',
      }}
      className="absolute w-[800px] h-[800px] bg-black/[0.02] dark:bg-white/[0.015] rounded-full blur-[100px] pointer-events-none z-10"
    />
  )
}

function AdvancedCursor() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const springConfig = { damping: 25, stiffness: 400 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

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
        target.closest('a')

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
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-[10000]">
      {/* Core Dot (Rapid) */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed w-1.5 h-1.5 bg-foreground rounded-full mix-blend-difference"
      />

      {/* Outer Ring (Spring trailing) */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 0.4 : 0,
        }}
        animate={{
          scale: isPointer ? 1.8 : 1,
          width: isPointer ? 60 : 36,
          height: isPointer ? 60 : 36,
          borderWidth: isPointer ? 1.5 : 1,
        }}
        className="fixed border border-foreground rounded-full mix-blend-difference"
      />
    </div>
  )
}

function MouseBlurSpotlight() {
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
      className="blur-spotlight hidden lg:block"
    />
  )
}

export function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

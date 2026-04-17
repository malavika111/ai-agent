'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background pointer-events-none">
      {/* Light blobs in light mode, subtle dark blobs in dark mode */}
      <div className="absolute top-[-10%] translate-x-[-1/2] left-[20%] w-[50%] h-[60%] blur-[120px] bg-black/[0.03] dark:bg-white/[0.03] rounded-full animate-blob"></div>
      <div className="absolute bottom-[-10%] translate-x-[-1/2] right-[20%] w-[50%] h-[60%] blur-[120px] bg-black/[0.04] dark:bg-white/[0.04] rounded-full animate-blob animation-delay-2000"></div>
      <div className="absolute top-[30%] translate-x-[-1/2] right-[40%] w-[40%] h-[50%] blur-[120px] bg-black/[0.02] dark:bg-white/[0.02] rounded-full animate-blob animation-delay-4000"></div>
    </div>
  )
}

export function CustomCursor() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 300 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  const dotSize = 8
  const ringSize = 40

  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [mouseX, mouseY, isVisible])

  if (typeof window === 'undefined') return null

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-[9999]">
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed w-2 h-2 bg-foreground rounded-full mix-blend-difference"
      />
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 0.3 : 0,
        }}
        animate={{
          scale: isPointer ? 1.5 : 1,
          width: isPointer ? 60 : 40,
          height: isPointer ? 60 : 40,
        }}
        className="fixed border border-foreground rounded-full mix-blend-difference"
      />
    </div>
  )
}

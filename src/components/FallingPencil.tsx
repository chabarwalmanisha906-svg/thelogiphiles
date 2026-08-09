'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const PENCIL_WIDTH = 44
const PENCIL_HEIGHT = Math.round(PENCIL_WIDTH * (946 / 116))

export function FallingPencil() {
  const { scrollYProgress } = useScroll()
  const [range, setRange] = useState<{ startY: number; endY: number; centerX: number } | null>(
    null,
  )

  useEffect(() => {
    const measure = () => {
      const cup = document.getElementById('footer-merch-cup')
      if (!cup) return

      const rect = cup.getBoundingClientRect()
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight
      if (maxScrollY <= 0) return

      const centerX = rect.left + rect.width / 2
      const endY = rect.top + window.scrollY - maxScrollY + rect.height * 0.2
      const startY = -PENCIL_HEIGHT

      setRange({ startY, endY, centerX })
    }

    measure()
    const timeout = setTimeout(measure, 500)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const top = useTransform(
    scrollYProgress,
    [0, 1],
    range ? [range.startY, range.endY] : [0, 0],
  )
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-10, 6, -4])
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.03, 0.94, 1],
    [0, 1, 1, 0],
  )

  if (!range) return null

  return (
    <motion.img
      src="/falling-pencil.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed z-40 hidden lg:block"
      style={{
        top,
        left: range.centerX,
        x: '-50%',
        width: PENCIL_WIDTH,
        height: PENCIL_HEIGHT,
        rotate,
        opacity,
      }}
    />
  )
}

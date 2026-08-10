'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

type ItemConfig = {
  src: string
  height: number
  aspect: number
  xOffsetStart: number
  xOffsetEnd: number
  startYOffset: number
  fadeInDelay: number
  rotateFrom: number
  rotateMid: number
  rotateTo: number
  fadeOutStart: number
}

const TARGET_HEIGHT = 140

const ITEMS: ItemConfig[] = [
  {
    src: '/falling-pen.png',
    height: TARGET_HEIGHT,
    aspect: 1000 / 166,
    xOffsetStart: -320,
    xOffsetEnd: -16,
    startYOffset: -20,
    fadeInDelay: 0,
    rotateFrom: -8,
    rotateMid: 5,
    rotateTo: -3,
    fadeOutStart: 0.9,
  },
  {
    src: '/falling-pencil.png',
    height: TARGET_HEIGHT,
    aspect: 946 / 115,
    xOffsetStart: 0,
    xOffsetEnd: 0,
    startYOffset: 25,
    fadeInDelay: 0.02,
    rotateFrom: -5,
    rotateMid: 4,
    rotateTo: -2,
    fadeOutStart: 0.94,
  },
  {
    src: '/falling-marker.png',
    height: TARGET_HEIGHT,
    aspect: 925 / 171,
    xOffsetStart: 320,
    xOffsetEnd: 16,
    startYOffset: -40,
    fadeInDelay: 0.04,
    rotateFrom: 7,
    rotateMid: -5,
    rotateTo: 3,
    fadeOutStart: 0.88,
  },
]

type Range = { startX: number; startY: number; endX: number; endY: number }

function FallingItem({
  item,
  range,
  scrollYProgress,
}: {
  item: ItemConfig
  range: Range
  scrollYProgress: MotionValue<number>
}) {
  const width = Math.round(item.height / item.aspect)
  const top = useTransform(
    scrollYProgress,
    [0, 1],
    [range.startY + item.startYOffset, range.endY],
  )
  const left = useTransform(
    scrollYProgress,
    [0, 1],
    [range.startX + item.xOffsetStart, range.endX + item.xOffsetEnd],
  )
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [item.rotateFrom, item.rotateMid, item.rotateTo],
  )
  const fadeInStart = 0.015 + item.fadeInDelay
  const fadeInEnd = fadeInStart + 0.03
  const opacity = useTransform(
    scrollYProgress,
    [0, fadeInStart, fadeInEnd, item.fadeOutStart, 1],
    [0, 0, 0.7, 0.7, 0],
  )

  return (
    <motion.img
      src={item.src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed z-40 hidden lg:block"
      style={{
        top,
        left,
        x: '-50%',
        width,
        height: item.height,
        rotate,
        opacity,
        filter:
          'drop-shadow(0 0 2px rgba(255,255,255,0.85)) drop-shadow(0 4px 10px rgba(0,0,0,0.35))',
      }}
    />
  )
}

export function FallingPencil() {
  const { scrollYProgress } = useScroll()
  const [range, setRange] = useState<Range | null>(null)

  useEffect(() => {
    const measure = () => {
      const heroCup = document.getElementById('hero-cup-anchor')
      const footerCup = document.getElementById('footer-merch-cup')
      if (!heroCup || !footerCup) return

      const heroRect = heroCup.getBoundingClientRect()
      const footerRect = footerCup.getBoundingClientRect()
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight
      if (maxScrollY <= 0) return

      const startX = heroRect.left + window.scrollX
      const startY = heroRect.top + window.scrollY
      const endX = footerRect.left + footerRect.width / 2 + window.scrollX
      const endY = footerRect.top + window.scrollY - maxScrollY + footerRect.height * 0.2

      setRange({ startX, startY, endX, endY })
    }

    measure()
    const timeout = setTimeout(measure, 500)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', measure)
    }
  }, [])

  if (!range) return null

  return (
    <>
      {ITEMS.map((item) => (
        <FallingItem key={item.src} item={item} range={range} scrollYProgress={scrollYProgress} />
      ))}
    </>
  )
}

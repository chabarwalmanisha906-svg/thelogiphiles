'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

type ItemConfig = {
  src: string
  width: number
  aspect: number
  xOffset: number
  startYOffset: number
  fadeInDelay: number
  rotateFrom: number
  rotateMid: number
  rotateTo: number
  fadeOutStart: number
}

const ITEMS: ItemConfig[] = [
  {
    src: '/falling-pen.png',
    width: 22,
    aspect: 841 / 163,
    xOffset: -40,
    startYOffset: -20,
    fadeInDelay: 0,
    rotateFrom: -8,
    rotateMid: 5,
    rotateTo: -3,
    fadeOutStart: 0.9,
  },
  {
    src: '/falling-pencil.png',
    width: 24,
    aspect: 968 / 114,
    xOffset: 0,
    startYOffset: 25,
    fadeInDelay: 0.02,
    rotateFrom: -5,
    rotateMid: 4,
    rotateTo: -2,
    fadeOutStart: 0.94,
  },
  {
    src: '/falling-marker.png',
    width: 30,
    aspect: 911 / 251,
    xOffset: 40,
    startYOffset: -40,
    fadeInDelay: 0.04,
    rotateFrom: 7,
    rotateMid: -5,
    rotateTo: 3,
    fadeOutStart: 0.88,
  },
]

type Range = { startX: number; startY: number; endX: number; endY: number; pageFraction: number }

function FallingItem({
  item,
  range,
  scrollYProgress,
}: {
  item: ItemConfig
  range: Range
  scrollYProgress: MotionValue<number>
}) {
  const height = Math.round(item.width * item.aspect)
  const top = useTransform(
    scrollYProgress,
    [0, 1],
    [range.startY + item.startYOffset, range.endY],
  )
  const left = useTransform(
    scrollYProgress,
    [0, 1],
    [range.startX + item.xOffset, range.endX + item.xOffset],
  )
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [item.rotateFrom, item.rotateMid, item.rotateTo],
  )
  const fadeInStart = range.pageFraction + item.fadeInDelay
  const fadeInEnd = fadeInStart + 0.05
  const opacity = useTransform(
    scrollYProgress,
    [0, fadeInStart, fadeInEnd, item.fadeOutStart, 1],
    [0, 0, 1, 1, 0],
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
        width: item.width,
        height,
        rotate,
        opacity,
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
      const pageFraction = window.innerHeight / maxScrollY

      setRange({ startX, startY, endX, endY, pageFraction })
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

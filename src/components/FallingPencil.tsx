'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

type ItemConfig = {
  src: string
  width: number
  aspect: number
  xOffset: number
  startYOffset: number
  rotateFrom: number
  rotateMid: number
  rotateTo: number
  fadeOutStart: number
}

const ITEMS: ItemConfig[] = [
  {
    src: '/falling-pen.png',
    width: 30,
    aspect: 1000 / 158,
    xOffset: -40,
    startYOffset: -20,
    rotateFrom: -16,
    rotateMid: 8,
    rotateTo: -6,
    fadeOutStart: 0.9,
  },
  {
    src: '/falling-pencil.png',
    width: 34,
    aspect: 946 / 116,
    xOffset: 0,
    startYOffset: 25,
    rotateFrom: -10,
    rotateMid: 6,
    rotateTo: -4,
    fadeOutStart: 0.94,
  },
  {
    src: '/falling-marker.png',
    width: 32,
    aspect: 925 / 171,
    xOffset: 40,
    startYOffset: -40,
    rotateFrom: 14,
    rotateMid: -8,
    rotateTo: 5,
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
  const opacity = useTransform(scrollYProgress, [0, item.fadeOutStart, 1], [1, 1, 0])

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

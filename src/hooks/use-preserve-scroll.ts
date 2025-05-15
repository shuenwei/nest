"use client"

import { useEffect, useRef } from "react"

export function usePreserveScroll() {
  const scrollPositionRef = useRef(0)

  // Save scroll position before any re-renders
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Restore scroll position after re-renders
  useEffect(() => {
    if (scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current)
    }
  })

  return null
}

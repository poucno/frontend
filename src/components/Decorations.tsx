import { useEffect, useRef } from 'react'

export function IslandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <ellipse cx="31" cy="51" rx="28" ry="9" fill="#36b9e9" />
      <path d="M9 48 Q31 23 54 48 Q33 57 9 48" fill="#ffcf55" />
      <path d="M12 46 Q32 36 51 47" fill="none" stroke="#7db653" strokeWidth="5" strokeLinecap="round" />
      <path d="M31 43 Q38 23 30 14" fill="none" stroke="#a56643" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 16 Q14 5 12 22 M30 16 Q22 0 38 7 M30 16 Q48 1 51 20 M30 16 Q44 16 45 29 M30 16 Q20 13 20 30" fill="none" stroke="#138d61" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

export function Balloons({ animated = false, motionEnabled = true }: { animated?: boolean; motionEnabled?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!animated || !motionEnabled) return
    const balloons = [...(svgRef.current?.querySelectorAll<SVGGElement>('.balloon-tilt') ?? [])]
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0

    function resetTilt() {
      cancelAnimationFrame(frame)
      balloons.forEach(balloon => balloon.style.removeProperty('--balloon-tilt'))
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !finePointer.matches) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // Read positions together before updating transforms; do not re-render on mouse movement.
        const angles = balloons.map(balloon => {
          const body = balloon.querySelector('ellipse')?.getBoundingClientRect()
          if (!body) return 0
          const dx = event.clientX - (body.left + body.width / 2)
          const dy = event.clientY - (body.top + body.height / 2)
          const closeness = Math.max(0, 1 - Math.hypot(dx, dy) / 180)
          return Math.max(-6, Math.min(6, dx / 14)) * closeness
        })
        balloons.forEach((balloon, index) => balloon.style.setProperty('--balloon-tilt', `${angles[index] ?? 0}deg`))
      })
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('blur', resetTilt)
    document.documentElement.addEventListener('pointerleave', resetTilt)
    finePointer.addEventListener('change', resetTilt)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', resetTilt)
      document.documentElement.removeEventListener('pointerleave', resetTilt)
      finePointer.removeEventListener('change', resetTilt)
      resetTilt()
    }
  }, [animated, motionEnabled])

  return (
    <svg ref={svgRef} className={`balloons ${animated ? 'balloons--animated' : ''}`} viewBox="0 0 460 390" aria-hidden="true" focusable="false">
      <g className="balloon-float balloon-float--coral">
        <g className="balloon-tilt">
          <g transform="translate(174 16) rotate(9 85 100)">
            <path d="M85 189 C43 239 127 249 89 324" fill="none" stroke="#9e473c" strokeWidth="3" />
            <ellipse cx="85" cy="95" rx="76" ry="91" fill="#ff8272" />
            <path d="M46 31 Q30 41 26 57 M110 27 Q127 30 139 44" fill="none" stroke="#ffd2bb" strokeWidth="11" strokeLinecap="round" />
            <path d="m85 185 -10 14 23 0Z" fill="#f36959" />
            <path d="M48 91 Q55 76 63 91 M108 91 Q115 76 123 91" fill="none" stroke="#102451" strokeWidth="5" strokeLinecap="round" />
            <path d="M72 110 Q88 136 105 110Z" fill="#102451" />
            <path d="M79 119 Q88 112 99 119 Q90 129 79 119" fill="#f65a69" />
          </g>
        </g>
      </g>
      <g className="balloon-float balloon-float--yellow">
        <g className="balloon-tilt">
          <g transform="translate(63 110) rotate(-13 65 80)">
            <path d="M65 156 C64 219 155 175 157 272" fill="none" stroke="#9e473c" strokeWidth="3" />
            <ellipse cx="65" cy="77" rx="58" ry="72" fill="#ffcf49" />
            <path d="M34 28 Q22 34 19 49 M85 23 l12 7" fill="none" stroke="#fff0b0" strokeWidth="9" strokeLinecap="round" />
            <path d="m65 148 -9 13 21 0Z" fill="#ffb824" />
            <path d="M34 77 Q41 66 48 77 M81 77 Q88 66 95 77" fill="none" stroke="#102451" strokeWidth="4" strokeLinecap="round" />
            <path d="M54 90 Q66 106 79 90Z" fill="#102451" />
          </g>
        </g>
      </g>
      <g className="balloon-float balloon-float--blue">
        <g className="balloon-tilt">
          <g transform="translate(328 143) rotate(13 50 65)">
            <path d="M50 131 C56 164 13 167 36 211" fill="none" stroke="#102451" strokeWidth="3" />
            <ellipse cx="50" cy="62" rx="47" ry="58" fill="#3dbbfa" />
            <path d="m27 20 -10 11 M67 16 Q77 20 83 31" fill="none" stroke="#9ee4ff" strokeWidth="8" strokeLinecap="round" />
            <path d="m50 119 -8 12 17 0Z" fill="#159cdb" />
            <path d="M24 62 Q30 52 36 62 M64 62 Q70 52 76 62 M41 72 Q50 86 59 72" fill="none" stroke="#102451" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  )
}

export function Landscape() {
  return (
    <svg className="landscape" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 156 Q150 100 290 153 Q465 0 660 151 Q850 45 1030 141 Q1240 55 1440 148 V260 H0Z" fill="#91cbd0" />
      <path d="M0 184 Q190 151 391 183 Q700 110 976 182 Q1220 139 1440 170 V260 H0Z" fill="#64cde4" />
      <path d="M0 183 Q160 148 390 230 Q590 255 806 230 Q1090 143 1440 189 V260 H0Z" fill="#bbd983" />
      <path d="M0 223 Q220 164 474 259 H0Z M919 260 Q1120 149 1440 220 V260Z" fill="#8ab963" />
      <path d="M0 260 V130 Q35 87 57 154 Q89 99 108 172 Q154 162 129 232 Q178 218 175 260Z M1440 260 V130 Q1399 95 1380 168 Q1350 117 1326 184 Q1281 173 1306 232 Q1268 226 1268 260Z" fill="#368d70" />
    </svg>
  )
}

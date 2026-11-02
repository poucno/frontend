import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useMotion } from '../hooks/useMotion'

export function IslandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <ellipse cx="31" cy="51" rx="28" ry="9" fill="#36b9e9" />
      <path d="M9 48 Q31 23 54 48 Q33 57 9 48" fill="#ffcf55" />
      <path d="M12 46 Q32 36 51 47" fill="none" stroke="#7db653" strokeWidth="5" strokeLinecap="round" />
      <path d="M31 43 Q38 23 30 14" fill="none" stroke="#a56643" strokeWidth="5" strokeLinecap="round" />
      <g className="palm-leaves">
        <path d="M30 16 Q14 5 12 22 M30 16 Q22 0 38 7 M30 16 Q48 1 51 20 M30 16 Q44 16 45 29 M30 16 Q20 13 20 30" fill="none" stroke="#138d61" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/* ---------- Balloons ---------- */

export type BalloonName = 'coral' | 'yellow' | 'blue'
const ORDER: BalloonName[] = ['coral', 'yellow', 'blue']

// Art is drawn once; `center` is where the confetti bursts, in viewBox units.
const BALLOON_ART: Record<BalloonName, { center: [number, number]; art: ReactNode }> = {
  coral: {
    center: [259, 111],
    art: (
      <g transform="translate(174 16) rotate(9 85 100)">
        <path d="M85 189 C43 239 127 249 89 324" fill="none" stroke="#9e473c" strokeWidth="3" />
        <ellipse cx="85" cy="95" rx="76" ry="91" fill="#ff8272" />
        <path d="M46 31 Q30 41 26 57 M110 27 Q127 30 139 44" fill="none" stroke="#ffd2bb" strokeWidth="11" strokeLinecap="round" />
        <path d="m85 185 -10 14 23 0Z" fill="#f36959" />
        <path d="M48 91 Q55 76 63 91 M108 91 Q115 76 123 91" fill="none" stroke="#102451" strokeWidth="5" strokeLinecap="round" />
        <path d="M72 110 Q88 136 105 110Z" fill="#102451" />
        <path d="M79 119 Q88 112 99 119 Q90 129 79 119" fill="#f65a69" />
      </g>
    ),
  },
  yellow: {
    center: [128, 187],
    art: (
      <g transform="translate(63 110) rotate(-13 65 80)">
        <path d="M65 156 C64 219 155 175 157 272" fill="none" stroke="#9e473c" strokeWidth="3" />
        <ellipse cx="65" cy="77" rx="58" ry="72" fill="#ffcf49" />
        <path d="M34 28 Q22 34 19 49 M85 23 l12 7" fill="none" stroke="#fff0b0" strokeWidth="9" strokeLinecap="round" />
        <path d="m65 148 -9 13 21 0Z" fill="#ffb824" />
        <path d="M34 77 Q41 66 48 77 M81 77 Q88 66 95 77" fill="none" stroke="#102451" strokeWidth="4" strokeLinecap="round" />
        <path d="M54 90 Q66 106 79 90Z" fill="#102451" />
      </g>
    ),
  },
  blue: {
    center: [378, 205],
    art: (
      <g transform="translate(328 143) rotate(13 50 65)">
        <path d="M50 131 C56 164 13 167 36 211" fill="none" stroke="#102451" strokeWidth="3" />
        <ellipse cx="50" cy="62" rx="47" ry="58" fill="#3dbbfa" />
        <path d="m27 20 -10 11 M67 16 Q77 20 83 31" fill="none" stroke="#9ee4ff" strokeWidth="8" strokeLinecap="round" />
        <path d="m50 119 -8 12 17 0Z" fill="#159cdb" />
        <path d="M24 62 Q30 52 36 62 M64 62 Q70 52 76 62 M41 72 Q50 86 59 72" fill="none" stroke="#102451" strokeWidth="4" strokeLinecap="round" />
      </g>
    ),
  },
}

const PRAISE = ['Hura!', 'Juhu!', 'Bravo!', 'Super!', 'Odlično!']
const CONFETTI = ['#ff8272', '#ffcf49', '#3dbbfa', '#fffdf4', '#7fd36b']
const POP_DURATION = 1700

type Piece = { dx: number; dy: number; spin: number; color: string; round: boolean }
type Burst = { id: number; name: BalloonName; cx: number; cy: number; word: string; pieces: Piece[] }

type BalloonsProps = {
  /** Floating, entrance animation and cursor tilt. */
  animated?: boolean
  /** Tapping a balloon pops it in a burst of confetti; it floats back a moment later. */
  interactive?: boolean
  /** Draw only some of the balloons. */
  only?: BalloonName[]
  /** With a single balloon, trim the empty space around it so it can be centred. */
  crop?: boolean
}

const CROPPED_VIEWBOX: Record<BalloonName, string> = { coral: '150 0 220 340', yellow: '40 95 170 190', blue: '305 125 150 245' }

export function Balloons({ animated = false, interactive = false, only, crop = false }: BalloonsProps) {
  const { motionEnabled } = useMotion()
  const svgRef = useRef<SVGSVGElement>(null)
  const [bursts, setBursts] = useState<Burst[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Set<number>())
  const canPop = interactive && motionEnabled

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(timer => window.clearTimeout(timer))
  }, [])

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

  function pop(name: BalloonName) {
    if (!canPop || bursts.some(burst => burst.name === name)) return
    const [cx, cy] = BALLOON_ART[name].center
    const id = nextId.current++
    const pieces: Piece[] = Array.from({ length: 18 }, (_, index) => {
      const angle = (index / 18) * Math.PI * 2 + Math.random() * 0.35
      const distance = 55 + Math.random() * 75
      return {
        dx: Math.round(Math.cos(angle) * distance),
        dy: Math.round(Math.sin(angle) * distance) - 24,
        spin: Math.round(Math.random() * 600 - 300),
        color: CONFETTI[index % CONFETTI.length] ?? '#ffcf49',
        round: index % 3 === 0,
      }
    })
    setBursts(current => [...current, { id, name, cx, cy, word: PRAISE[id % PRAISE.length] ?? 'Hura!', pieces }])
    const timer = window.setTimeout(() => {
      timers.current.delete(timer)
      setBursts(current => current.filter(burst => burst.id !== id))
    }, POP_DURATION)
    timers.current.add(timer)
  }

  const visible = ORDER.filter(name => !only || only.includes(name))
  const labels: Record<BalloonName, string> = { coral: 'Poči rdeč balon', yellow: 'Poči rumen balon', blue: 'Poči moder balon' }

  return (
    <svg ref={svgRef} className={`balloons ${animated ? 'balloons--animated' : ''} ${canPop ? 'balloons--interactive' : ''}`} viewBox={crop && only?.length === 1 && only[0] ? CROPPED_VIEWBOX[only[0]] : '0 0 460 390'} aria-hidden={!canPop} role={canPop ? 'group' : undefined} aria-label={canPop ? 'Pisani baloni' : undefined} focusable="false">
      {visible.map(name => (
        <g key={name} className={`balloon-enter balloon-enter--${name}`}>
          <g className={`balloon-float balloon-float--${name}`}>
            <g className="balloon-tilt">
              <g className={`balloon-pop ${bursts.some(burst => burst.name === name) ? 'is-popping' : ''}`} role={canPop ? 'button' : undefined} tabIndex={canPop ? 0 : undefined}
                aria-label={canPop ? labels[name] : undefined} aria-disabled={canPop ? bursts.some(burst => burst.name === name) : undefined}
                onClick={() => pop(name)} onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    pop(name)
                  }
                }}>
                {BALLOON_ART[name].art}
              </g>
            </g>
          </g>
        </g>
      ))}
      {bursts.map(burst => (
        <g key={burst.id} aria-hidden="true" className="burst" transform={`translate(${burst.cx} ${burst.cy})`}>
          {burst.pieces.map((piece, index) => {
            const style = { '--dx': `${piece.dx}px`, '--dy': `${piece.dy}px`, '--spin': `${piece.spin}deg` } as CSSProperties
            return piece.round
              ? <circle key={index} className="confetti" r="4.5" fill={piece.color} style={style} />
              : <rect key={index} className="confetti" x="-5" y="-3" width="10" height="6" rx="2" fill={piece.color} style={style} />
          })}
          <text className="burst-word" textAnchor="middle" y="-6">{burst.word}</text>
        </g>
      ))}
    </svg>
  )
}

/* ---------- Small balloon faces (used as icons) ---------- */

const TONES: Record<BalloonName, { body: string; knot: string; shine: string }> = {
  coral: { body: '#ff8272', knot: '#f36959', shine: '#ffd2bb' },
  yellow: { body: '#ffcf49', knot: '#ffb824', shine: '#fff0b0' },
  blue: { body: '#3dbbfa', knot: '#159cdb', shine: '#9ee4ff' },
}

/** A tiny balloon. With `mood="happy"` the face smiles; the editor uses this for the correct answer. */
export function BalloonIcon({ tone, mood = 'calm', className }: { tone: BalloonName; mood?: 'calm' | 'happy' | 'worried'; className?: string }) {
  const colors = TONES[tone]
  return (
    <svg className={className} viewBox="0 0 40 54" aria-hidden="true" focusable="false">
      <path className="balloon-icon-string" d="M20 40 C16 46 24 48 20 53" fill="none" stroke="#102451" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      <ellipse cx="20" cy="19" rx="16" ry="19" fill={colors.body} />
      <path d="M20 38 l-3.5 4.5 h7Z" fill={colors.knot} />
      <path d="M10 9 Q6 13 6 19" fill="none" stroke={colors.shine} strokeWidth="3.2" strokeLinecap="round" />
      {mood === 'happy' && <path d="M12 17 Q14.5 13 17 17 M23 17 Q25.5 13 28 17 M14.5 24 Q20 31 25.5 24Z" fill="#102451" stroke="#102451" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
      {mood === 'calm' && <path d="M14 18 v1.5 M26 18 v1.5 M16 25 Q20 27.5 24 25" fill="none" stroke="#102451" strokeWidth="2.4" strokeLinecap="round" />}
      {mood === 'worried' && <path d="M14 18 v2 M26 18 v2 M16 27 Q20 23.5 24 27" fill="none" stroke="#102451" strokeWidth="2.4" strokeLinecap="round" />}
    </svg>
  )
}

/** Three mini balloons for the game card. */
export function MiniBalloons() {
  return (
    <svg className="mini-balloons" viewBox="0 0 86 80" aria-hidden="true" focusable="false">
      <g className="mini-balloon mini-balloon--yellow"><g transform="translate(2 18) scale(.8)"><BalloonIconArt tone="yellow" /></g></g>
      <g className="mini-balloon mini-balloon--blue"><g transform="translate(52 22) scale(.7)"><BalloonIconArt tone="blue" /></g></g>
      <g className="mini-balloon mini-balloon--coral"><g transform="translate(24 2) scale(.95)"><BalloonIconArt tone="coral" /></g></g>
    </svg>
  )
}

function BalloonIconArt({ tone }: { tone: BalloonName }) {
  const colors = TONES[tone]
  return (
    <>
      <path d="M20 40 C16 46 24 48 20 53" fill="none" stroke="#102451" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
      <ellipse cx="20" cy="19" rx="16" ry="19" fill={colors.body} />
      <path d="M20 38 l-3.5 4.5 h7Z" fill={colors.knot} />
      <path d="M10 9 Q6 13 6 19" fill="none" stroke={colors.shine} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12 17 Q14.5 13 17 17 M23 17 Q25.5 13 28 17 M14.5 24 Q20 31 25.5 24Z" fill="#102451" stroke="#102451" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

/* ---------- Scenery ---------- */

function Island() {
  return (
    <svg className="landscape-island" viewBox="0 0 200 120" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="106" rx="96" ry="9" fill="#fff" opacity=".35" />
      <path d="M8 100 Q38 60 100 58 Q166 58 194 100 Q100 118 8 100Z" fill="#bbd983" />
      <path d="M8 100 Q100 118 194 100 Q190 110 100 113 Q14 110 8 100Z" fill="#8ab963" />
      <rect x="84" y="40" width="34" height="24" rx="2" fill="#fffdf4" />
      <path d="M79 43 L101 22 L123 43Z" fill="#e8604c" />
      <rect x="96" y="50" width="9" height="14" rx="2" fill="#a56643" />
      <rect x="87" y="46" width="6" height="6" rx="1" fill="#9ed9ee" />
      <rect x="120" y="28" width="13" height="36" fill="#fffdf4" />
      <path d="M117 30 L126.5 8 L136 30Z" fill="#e8604c" />
      <circle cx="52" cy="62" r="15" fill="#368d70" />
      <rect x="50" y="68" width="4" height="12" fill="#a56643" />
      <path d="M150 74 L161 40 L172 74Z" fill="#2f7d62" />
      <path d="M142 80 L158 50 L174 80Z" fill="#368d70" />
    </svg>
  )
}

function Sailboat() {
  return (
    <div className="landscape-boat">
      <svg viewBox="0 0 70 72" aria-hidden="true" focusable="false">
        <g className="boat-bob">
          <path d="M35 8 V54" stroke="#9e473c" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 10 L61 50 H38Z" fill="#fffdf4" />
          <path d="M32 20 L14 50 H32Z" fill="#ffe08a" />
          <path d="M8 54 H62 L54 64 H16Z" fill="#ff8272" />
        </g>
        <path d="M4 67 Q35 72 66 67" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".6" />
      </svg>
    </div>
  )
}

function Bush({ side }: { side: 'left' | 'right' }) {
  return (
    <svg className={`landscape-bush landscape-bush--${side}`} viewBox="0 0 300 200" aria-hidden="true" focusable="false">
      <g className="tree-sway tree-sway--slow">
        <rect x="58" y="86" width="9" height="90" rx="4" fill="#7a5a3c" />
        <ellipse cx="62" cy="70" rx="40" ry="56" fill="#2f7d62" />
        <ellipse cx="48" cy="64" rx="16" ry="30" fill="#3d9474" opacity=".7" />
      </g>
      <g className="tree-sway">
        <rect x="150" y="104" width="8" height="74" rx="4" fill="#7a5a3c" />
        <ellipse cx="154" cy="92" rx="34" ry="44" fill="#368d70" />
        <ellipse cx="142" cy="86" rx="12" ry="24" fill="#4aa57f" opacity=".7" />
      </g>
      <ellipse cx="110" cy="180" rx="74" ry="34" fill="#4aa56e" />
      <ellipse cx="206" cy="188" rx="64" ry="30" fill="#5db878" />
      <ellipse cx="22" cy="192" rx="42" ry="26" fill="#3f9d66" />
      <g>
        <circle className="flower" cx="92" cy="166" r="5" fill="#ffcf49" />
        <circle className="flower flower--late" cx="128" cy="172" r="4.5" fill="#fffdf4" />
        <circle className="flower" cx="196" cy="176" r="5" fill="#ff8272" />
        <circle className="flower flower--late" cx="236" cy="184" r="4" fill="#ffcf49" />
      </g>
    </svg>
  )
}

export function Landscape() {
  return (
    <div className="landscape" aria-hidden="true">
      <svg className="landscape-back" viewBox="0 0 1440 260" preserveAspectRatio="none" focusable="false">
        <path d="M0 156 Q150 100 290 153 Q465 0 660 151 Q850 45 1030 141 Q1240 55 1440 148 V260 H0Z" fill="#91cbd0" />
        <path d="M0 170 Q200 126 420 168 Q650 80 880 166 Q1130 100 1440 160 V260 H0Z" fill="#a8d8cf" opacity=".7" />
        <path d="M0 184 Q190 151 391 183 Q700 110 976 182 Q1220 139 1440 170 V260 H0Z" fill="#64cde4" />
        <g className="waves" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <path className="wave wave--a" d="M330 196 q14 -7 28 0 t28 0 t28 0" />
          <path className="wave wave--b" d="M650 204 q14 -7 28 0 t28 0 t28 0 t28 0" />
          <path className="wave wave--c" d="M980 194 q14 -7 28 0 t28 0 t28 0" />
          <path className="wave wave--b" d="M520 214 q14 -7 28 0 t28 0 t28 0" />
          <path className="wave wave--a" d="M1160 208 q14 -7 28 0 t28 0 t28 0" />
        </g>
      </svg>
      <Island />
      <Sailboat />
      {/* Land is drawn after the boat so it sails behind the meadow and trees. */}
      <svg className="landscape-land" viewBox="0 0 1440 260" preserveAspectRatio="none" focusable="false">
        <path d="M0 183 Q160 148 390 230 Q590 255 806 230 Q1090 143 1440 189 V260 H0Z" fill="#bbd983" />
        <path d="M0 223 Q220 164 474 259 H0Z M919 260 Q1120 149 1440 220 V260Z" fill="#8ab963" />
      </svg>
      <Bush side="left" />
      <Bush side="right" />
    </div>
  )
}

export function Birds() {
  return (
    <svg className="birds" viewBox="0 0 120 50" aria-hidden="true" focusable="false">
      {[[6, 22, 0], [48, 6, 0.35], [78, 30, 0.7]].map(([x, y, delay]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path className="bird" style={{ animationDelay: `${delay}s` } as CSSProperties} d="M0 8 Q7 0 14 8 Q21 0 28 8" fill="none" stroke="#102451" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  )
}

/* ---------- Subject tiles ---------- */

type Kind = 'math' | 'slovene' | 'english' | 'nature' | 'geography' | 'music' | 'other'

function kindOf(subject: string): Kind {
  // Strip diacritics so "Slovenščina" and "slovenscina" match the same way.
  const text = subject.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/^mat|matemat|racun|stevil/.test(text)) return 'math'
  if (/^slov|slovensc|knjizev|bralna/.test(text)) return 'slovene'
  if (/angl|engl|nemsk|italij|tuj/.test(text)) return 'english'
  if (/okol|narav|bio|kemij|fizik|znanost/.test(text)) return 'nature'
  if (/geo|zemljev|drzav/.test(text)) return 'geography'
  if (/glas|muzik|pesm/.test(text)) return 'music'
  return 'other'
}

export function SubjectTile({ subject, grade, size = 'md' }: { subject: string; grade: number; size?: 'md' | 'lg' }) {
  const kind = kindOf(subject)
  return (
    <span key={kind} className={`subject-tile subject-tile--${kind} subject-tile--${size}`} aria-hidden="true">
      {kind === 'math' && <span className="tile-glyph">×÷</span>}
      {kind === 'slovene' && <span className="tile-glyph">Abc</span>}
      {kind === 'english' && <span className="tile-glyph">Aa</span>}
      {kind === 'nature' && (
        <svg viewBox="0 0 32 32" focusable="false"><path d="M7 25C5 12 13 5 27 5c0 14-7 21-17 19" fill="currentColor" opacity=".9" /><path d="M7 26C11 18 16 13 22 10" fill="none" stroke="#fffdf4" strokeWidth="2" strokeLinecap="round" /></svg>
      )}
      {kind === 'geography' && (
        <svg viewBox="0 0 32 32" focusable="false"><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" /><path d="M5 16h22M16 5c-5 6-5 16 0 22M16 5c5 6 5 16 0 22" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      )}
      {kind === 'music' && (
        <svg viewBox="0 0 32 32" focusable="false"><path d="M12 24V8l13-3v16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /><circle cx="9" cy="24" r="4" fill="currentColor" /><circle cx="22" cy="21" r="4" fill="currentColor" /></svg>
      )}
      {kind === 'other' && <span className="tile-glyph">{grade}</span>}
    </span>
  )
}

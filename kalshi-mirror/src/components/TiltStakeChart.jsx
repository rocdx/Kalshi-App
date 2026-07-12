import { useMemo, useRef, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const BLUE = '#2563eb'
const RED = '#c0392b'

// How much each wheel "tick" zooms in/out, and the closest you can zoom in.
const ZOOM_IN_FACTOR = 0.85
const ZOOM_OUT_FACTOR = 1 / ZOOM_IN_FACTOR
const MIN_RANGE_MS = 60 * 60 * 1000 // 1 hour

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatAxisDate(ms) {
  const d = new Date(ms)
  return `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`
}

function formatFullDate(ms) {
  const d = new Date(ms)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const styles = {
  card: {
    marginTop: 24,
    padding: '20px 24px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#fff',
  },
  title: {
    margin: '0 0 4px',
    fontSize: 18,
    fontWeight: 600,
    color: '#08060d',
  },
  subtitle: {
    margin: '0 0 16px',
    fontSize: 13,
    color: '#6b6375',
  },
  tooltip: {
    background: '#fff',
    border: '1px solid #e5e4e7',
    borderRadius: 6,
    padding: '8px 12px',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  tooltipLabel: {
    margin: 0,
    fontWeight: 600,
    color: '#08060d',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 8,
    fontSize: 12,
    color: '#6b6375',
  },
  legendDots: {
    display: 'flex',
    gap: 16,
  },
  resetButton: {
    fontSize: 12,
    fontWeight: 600,
    color: '#2563eb',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  hint: {
    margin: '0 0 16px',
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6b6375',
  },
  chartWrap: {
    cursor: 'zoom-in',
  },
}

// Rug-plot style tick rising from the x-axis baseline, for each losing bet.
function LossTick({ cx, cy }) {
  if (cx == null || cy == null) return null
  return (
    <line
      x1={cx}
      x2={cx}
      y1={cy}
      y2={cy - 12}
      stroke={RED}
      strokeWidth={1.25}
      opacity={0.6}
    />
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload.find((p) => p.dataKey === 'rollingAvg')
  if (!point || point.value == null) return null

  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipLabel}>{formatFullDate(point.payload.time)}</p>
      <p style={{ margin: '4px 0 0', color: BLUE }}>
        ${point.value.toFixed(2)} avg stake (trailing window)
      </p>
    </div>
  )
}

export default function TiltStakeChart({ series, lossTicks, windowHours }) {
  const [zoomDomain, setZoomDomain] = useState(null)
  const hoverTimeRef = useRef(null)

  const fullDomain = useMemo(() => {
    const times = series.map((p) => p.time)
    return [Math.min(...times), Math.max(...times)]
  }, [series])

  function handleMouseMove(e) {
    if (e?.activeLabel != null) hoverTimeRef.current = e.activeLabel
  }

  function handleWheel(e) {
    e.preventDefault()

    const [d0, d1] = zoomDomain ?? fullDomain
    const anchor = hoverTimeRef.current ?? (d0 + d1) / 2
    const clampedAnchor = Math.min(Math.max(anchor, d0), d1)
    const factor = e.deltaY < 0 ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR

    let newD0 = clampedAnchor - (clampedAnchor - d0) * factor
    let newD1 = clampedAnchor + (d1 - clampedAnchor) * factor

    // Never zoom in tighter than MIN_RANGE_MS, never zoom out past the
    // actual data range.
    if (newD1 - newD0 < MIN_RANGE_MS) {
      const mid = (newD0 + newD1) / 2
      newD0 = mid - MIN_RANGE_MS / 2
      newD1 = mid + MIN_RANGE_MS / 2
    }
    newD0 = Math.max(newD0, fullDomain[0])
    newD1 = Math.min(newD1, fullDomain[1])

    if (newD0 <= fullDomain[0] && newD1 >= fullDomain[1]) {
      setZoomDomain(null)
    } else {
      setZoomDomain([newD0, newD1])
    }
  }

  const domain = zoomDomain ?? fullDomain

  return (
    <div style={styles.card}>
      <p style={styles.title}>
        Stake size over time (trailing {windowHours}h average)
      </p>
      <p style={styles.subtitle}>
        Each red tick is a losing bet. Watch for the blue line climbing
        shortly after a cluster of them — gaps in the line mean gaps in
        activity, not missing data.
      </p>
      <p style={styles.hint}>Scroll over the chart to zoom in and out.</p>
      <div style={styles.chartWrap} onWheel={handleWheel}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            onMouseMove={handleMouseMove}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
            <XAxis
              dataKey="time"
              type="number"
              domain={domain}
              allowDataOverflow
              tickFormatter={formatAxisDate}
              tick={{ fontSize: 12, fill: '#6b6375' }}
            />
            <YAxis
              yAxisId="stake"
              tick={{ fontSize: 12, fill: '#6b6375' }}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis yAxisId="ticks" domain={[0, 1]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="stake"
              data={series}
              type="monotone"
              dataKey="rollingAvg"
              stroke={BLUE}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Scatter
              yAxisId="ticks"
              data={lossTicks}
              dataKey="y"
              shape={<LossTick />}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={styles.legend}>
        <div style={styles.legendDots}>
          <span>
            <span style={{ color: BLUE, fontWeight: 700 }}>—</span> rolling
            avg stake
          </span>
          <span>
            <span style={{ color: RED, fontWeight: 700 }}>|</span> losing bet
          </span>
        </div>
        {zoomDomain && (
          <button
            type="button"
            style={styles.resetButton}
            onClick={() => setZoomDomain(null)}
          >
            Reset zoom
          </button>
        )}
      </div>
    </div>
  )
}

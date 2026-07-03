import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const GREEN = '#15803d'
const RED = '#c0392b'

const styles = {
  card: {
    marginTop: 24,
    padding: '20px 24px',
    border: '1px solid #e5e4e7',
    borderRadius: 8,
    background: '#fff',
  },
  title: {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 600,
    color: '#08060d',
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
  tooltipSub: {
    margin: '2px 0 0',
    fontSize: 11,
    color: '#6b6375',
  },
}

// Rounds up to the next round number matching the value's own magnitude —
// hundreds round to the next hundred, thousands to the next thousand, etc.
// (e.g. 3363 -> 4000, 363 -> 400) — instead of scaling the axis to the
// exact peak, which produces janky, non-round tick labels.
function niceCeiling(value) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  let top = Math.ceil(value / magnitude) * magnitude
  if (top === value) top += magnitude // guarantee headroom above the peak
  return top
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const color = point.netPnl >= 0 ? GREEN : RED

  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipLabel}>{point.rangeLabel}</p>
      <p style={{ margin: '4px 0 0', color }}>
        {point.netPnl >= 0 ? '+' : '-'}${Math.abs(point.netPnl).toFixed(2)}
      </p>
      <p style={styles.tooltipSub}>
        {point.betCount} bet{point.betCount === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export default function PnlTimelineChart({ data }) {
  // Symmetric domain around zero so 0 always lands in the vertical middle,
  // rounded up to a clean number with headroom above the actual peak.
  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.netPnl)))
  const axisMax = niceCeiling(maxAbs)
  const domain = [-axisMax, axisMax]

  // Cap rendered tick labels around ~15 to avoid crowding on histories with
  // many active days — every day is still a hoverable point either way,
  // this only skips which labels get drawn on the axis.
  const tickInterval = data.length > 15 ? Math.ceil(data.length / 15) - 1 : 0

  return (
    <div style={styles.card}>
      <p style={styles.title}>Net P&L by day</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#6b6375' }}
            interval={tickInterval}
          />
          <YAxis
            domain={domain}
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#6b6375' }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#aa3bff', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <ReferenceLine y={0} stroke="#6b6375" />
          <Line
            type="monotone"
            dataKey="netPnl"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

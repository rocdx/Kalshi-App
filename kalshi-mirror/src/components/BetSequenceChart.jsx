import {
  CartesianGrid,
  Line,
  LineChart,
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
    gap: 16,
    marginTop: 12,
    fontSize: 12,
    color: '#6b6375',
  },
  legendDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: 6,
  },
}

function OutcomeDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={payload.won ? GREEN : RED}
      stroke="#fff"
      strokeWidth={1}
    />
  )
}

function ActiveOutcomeDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={payload.won ? GREEN : RED}
      stroke="#fff"
      strokeWidth={2}
    />
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const color = point.won ? GREEN : RED

  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipLabel}>
        Bet #{point.index} · {point.sport}
      </p>
      <p style={{ margin: '4px 0 0', color, fontWeight: 700 }}>
        {point.won ? 'Won' : 'Lost'} — ${point.stake.toFixed(2)} staked
      </p>
    </div>
  )
}

export default function BetSequenceChart({ data }) {
  return (
    <div style={styles.card}>
      <p style={styles.title}>Stake size by bet, in order placed</p>
      <p style={styles.subtitle}>
        Watch for the stake line spiking right after clusters of red.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e7" />
          <XAxis
            dataKey="index"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 12, fill: '#6b6375' }}
            label={{
              value: 'Bet # (time order)',
              position: 'insideBottom',
              offset: -4,
              fontSize: 12,
              fill: '#6b6375',
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b6375' }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="linear"
            dataKey="stake"
            stroke="#94a3b8"
            strokeWidth={1.5}
            dot={<OutcomeDot />}
            activeDot={<ActiveOutcomeDot />}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={styles.legend}>
        <span>
          <span style={{ ...styles.legendDot, background: GREEN }} />
          Win
        </span>
        <span>
          <span style={{ ...styles.legendDot, background: RED }} />
          Loss
        </span>
      </div>
    </div>
  )
}

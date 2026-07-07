import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = [
  '#2563eb', '#aa3bff', '#15803d', '#c0392b',
  '#f59e0b', '#0891b2', '#db2777', '#6b6375',
]

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
    fontSize: 24,
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
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div style={styles.tooltip}>
      <p style={styles.tooltipLabel}>{point.sport}</p>
      <p style={{ margin: '4px 0 0' }}>
        {point.pct}% ({point.count} bet{point.count === 1 ? '' : 's'})
      </p>
    </div>
  )
}

export default function ConcentrationPieChart({ data }) {
  return (
    <div style={styles.card}>
      <p style={styles.title}>What you bet on</p>
      <ResponsiveContainer width="100%" height={420}>
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={data}
            dataKey="count"
            nameKey="sport"
            cx="50%"
            cy="42%"
            outerRadius={140}
            label={({ sport, pct }) => `${sport} ${pct}%`}
          >
            {data.map((entry, i) => (
              <Cell key={entry.sport} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: 16 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

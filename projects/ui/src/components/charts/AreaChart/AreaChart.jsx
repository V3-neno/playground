import { cx } from '../../../lib/cx'
import { LinePlot } from '../_shared/LinePlot'
import './AreaChart.css'

/** Volume over time. Overlapping (fading fills) or stacked (part-to-whole). Always starts at zero. */
export function AreaChart({ className, curve = 'smooth', stacked = false, ...props }) {
  return <LinePlot {...props} area stacked={stacked} curve={curve} kind="Area chart" className={cx('ui-area-chart', className)} />
}

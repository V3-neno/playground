import { cx } from '../../../lib/cx'
import { LinePlot } from '../_shared/LinePlot'
import './LineChart.css'

/** Change over time for one or more series. Crosshair tooltip, direct end labels for 2–4 series. */
export function LineChart({ className, curve = 'smooth', ...props }) {
  return <LinePlot {...props} curve={curve} kind="Line chart" className={cx('ui-line-chart', className)} />
}

import { useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx, useTilt } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import { useUI } from '../../../lib/ui-context'
import { Button } from '../../actions/Button/Button'
import { Blobs, SectionHeader } from '../_shared/SectionHeader'
import './PricingTable.css'

export const DEFAULT_PLANS = [
  {
    name: 'Starter',
    price: 0,
    blurb: 'For side projects and trying things out.',
    cta: 'Start for free',
    features: ['1 project', 'Community support', 'All 8 styles', 'Basic analytics'],
  },
  {
    name: 'Pro',
    price: 24,
    blurb: 'For growing teams that ship every week.',
    cta: 'Choose Pro',
    features: ['Unlimited projects', 'Priority support', 'Custom styles', 'Advanced analytics', 'Team roles'],
  },
  {
    name: 'Enterprise',
    price: 79,
    blurb: 'For organisations with serious requirements.',
    cta: 'Contact sales',
    features: ['Everything in Pro', 'SSO & audit logs', 'Dedicated manager', '99.99% SLA', 'On-prem option'],
  },
]

const COMPARISON = [
  ['Projects', '1', 'Unlimited', 'Unlimited'],
  ['Team members', '1', '10', 'Unlimited'],
  ['Custom styles', false, true, true],
  ['Analytics', 'Basic', 'Advanced', 'Advanced'],
  ['SSO', false, false, true],
  ['Support', 'Community', 'Priority', 'Dedicated'],
]

function BillingToggle({ value, onChange, discount }) {
  const options = [
    ['monthly', 'Monthly'],
    ['yearly', 'Yearly'],
  ]
  const refs = useRef([])
  const onKey = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const next = value === 'monthly' ? 'yearly' : 'monthly'
    onChange(next)
    refs.current[next === 'monthly' ? 0 : 1]?.focus()
  }
  return (
    <div className="ui-pricing__toggle" role="radiogroup" aria-label="Billing period" data-value={value}>
      <span className="ui-pricing__thumb" aria-hidden />
      {options.map(([id, label], i) => (
        <button
          key={id}
          ref={(el) => (refs.current[i] = el)}
          type="button"
          role="radio"
          aria-checked={value === id}
          tabIndex={value === id ? 0 : -1}
          onClick={() => onChange(id)}
          onKeyDown={onKey}
        >
          {label}
          {id === 'yearly' && discount > 0 && <span className="ui-pricing__save">−{discount}%</span>}
        </button>
      ))}
    </div>
  )
}

function Plan({ plan, billing, discount, currency, featured, selected, onSelect, fx, extra }) {
  const tilt = useTilt(fx, { max: 9, scale: 1.02 })
  const monthly = billing === 'yearly' ? Math.round(plan.price * (1 - discount / 100)) : plan.price
  const free = plan.price === 0
  return (
    <li ref={tilt} className={cx('ui-pricing__plan', 'ui-sec-card', featured && 'is-featured', selected && 'is-selected')}>
      {featured && <span className="ui-pricing__badge">Most popular</span>}
      <h3 className="ui-pricing__name ui-heading">{plan.name}</h3>
      <p className="ui-pricing__blurb">{plan.blurb}</p>
      <div className="ui-pricing__price" aria-live="polite">
        <span className="ui-pricing__currency">{currency}</span>
        <span key={`${plan.name}-${monthly}`} className="ui-pricing__amount ui-heading">
          {monthly}
        </span>
        <span className="ui-pricing__per">
          {free ? 'forever' : '/ month'}
          {!free && billing === 'yearly' && <small>billed yearly</small>}
        </span>
      </div>
      <Button
        className="ui-pricing__cta"
        variant={featured ? 'solid' : 'outline'}
        aria-pressed={selected}
        icon={selected ? 'check' : undefined}
        onClick={(e) => {
          onSelect(plan.name)
          if (fx) burst(e, { count: 40, spread: 180, shapes: ['🎉', '✨', '💸', 'star', 'strip', 'circle'] })
        }}
      >
        {selected ? 'Selected' : plan.cta}
      </Button>
      <ul className="ui-pricing__features">
        {plan.features.map((f) => (
          <li key={f}>
            <Icon name="check" size={15} /> {f}
          </li>
        ))}
      </ul>
      {extra && <span className="ui-pricing__holo" aria-hidden />}
    </li>
  )
}

export function PricingTable({
  eyebrow = 'Pricing',
  title = 'Simple pricing, no surprises',
  highlight = 'no surprises',
  lead = 'Start free. Upgrade when it clicks. Every plan includes every style.',
  plans = DEFAULT_PLANS,
  featured = 'Pro',
  discount = 20,
  currency = '$',
  defaultBilling = 'monthly',
  comparison = false,
  className,
}) {
  const [billing, setBilling] = useState(defaultBilling)
  const [selected, setSelected] = useState(null)
  const fx = useFx()
  const { style } = useUI()
  const id = useId()
  return (
    <section className={cx('ui-sec', 'ui-pricing', className)} aria-labelledby={title ? id : undefined}>
      <Blobs />
      <div className="ui-sec__inner">
        <SectionHeader id={id} eyebrow={eyebrow} title={title} highlight={highlight} lead={lead} />
        <div className="ui-pricing__toggle-wrap">
          <BillingToggle value={billing} onChange={setBilling} discount={discount} />
        </div>
        <ul className="ui-pricing__plans" style={{ '--_n': plans.length }}>
          {plans.map((p) => (
            <Plan
              key={p.name}
              plan={p}
              billing={billing}
              discount={discount}
              currency={currency}
              featured={p.name === featured}
              selected={selected === p.name}
              onSelect={setSelected}
              fx={fx}
              extra={style === 'extra'}
            />
          ))}
        </ul>
        {comparison && (
          <div className="ui-pricing__compare ui-sec-card">
            <table>
              <caption className="ui-sr-only">Plan comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {plans.map((p) => (
                    <th key={p.name} scope="col" className={cx(p.name === featured && 'is-featured')}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([label, ...vals]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {vals.map((v, i) => (
                      <td key={i} className={cx(plans[i]?.name === featured && 'is-featured')}>
                        {v === true ? (
                          <Icon name="check" size={16} aria-label="Included" className="ui-pricing__yes" />
                        ) : v === false ? (
                          <Icon name="minus" size={16} aria-label="Not included" className="ui-pricing__no" />
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

import { useId, useRef, useState } from 'react'
import { cx } from '../../../lib/cx'
import { sparkle, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import { Button } from '../../actions/Button/Button'
import { Blobs, SectionHeader } from '../_shared/SectionHeader'
import './FAQ.css'

export const DEFAULT_FAQ = [
  { q: 'Can I switch styles after launch?', a: 'Yes. Styles are just design tokens, so changing one attribute restyles every component on the page. Nothing in your markup changes.' },
  { q: 'Is there a free plan?', a: 'The Starter plan is free forever for one project. Upgrade only when you need more projects, seats or analytics.' },
  { q: 'Do you support dark mode?', a: 'Every style ships a light and a dark theme, and components follow whichever one is active.' },
  { q: 'What about accessibility?', a: 'Components use semantic HTML, proper ARIA, visible focus rings and honour reduced-motion preferences. The Extra style turns its confetti off when you ask it to.' },
  { q: 'Can I cancel anytime?', a: 'Of course. Cancel from your settings page in two clicks; you keep access until the end of the billing period.' },
  { q: 'Why is there a style called Extra?', a: 'Because sometimes a button should explode into confetti. It is completely unnecessary, and that is the point.' },
]

export function FAQ({
  variant = 'centered', // centered | split
  eyebrow = 'FAQ',
  title = 'Questions, answered',
  highlight = 'answered',
  lead = 'Everything you wanted to know and a few things you didn’t.',
  items = DEFAULT_FAQ,
  multiple = false,
  defaultOpen = 0,
  contact = true,
  className,
}) {
  const [open, setOpen] = useState(() => new Set(defaultOpen == null || defaultOpen < 0 ? [] : [defaultOpen]))
  const fx = useFx()
  const id = useId()
  const buttons = useRef([])

  const toggle = (i, el) => {
    if (fx && !open.has(i)) sparkle(el)
    setOpen((prev) => {
      const next = new Set(multiple ? prev : [])
      if (prev.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  // Up/Down/Home/End move between questions (WAI-ARIA accordion pattern)
  const onKey = (e, i) => {
    const n = items.length
    const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: n - 1 }[e.key]
    if (to === undefined) return
    e.preventDefault()
    buttons.current[(to + n) % n]?.focus()
  }

  return (
    <section className={cx('ui-sec', 'ui-faq', `ui-faq--${variant}`, className)} aria-labelledby={title ? id : undefined}>
      <Blobs />
      <div className="ui-sec__inner ui-faq__inner">
        <div className="ui-faq__intro">
          <SectionHeader id={id} eyebrow={eyebrow} title={title} highlight={highlight} lead={lead} align={variant === 'split' ? 'left' : 'center'} />
          {contact && variant === 'split' && <Contact />}
        </div>
        <div className="ui-faq__list">
          {items.map((item, i) => {
            const isOpen = open.has(i)
            return (
              <div key={item.q} className={cx('ui-faq__item', isOpen && 'is-open')}>
                <h3 className="ui-faq__q">
                  <button
                    ref={(el) => (buttons.current[i] = el)}
                    type="button"
                    id={`${id}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-a${i}`}
                    onClick={(e) => toggle(i, e.currentTarget)}
                    onKeyDown={(e) => onKey(e, i)}
                  >
                    <span>{item.q}</span>
                    <span className="ui-faq__icon" aria-hidden>
                      <Icon name="plus" size={18} />
                    </span>
                  </button>
                </h3>
                <div className="ui-faq__a" id={`${id}-a${i}`} role="region" aria-labelledby={`${id}-q${i}`} inert={!isOpen || undefined}>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {contact && variant !== 'split' && <Contact />}
      </div>
    </section>
  )
}

function Contact() {
  return (
    <div className="ui-faq__contact">
      <Icon name="message" size={20} />
      <span>
        <strong>Still have questions?</strong>
        <small>Our team replies in minutes, not days.</small>
      </span>
      <Button variant="outline" size="sm">
        Contact us
      </Button>
    </div>
  )
}

import { useId, useState } from 'react'
import { cx } from '../../../lib/cx'
import { burst, useFx } from '../../../lib/fx'
import { Icon } from '../../../lib/icons'
import { useUI } from '../../../lib/ui-context'
import { Button } from '../../actions/Button/Button'
import './Footer.css'

export const DEFAULT_COLUMNS = [
  { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Integrations'] },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press kit'] },
  { title: 'Resources', links: ['Docs', 'Guides', 'Community', 'Status', 'Support'] },
]

const SOCIALS = [
  { icon: 'globe', label: 'Website' },
  { icon: 'message', label: 'Community chat' },
  { icon: 'mail', label: 'Email' },
  { icon: 'rocket', label: 'Product Hunt' },
]

const LEGAL = ['Privacy', 'Terms', 'Cookies']

const noNav = (e) => e.preventDefault()

function Newsletter({ fx }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | error | done
  const id = useId()
  const submit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error')
      return
    }
    setState('done')
    if (fx) burst(e.currentTarget.querySelector('button'), { count: 34, spread: 150, shapes: ['💌', '✨', '📬', 'star', 'circle'] })
  }
  return (
    <form className="ui-footer__news" onSubmit={submit} noValidate>
      <label htmlFor={id} className="ui-footer__news-label">
        Get the newsletter
      </label>
      <p className="ui-footer__muted">One email a month. Zero spam. Unsubscribe anytime.</p>
      <div className="ui-footer__news-row">
        <input
          id={id}
          type="email"
          placeholder="you@company.com"
          value={email}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={`${id}-status`}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state !== 'idle') setState('idle')
          }}
        />
        <Button type="submit" icon={state === 'done' ? 'check' : undefined}>
          {state === 'done' ? 'Subscribed' : 'Subscribe'}
        </Button>
      </div>
      <p id={`${id}-status`} className={cx('ui-footer__status', state === 'error' && 'is-error')} aria-live="polite">
        {state === 'error' && 'Please enter a valid email address.'}
        {state === 'done' && 'Thanks! Check your inbox to confirm.'}
      </p>
    </form>
  )
}

function Brand({ name }) {
  return (
    <a className="ui-footer__brand" href="#" onClick={noNav}>
      <span className="ui-footer__logo" aria-hidden>
        <Icon name="sparkles" size={18} />
      </span>
      <span className="ui-heading">{name}</span>
    </a>
  )
}

function Socials() {
  return (
    <ul className="ui-footer__socials">
      {SOCIALS.map((s) => (
        <li key={s.icon}>
          <a href="#" onClick={noNav} aria-label={s.label}>
            <Icon name={s.icon} size={18} />
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Footer({
  variant = 'columns', // columns | simple | mega
  brand = 'Lumen',
  tagline = 'Components in eight styles, from boardroom to completely unnecessary.',
  columns = DEFAULT_COLUMNS,
  newsletter = true,
  className,
}) {
  const fx = useFx()
  const { style } = useUI()
  const year = new Date().getFullYear()

  if (variant === 'simple') {
    return (
      <footer className={cx('ui-footer', 'ui-footer--simple', className)}>
        <div className="ui-footer__inner">
          <Brand name={brand} />
          <nav aria-label="Footer">
            <ul className="ui-footer__inline">
              {columns.flatMap((c) => c.links.slice(0, 2)).map((l) => (
                <li key={l}>
                  <a href="#" onClick={noNav}>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Socials />
        </div>
        <p className="ui-footer__copy">
          © {year} {brand}. All rights reserved.
        </p>
      </footer>
    )
  }

  return (
    <footer className={cx('ui-footer', `ui-footer--${variant}`, className)}>
      <div className="ui-footer__inner">
        <div className="ui-footer__top">
          <div className="ui-footer__about">
            <Brand name={brand} />
            <p className="ui-footer__muted">{tagline}</p>
            <Socials />
          </div>
          <nav className="ui-footer__cols" aria-label="Footer">
            {columns.map((c) => (
              <div key={c.title} className="ui-footer__col">
                <h3 className="ui-footer__col-title">{c.title}</h3>
                <ul>
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" onClick={noNav}>
                        {l}
                      </a>
                      {l === 'Careers' && <span className="ui-footer__pill">Hiring</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {newsletter && <Newsletter fx={fx} />}
        </div>
        <div className="ui-footer__bottom">
          <p className="ui-footer__copy">
            © {year} {brand}, Inc.
          </p>
          <ul className="ui-footer__inline">
            {LEGAL.map((l) => (
              <li key={l}>
                <a href="#" onClick={noNav}>
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <span className="ui-footer__status-pill">
            <i aria-hidden /> All systems normal
          </span>
        </div>
      </div>
      {variant === 'mega' && (
        <div className="ui-footer__mega ui-heading" aria-hidden>
          {[...brand].map((ch, i) => (
            <span key={i} style={{ '--_i': i }} className={style === 'extra' ? 'ui-gradient-text' : undefined}>
              {ch}
            </span>
          ))}
        </div>
      )}
    </footer>
  )
}

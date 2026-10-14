/** Join class names, skipping falsy values: cx('a', on && 'b') */
export const cx = (...names) => names.filter(Boolean).join(' ')

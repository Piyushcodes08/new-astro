import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Reusable Button component
 *
 * Props:
 *  variant  : "primary" | "secondary" | "outline" | "ghost"   (default: "primary")
 *  size     : "sm" | "md" | "lg"                              (default: "md")
 *  to       : string  → renders as <Link> instead of <button>
 *  href     : string  → renders as <a> (external link)
 *  arrow    : boolean → shows trailing arrow icon
 *  fullWidth: boolean → 100% width
 *  disabled : boolean
 *  type     : "button" | "submit" | "reset"                   (default: "button")
 *  onClick, className, children — standard props
 */
const Button = forwardRef(({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  to,
  href,
  arrow = false,
  fullWidth = false,
  disabled = false,
  ...rest
}, ref) => {

  const base = 'btn-base';

  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    outline:   'btn-outline',
    ghost:     'btn-ghost',
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size] || 'btn-md';

  const combined = [
    base,
    variantClass,
    sizeClass,
    fullWidth ? 'btn-full' : '',
    disabled ? 'btn-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {children}
      {arrow && (
        <svg
          className="btn-arrow"
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
    </>
  );

  // Render as React Router <Link>
  if (to) {
    return (
      <Link to={to} className={combined} ref={ref} {...rest}>
        {content}
      </Link>
    );
  }

  // Render as external <a>
  if (href) {
    return (
      <a href={href} className={combined} target="_blank" rel="noopener noreferrer" ref={ref} {...rest}>
        {content}
      </a>
    );
  }

  // Default <button>
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combined}
      ref={ref}
      {...rest}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'coral' | 'purple' | 'blue' | 'teal' | 'amber' | 'lavender' | 'mint' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const variantStyles: Record<string, string> = {
    coral:    'badge-coral font-medium',
    purple:   'badge-purple font-medium',
    blue:     'badge-blue font-medium',
    teal:     'badge-teal font-medium',
    amber:    'badge-amber font-medium',
    lavender: 'badge-lavender font-medium',
    mint:     'badge-mint font-medium',
    neutral:  'font-normal',
  };

  const neutralStyle = variant === 'neutral' ? {
    background: 'var(--color-bg-subtle)',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-border)',
  } : {};

  const sizeStyles: Record<string, string> = {
    sm: 'text-[10px] px-2 py-0.5 rounded-[6px]',
    md: 'text-xs px-2.5 py-1 rounded-[8px]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 tracking-tight font-mono ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={neutralStyle}
    >
      {children}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string; className?: string }> = ({ category, className }) => {
  const cat = category.toLowerCase();
  let variant: BadgeProps['variant'] = 'blue';

  if (cat.includes('sustain') || cat.includes('eco') || cat.includes('agri')) variant = 'mint';
  else if (cat.includes('health') || cat.includes('well'))                    variant = 'coral';
  else if (cat.includes('edu') || cat.includes('research'))                   variant = 'lavender';
  else if (cat.includes('fin') || cat.includes('crypto'))                     variant = 'amber';
  else if (cat.includes('design') || cat.includes('creator'))                 variant = 'purple';
  else if (cat.includes('commun'))                                            variant = 'teal';
  else if (cat.includes('ai') || cat.includes('tech') || cat.includes('prod') || cat.includes('innov')) variant = 'blue';

  return <Badge variant={variant} className={className}>{category}</Badge>;
};

export const TypeBadge: React.FC<{ type: 'idea' | 'product' | 'startup' | string; className?: string }> = ({ type, className }) => {
  const configs: Record<string, { label: string; bg: string; color: string; border: string }> = {
    idea:    { label: 'IDEA',    bg: 'rgba(232,182,83,0.1)',  color: '#A07B10', border: 'rgba(232,182,83,0.25)'  },
    product: { label: 'PRODUCT', bg: 'rgba(143,166,221,0.1)', color: '#4E6BAF', border: 'rgba(143,166,221,0.25)' },
    startup: { label: 'STARTUP', bg: 'rgba(230,111,130,0.1)', color: '#B84F62', border: 'rgba(230,111,130,0.25)' },
  };

  const cfg = configs[type] ?? { label: type.toUpperCase(), bg: 'var(--color-bg-subtle)', color: 'var(--color-muted)', border: 'var(--color-border)' };

  return (
    <span
      className={`font-mono font-semibold uppercase tracking-wider ${className}`}
      style={{
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '6px',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const configs: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    draft:        { label: 'DRAFT',         bg: 'rgba(140,137,144,0.1)', color: '#62616A', border: 'rgba(140,137,144,0.2)', dot: '#8C8990' },
    under_review: { label: 'UNDER REVIEW',  bg: 'rgba(143,166,221,0.1)', color: '#4E6BAF', border: 'rgba(143,166,221,0.22)', dot: '#8FA6DD' },
    published:    { label: 'PUBLISHED',     bg: 'rgba(121,197,181,0.1)', color: '#3D8F80', border: 'rgba(121,197,181,0.22)', dot: '#79C5B5' },
    validated:    { label: 'VALIDATED',     bg: 'rgba(121,197,181,0.1)', color: '#3D8F80', border: 'rgba(121,197,181,0.22)', dot: '#79C5B5' },
    archived:     { label: 'ARCHIVED',      bg: 'rgba(140,137,144,0.08)', color: '#8C8990', border: 'rgba(140,137,144,0.15)', dot: '#8C8990' },
  };

  const cfg = configs[status] ?? { label: status.toUpperCase(), bg: 'var(--color-bg-subtle)', color: 'var(--color-muted)', border: 'var(--color-border)', dot: '#8C8990' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider ${className}`}
      style={{
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '6px',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

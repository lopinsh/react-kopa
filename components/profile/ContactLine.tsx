import { clsx } from 'clsx';
import { getTranslations } from 'next-intl/server';
import { contactHref } from '@/lib/contact-link';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';

/** One quiet line: the label and the contact as plain text (R32); a link only when the whole value is one email, phone number or URL. */
export default async function ContactLine({ contact, compact = false }: { contact: string; compact?: boolean }) {
    const t = await getTranslations('profile.contact');
    const link = contactHref(contact);
    return (
        <p className={clsx('[overflow-wrap:anywhere]', compact ? 'text-meta' : 'text-body-sm')}>
            <span className="text-foreground-muted">{t('label')} </span>
            {link ? (
                <a
                    href={link.href}
                    className={TEXT_LINK_CLASS}
                    {...(link.external ? { target: '_blank', rel: 'nofollow noopener noreferrer ugc' } : {})}
                >
                    {contact}
                </a>
            ) : (
                <span className="text-foreground">{contact}</span>
            )}
        </p>
    );
}

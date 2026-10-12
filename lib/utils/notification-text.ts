import type { useTranslations } from 'next-intl';

type NotificationArgs = Record<string, string | number | undefined>;
type NotificationTranslator = ReturnType<typeof useTranslations<'notifications'>>;

// Types whose detail line is something a person wrote, shown in quotes.
const QUOTED_TYPES = new Set(['JOIN_REQUEST', 'APPLICATION_RECEIVED', 'INQUIRY_RECEIVED', 'APPLICATION_INQUIRY', 'NEW_POST', 'ADMIN_FEEDBACK']);
const KNOWN_TYPES = new Set(['JOIN_REQUEST', 'APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'REQUEST_APPROVED', 'APPLICATION_INQUIRY', 'INQUIRY_RECEIVED', 'NEW_POST', 'NEW_EVENT', 'TAG_MERGED', 'GROUP_HIDDEN', 'GROUP_DELETED', 'EVENT_REQUEST', 'EVENT_APPROVED', 'EVENT_DECLINED', 'EVENT_LET_IN', 'EVENT_SPOT_FREED', 'EVENT_ROOM_AGAIN', 'EVENT_NOW_OPEN', 'EVENT_CANCELLED', 'OWNERSHIP_TRANSFERRED', 'ADMIN_GRANTED', 'ADMIN_REVOKED', 'ADMIN_REPORT', 'ADMIN_TAG_PENDING', 'ADMIN_SUGGESTION', 'ADMIN_FEEDBACK', 'ADMIN_GROUP_HIDDEN', 'ADMIN_CITY_PENDING', 'CITY_APPROVED', 'CITY_REJECTED']);

export interface NotificationText {
    headline: string;
    /** Short detail (already quoted where a person wrote it), or undefined. */
    detail: string | undefined;
    /** Group name from the payload, used when the row has no resolved group. */
    groupName: string | undefined;
}

/** The one place a stored notification (type + JSON message) becomes localized text; used by the bell and the toast. */
export function formatNotificationText(t: NotificationTranslator, type: string, message: string, locale?: string): NotificationText {
    let args: NotificationArgs = {};
    try {
        args = (JSON.parse(message) as { args?: NotificationArgs }).args ?? {};
    } catch {
        // Malformed legacy payload: render the headline without arguments.
    }
    const known = KNOWN_TYPES.has(type) ? type : 'GENERIC';
    const headline = t(`headline.${known}` as 'headline.GENERIC', {
        authorName: args.authorName ? String(args.authorName) : t('someone'),
        originalTag: String(args.originalTag ?? ''),
        // Tag merges store both names; the viewer gets the one in their language.
        canonicalTag: String((locale === 'en' ? args.canonicalTagEn : locale === 'lv' ? args.canonicalTagLv : undefined) ?? args.canonicalTag ?? ''),
        // City notices store both names too; older ones only have `cityName`.
        cityName: String((locale === 'en' ? args.cityNameEn : locale === 'lv' ? args.cityNameLv : undefined) ?? args.cityName ?? args.cityNameLv ?? ''),
        waitlistCount: Number(args.waitlistCount ?? 0)
    });
    // Older notifications stored the event title as `title`.
    const raw = args.excerpt ?? args.reason ?? args.eventTitle ?? args.title;
    const detail = raw === undefined || raw === '' ? undefined : (QUOTED_TYPES.has(type) ? `“${raw}”` : String(raw));
    return { headline, detail, groupName: args.groupName === undefined ? undefined : String(args.groupName) };
}

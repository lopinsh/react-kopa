import {
    Bell, CalendarDays, CalendarX, Crown, EyeOff, Flag, Lightbulb, List, MapPin, MessageCircle, Shield, Tag, Trash2, UserCheck, UserPlus, UserX,
    type LucideIcon,
} from 'lucide-react';

/** The one map from a notification's type to its icon (the bell's rows and Paziņojumi); unknown types get the bell. */
const ICONS: Record<string, LucideIcon> = {
    JOIN_REQUEST: UserPlus,
    APPLICATION_RECEIVED: UserPlus,
    APPLICATION_ACCEPTED: UserCheck,
    REQUEST_APPROVED: UserCheck,
    APPLICATION_DECLINED: UserX,
    APPLICATION_INQUIRY: MessageCircle,
    INQUIRY_RECEIVED: MessageCircle,
    NEW_POST: List,
    NEW_EVENT: CalendarDays,
    EVENT_REQUEST: CalendarDays,
    EVENT_APPROVED: CalendarDays,
    EVENT_DECLINED: CalendarX,
    EVENT_LET_IN: CalendarDays,
    EVENT_SPOT_FREED: CalendarDays,
    EVENT_ROOM_AGAIN: CalendarDays,
    EVENT_NOW_OPEN: CalendarDays,
    EVENT_CANCELLED: CalendarX,
    EVENT_REMOVED: CalendarX,
    TAG_MERGED: Tag,
    GROUP_HIDDEN: EyeOff,
    GROUP_DELETED: Trash2,
    OWNERSHIP_TRANSFERRED: Crown,
    ADMIN_GRANTED: Shield,
    ADMIN_REVOKED: Shield,
    ADMIN_REPORT: Flag,
    ADMIN_TAG_PENDING: Tag,
    ADMIN_SUGGESTION: Lightbulb,
    ADMIN_FEEDBACK: MessageCircle,
    ADMIN_GROUP_HIDDEN: EyeOff,
    ADMIN_CITY_PENDING: MapPin,
    CITY_APPROVED: MapPin,
    CITY_REJECTED: MapPin,
};

export function notificationIcon(type: string): LucideIcon {
    return ICONS[type] ?? Bell;
}

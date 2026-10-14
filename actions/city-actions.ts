'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { ActionResponse, ErrorCode } from '@/types/actions';
import { handleActionError, validateActionData, requireSiteAdmin } from '@/lib/action-utils';
import { CITIES_TAG, CityService } from '@/lib/services/city.service';
import { NotificationService } from '@/lib/services/notification.service';
import { cityNameSchema, cityNamesSchema, type CityNamesInput } from '@/lib/validations/city';

const KNOWN_CITY_ERRORS: ErrorCode[] = ['NOT_FOUND', 'CITY_EXISTS', 'CITY_IN_USE', 'CREATE_FAILED'];

function mapCityError(error: unknown, fallback: ErrorCode): ActionResponse<never> {
    if (error instanceof Error && KNOWN_CITY_ERRORS.includes(error.message as ErrorCode)) {
        return { success: false, error: error.message as ErrorCode };
    }
    return handleActionError(error, fallback);
}

/** Cities show in pickers, filters, group pages and the admin: refresh them all after a change. */
function refreshCities(): void {
    updateTag(CITIES_TAG);
    revalidatePath('/', 'layout');
}

/**
 * A group creator or owner suggests a city that is not in the list. The city is usable at once
 * (the group is saved with it) and waits for a site admin. A name that already exists is reused.
 */
export async function suggestCity(name: string): Promise<ActionResponse<{ slug: string; name: string; status: 'ACTIVE' | 'PENDING_REVIEW' }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    const parsed = cityNameSchema.safeParse(name);
    if (!parsed.success) return { success: false, error: 'CITY_NAME_INVALID' };

    try {
        const city = await CityService.suggest({ name: parsed.data, userId: session.user.id });

        // A reused suggestion was already announced when it was first made.
        if (city.created) {
            await NotificationService.notifyAdmins({
                type: 'ADMIN_CITY_PENDING',
                args: { title: city.name },
                link: '/admin/locations',
                exceptUserId: session.user.id,
            });
            refreshCities();
        }

        return { success: true, data: { slug: city.slug, name: city.name, status: city.status } };
    } catch (error) {
        return mapCityError(error, 'CREATE_FAILED');
    }
}

export async function approveCity(id: string, names: CityNamesInput): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    const valid = await validateActionData(cityNamesSchema, names);
    if (!valid.success) return { success: false, error: 'CITY_NAME_INVALID' };

    try {
        const result = await CityService.approve(id, valid.data);
        if (result.submittedById && result.submittedById !== admin.userId) {
            const submitterId = result.submittedById;
            const ownGroup = result.groups.find((g) => g.ownerIds.includes(submitterId));
            await NotificationService.notify({
                userId: submitterId,
                type: 'CITY_APPROVED',
                translationKey: 'CITY_APPROVED',
                args: { cityNameLv: result.nameLv, cityNameEn: result.nameEn },
                // The submitter's own group with this city, else discovery filtered by the city.
                link: ownGroup ? `/${ownGroup.l1Slug}/group/${ownGroup.slug}` : `/?city=${encodeURIComponent(result.slug)}`,
            });
        }
        refreshCities();
        return { success: true };
    } catch (error) {
        return mapCityError(error, 'UPDATE_FAILED');
    }
}

/** The city is removed; each group that used it has no city until its owner picks one, and the owner is told. */
export async function rejectCity(id: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;

    try {
        const result = await CityService.reject(id);
        const told = new Set<string>();
        for (const group of result.groups) {
            for (const ownerId of group.ownerIds) {
                told.add(ownerId);
                await NotificationService.notify({
                    userId: ownerId,
                    type: 'CITY_REJECTED',
                    translationKey: 'CITY_REJECTED',
                    args: { cityNameLv: result.nameLv, cityNameEn: result.nameEn, groupName: group.name },
                    link: `/${group.l1Slug}/group/${group.slug}/settings`,
                });
            }
            revalidatePath(`/lv/${group.l1Slug}/group/${group.slug}`, 'page');
            revalidatePath(`/en/${group.l1Slug}/group/${group.slug}`, 'page');
        }
        // A suggester without a group (for example the group was deleted) still hears about it.
        if (result.submittedById && !told.has(result.submittedById) && result.submittedById !== admin.userId) {
            await NotificationService.notify({
                userId: result.submittedById,
                type: 'CITY_REJECTED',
                translationKey: 'CITY_REJECTED',
                args: { cityNameLv: result.nameLv, cityNameEn: result.nameEn },
            });
        }
        refreshCities();
        // The groups and events that had the city lost it: lists and counts change.
        updateTag('groups');
        updateTag('events');
        return { success: true };
    } catch (error) {
        return mapCityError(error, 'DELETE_FAILED');
    }
}

export async function createCity(names: CityNamesInput): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    const valid = await validateActionData(cityNamesSchema, names);
    if (!valid.success) return { success: false, error: 'CITY_NAME_INVALID' };

    try {
        await CityService.createActive(valid.data);
        refreshCities();
        return { success: true };
    } catch (error) {
        return mapCityError(error, 'CREATE_FAILED');
    }
}

export async function renameCity(id: string, names: CityNamesInput): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    const valid = await validateActionData(cityNamesSchema, names);
    if (!valid.success) return { success: false, error: 'CITY_NAME_INVALID' };

    try {
        await CityService.updateNames(id, valid.data);
        refreshCities();
        return { success: true };
    } catch (error) {
        return mapCityError(error, 'UPDATE_FAILED');
    }
}

export async function deleteCity(id: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;

    try {
        await CityService.deleteUnused(id);
        refreshCities();
        return { success: true };
    } catch (error) {
        return mapCityError(error, 'DELETE_FAILED');
    }
}

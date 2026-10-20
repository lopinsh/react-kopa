import RequestRow from './RequestRow';
import type { MyRequest } from '@/lib/types/own-area';

/** Tavi pieteikumi (AR-61): quiet and apart (outlined, no fill); it ends the page, nothing is suggested below it. */
export default function YourRequestsSection({ requests }: { requests: MyRequest[] }) {
    return (
        <ul className="rounded-2xl line">
            {requests.map((r) => <RequestRow key={r.groupId} request={r} />)}
        </ul>
    );
}

import { WebAPICallResult } from '../WebClient';
export declare type ConversationsListResponse = WebAPICallResult & {
    ok?: boolean;
    channels?: Channel[];
    response_metadata?: ResponseMetadata;
    error?: string;
    needed?: string;
    provided?: string;
};
export interface Channel {
    id?: string;
    name?: string;
    is_channel?: boolean;
    is_group?: boolean;
    is_im?: boolean;
    created?: number;
    is_archived?: boolean;
    is_general?: boolean;
    unlinked?: number;
    name_normalized?: string;
    is_shared?: boolean;
    creator?: string;
    is_moved?: number;
    is_ext_shared?: boolean;
    is_global_shared?: boolean;
    is_org_default?: boolean;
    is_org_mandatory?: boolean;
    is_org_shared?: boolean;
    pending_shared?: string[];
    pending_connected_team_ids?: string[];
    is_pending_ext_shared?: boolean;
    conversation_host_id?: string;
    is_member?: boolean;
    is_private?: boolean;
    is_mpim?: boolean;
    topic?: Purpose;
    purpose?: Purpose;
    num_members?: number;
    shared_team_ids?: string[];
    internal_team_ids?: string[];
    previous_names?: string[];
}
export interface Purpose {
    value?: string;
    creator?: string;
    last_set?: number;
}
export interface ResponseMetadata {
    next_cursor?: string;
}
//# sourceMappingURL=ConversationsListResponse.d.ts.map
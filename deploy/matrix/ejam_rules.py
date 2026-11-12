"""K-82: no private Matrix rooms. Only the site's appservice sender may create rooms or aliases and invite.

Users still join public rooms themselves. Config: {sender: "@ejam:<server_name>"}.
"""
from typing import Any, Dict

from synapse.module_api import NOT_SPAM, ModuleApi, errors


class EjamRules:
    def __init__(self, config: Dict[str, Any], api: ModuleApi):
        self._sender = config["sender"]
        api.register_spam_checker_callbacks(
            user_may_create_room=self.user_may_create_room,
            user_may_invite=self.user_may_invite,
            user_may_create_room_alias=self.user_may_create_room_alias,
            user_may_send_3pid_invite=self.user_may_send_3pid_invite,
        )

    @staticmethod
    def parse_config(config: Dict[str, Any]) -> Dict[str, Any]:
        if "sender" not in config:
            raise ValueError("ejam_rules needs a 'sender' (the appservice user id)")
        return config

    def _only_sender(self, user_id: str):
        return NOT_SPAM if user_id == self._sender else errors.Codes.FORBIDDEN

    async def user_may_create_room(self, user_id: str, room_config: Dict[str, Any]):
        return self._only_sender(user_id)

    async def user_may_invite(self, inviter: str, invitee: str, room_id: str):
        return self._only_sender(inviter)

    async def user_may_create_room_alias(self, user_id: str, room_alias: Any):
        return self._only_sender(user_id)

    async def user_may_send_3pid_invite(self, inviter: str, medium: str, address: str, room_id: str):
        return errors.Codes.FORBIDDEN

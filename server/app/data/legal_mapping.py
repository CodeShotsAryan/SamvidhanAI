
IPC_BNS_MAPPING = {
    "420": {
        "title": "Cheating and dishonestly inducing delivery of property",
        "ipc_section": "420",
        "bns_section": "318",
        "ipc_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...",
        "bns_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...",
        "key_changes": "Substantially similar, but renumbered under the new code.",
    },
    "302": {
        "title": "Punishment for murder",
        "ipc_section": "302",
        "bns_section": "101",
        "ipc_desc": "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
        "bns_desc": "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
        "key_changes": "Moved from Section 302 to Section 101.",
    },
    "307": {
        "title": "Attempt to murder",
        "ipc_section": "307",
        "bns_section": "109",
        "ipc_desc": "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder...",
        "bns_desc": "Whoever does any act with such intention or knowledge, and under such circumstances that, if he by that act caused death, he would be guilty of murder...",
        "key_changes": "Renumbered to Section 109.",
    },
    "375": {
        "title": "Rape",
        "ipc_section": "375/376",
        "bns_section": "63/64",
        "ipc_desc": "A man is said to commit rape who... has sexual intercourse with a woman under circumstances falling under any of the following descriptions...",
        "bns_desc": "A man is said to commit rape who... has sexual intercourse with a woman under circumstances falling under any of the following descriptions...",
        "key_changes": "Moved to Chapter V (Offences against Women and Children).",
    },
    "124A": {
        "title": "Sedition / Acts endangering sovereignty",
        "ipc_section": "124A",
        "bns_section": "150",
        "ipc_desc": "Whoever by words, either spoken or written, or by signs, or by visible representation, or otherwise, brings or attempts to bring into hatred or contempt...",
        "bns_desc": "Whoever, purposely or knowingly, by words, either spoken or written, or by signs, or by visible representation, or by electronic communication or by use of financial means...",
        "key_changes": "Word 'Sedition' removed. Expanded to include electronic communication and financial means.",
    },
    "143": {
        "title": "Unlawful Assembly",
        "ipc_section": "143",
        "bns_section": "189",
        "ipc_desc": "Whoever is a member of an unlawful assembly, shall be punished with imprisonment of either description for a term which may extend to six months, or with fine, or with both.",
        "bns_desc": "Whoever is a member of an unlawful assembly, shall be punished with imprisonment of either description for a term which may extend to six months, or with fine, or with both.",
        "key_changes": "Renumbered to Section 189.",
    },
}


def get_mapping(section_number: str) -> dict:
    return IPC_BNS_MAPPING.get(section_number)

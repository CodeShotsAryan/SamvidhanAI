IPC_BNS_MAPPING = {
    "302": {
        "title": "Murder",
        "ipc_section": "300 (Def) / 302 (Pun)",
        "bns_section": "101-102 (Def) / 103 (Pun)",
        "meaning": "Culpable homicide becomes murder if done with intention to cause death, or bodily injury sufficient to cause death, or knowledge of imminent danger.",
        "punishment": "Death, or Imprisonment for life. Fine may also be imposed.",
        "key_changes": "Structure reorganized from Section 302 to Section 103.",
    },
    "300": "302",
    "299": {
        "title": "Culpable Homicide Not Amounting to Murder",
        "ipc_section": "299 (Def) / 304 (Pun)",
        "bns_section": "101 (Def) / 104 (Pun)",
        "meaning": "Causing death without the degree of intention required for murder.",
        "punishment": "Life imprisonment or Imprisonment up to 10 years + Fine.",
        "key_changes": "Substantively similar with clearer categorization into Section 104.",
    },
    "304": "299",
    "307": {
        "title": "Attempt to Murder",
        "ipc_section": "307",
        "bns_section": "109",
        "meaning": "Act done with intention or knowledge to cause death (death not caused).",
        "punishment": "Up to 10 years or Life imprisonment + Fine.",
        "key_changes": "Same offence, renumbered to Section 109.",
    },
    "420": {
        "title": "Cheating (Property)",
        "ipc_section": "415 (Def) / 420 (Prop)",
        "bns_section": "316 (Def) / 318 (Prop)",
        "meaning": "Deception and dishonest/fraudulent inducement for property delivery or harm.",
        "punishment": "Up to 7 years imprisonment + Fine.",
        "key_changes": "IPC 420 is now Section 318 of BNS.",
    },
    "415": "420",
    "406": {
        "title": "Criminal Breach of Trust",
        "ipc_section": "405 (Def) / 406 (Pun)",
        "bns_section": "316 (Def) / 317 (Pun)",
        "meaning": "Entrustment of property and dishonest misappropriation.",
        "punishment": "Up to 3 years or Fine or Both.",
        "key_changes": "Substantively unchanged but reorganized under BNS 316/317.",
    },
    "405": "406",
    "379": {
        "title": "Theft",
        "ipc_section": "378 (Def) / 379 (Pun)",
        "bns_section": "303",
        "meaning": "Dishonest intention, movable property, without consent, out of possession, permanent deprivation.",
        "punishment": "Up to 3 years or Fine or Both.",
        "key_changes": "Consolidated into BNS Section 303.",
    },
    "378": "379",
    "392": {
        "title": "Robbery",
        "ipc_section": "390 (Def) / 392 (Pun)",
        "bns_section": "309 (Def) / 310 (Pun)",
        "meaning": "Theft or extortion with violence or threat of instant harm.",
        "punishment": "Up to 10 years + Fine.",
        "key_changes": "Structured more clearly under BNS Sections 309 and 310.",
    },
    "390": "392",
    "395": {
        "title": "Dacoity",
        "ipc_section": "391 (Def) / 395 (Pun)",
        "bns_section": "311 (Def) / 313 (Pun)",
        "meaning": "Robbery by 5 or more persons.",
        "punishment": "Life imprisonment or up to 10 years + Fine.",
        "key_changes": "Reorganized into BNS Sections 311 to 313.",
    },
    "391": "395",
    "376": {
        "title": "Rape",
        "ipc_section": "375 (Def) / 376 (Pun)",
        "bns_section": "63 (Def) / 64 (Pun)",
        "meaning": "Sexual acts without consent. Consent strictly defined.",
        "punishment": "Rigorous imprisonment (minimum prescribed), extending to life.",
        "key_changes": "Same offence, renumbered to BNS 63 and 64.",
    },
    "375": "376",
    "506": {
        "title": "Criminal Intimidation",
        "ipc_section": "503 (Def) / 506 (Pun)",
        "bns_section": "235",
        "meaning": "Threat to cause injury with intent to cause alarm.",
        "punishment": "Up to 2 years or Fine or Both.",
        "key_changes": "Renumbered to BNS Section 235.",
    },
    "503": "506",
    "341": {
        "title": "Wrongful Restraint & Confinement",
        "ipc_section": "339-340 (Def) / 341-342 (Pun)",
        "bns_section": "126-127",
        "meaning": "Obstruction or confinement of a person against their will.",
        "punishment": "Fine or imprisonment depending on duration.",
        "key_changes": "Renumbered to BNS Sections 126 and 127.",
    },
    "339": "341",
    "340": "341",
    "342": "341",
    "465": {
        "title": "Forgery",
        "ipc_section": "463 (Def) / 465 (Pun)",
        "bns_section": "336 (Def) / 338 (Pun)",
        "meaning": "Making false documents or electronic records with intent to deceive.",
        "punishment": "Up to 2 years or Fine or Both.",
        "key_changes": "Now covered under Sections 336 and 338 of BNS.",
    },
    "463": "465",
}


def get_mapping(section_number: str) -> dict:
    """
    Retrieves mapping for a section number.
    First tries to match as an IPC section (direct key or alias).
    If no match, searches for the section number in bns_section fields.
    """
    # Try as IPC section first
    result = IPC_BNS_MAPPING.get(section_number)
    if isinstance(result, str):
        result = IPC_BNS_MAPPING.get(result)

    if result:
        return result

    # If not found, search in BNS sections
    for mapping in IPC_BNS_MAPPING.values():
        if isinstance(mapping, dict):
            # Check if section_number is in bns_section (handles cases like "101-102")
            bns_sec = str(mapping.get("bns_section", ""))
            if section_number == bns_sec or section_number in bns_sec.split("-"):
                return mapping

    return None

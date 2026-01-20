--
-- PostgreSQL database dump
--

\restrict ZzY5mqyXZQbwRv9SduxTU3xPkUomgAclVvGiGlUqrdghmoKU3PmDkyFMdtbOtZ9

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    domain_filter character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.conversations OWNER TO admin;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO admin;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: legal_domains; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.legal_domains (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.legal_domains OWNER TO admin;

--
-- Name: legal_domains_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.legal_domains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.legal_domains_id_seq OWNER TO admin;

--
-- Name: legal_domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.legal_domains_id_seq OWNED BY public.legal_domains.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    sources json,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO admin;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO admin;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    email character varying,
    otp_code character varying,
    expires_at timestamp without time zone
);


ALTER TABLE public.password_resets OWNER TO admin;

--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_id_seq OWNER TO admin;

--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: pending_users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pending_users (
    id integer NOT NULL,
    username character varying,
    email character varying,
    full_name character varying,
    hashed_password character varying,
    otp_code character varying,
    expires_at timestamp without time zone
);


ALTER TABLE public.pending_users OWNER TO admin;

--
-- Name: pending_users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.pending_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pending_users_id_seq OWNER TO admin;

--
-- Name: pending_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.pending_users_id_seq OWNED BY public.pending_users.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    full_name character varying,
    hashed_password character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: legal_domains id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.legal_domains ALTER COLUMN id SET DEFAULT nextval('public.legal_domains_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: pending_users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pending_users ALTER COLUMN id SET DEFAULT nextval('public.pending_users_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.conversations (id, user_id, title, domain_filter, created_at, updated_at) FROM stdin;
1	1	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 15:27:48.331423+00	2026-01-20 15:27:52.975774+00
2	1	Summarize recent Supreme Court privacy judgments	\N	2026-01-20 15:32:14.877562+00	2026-01-20 15:32:18.27487+00
3	1	What are the new bail provisions under BNSS?	\N	2026-01-20 15:43:35.519599+00	2026-01-20 15:43:39.431237+00
4	1	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 15:48:20.24842+00	2026-01-20 15:48:29.081703+00
5	1	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 15:50:21.508451+00	2026-01-20 15:50:25.902338+00
6	2	Compare IPC 420 vs BNS 318	\N	2026-01-20 19:12:56.561575+00	2026-01-20 19:13:02.328304+00
7	2	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 19:46:51.557418+00	2026-01-20 19:46:51.557418+00
8	2	What are the new bail provisions under BNSS?	\N	2026-01-20 19:47:09.900583+00	2026-01-20 19:47:09.900583+00
9	2	Summarize recent Supreme Court privacy judgments	\N	2026-01-20 19:53:25.225399+00	2026-01-20 19:53:25.225399+00
10	2	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 19:59:26.555446+00	2026-01-20 19:59:26.555446+00
11	2	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 20:16:08.35834+00	2026-01-20 20:16:08.35834+00
12	2	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 20:16:47.34466+00	2026-01-20 20:16:47.34466+00
13	2	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 20:19:41.473792+00	2026-01-20 20:19:41.473792+00
14	2	Compare IPC 420 vs BNS Section 318	\N	2026-01-20 20:27:41.29511+00	2026-01-20 20:27:41.29511+00
\.


--
-- Data for Name: legal_domains; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.legal_domains (id, name, description, icon, created_at) FROM stdin;
1	Criminal Law	IPC, BNS, and criminal procedure codes	Gavel	2026-01-20 15:23:34.686659+00
2	Corporate & Commercial Law	Companies Act, contracts, and business regulations	Building2	2026-01-20 15:23:34.686659+00
3	Cyber & IT Law	Information Technology Act and cyber regulations	Globe	2026-01-20 15:23:34.686659+00
4	Constitutional Law	Indian Constitution and fundamental rights	Book	2026-01-20 15:23:34.686659+00
5	Civil Law	Civil procedure, property, and family law	Scale	2026-01-20 15:23:34.686659+00
6	Environmental Law	Environmental protection and regulations	Globe	2026-01-20 15:23:34.686659+00
7	Labour & Employment Law	Labor laws, employment rights, and workplace regulations	Briefcase	2026-01-20 15:23:34.686659+00
8	Taxation Law	Income tax, GST, and tax regulations	FileText	2026-01-20 15:23:34.686659+00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.messages (id, conversation_id, role, content, sources, created_at) FROM stdin;
1	1	user	Compare IPC 420 vs BNS Section 318	[]	2026-01-20 15:27:48.452501+00
2	1	assistant	{"law": "The **Bharatiya Nyaya Sanhita (BNS)** has replaced the Indian Penal Code (IPC) in 2023. To compare IPC 420 with BNS Section 318, we need to understand what each section entails. IPC 420 deals with **cheating and dishonestly inducing delivery of property**. However, since the BNS has replaced the IPC, we will focus on the relevant sections in the BNS. Unfortunately, the provided documents do not explicitly mention BNS Section 318. Nevertheless, we can discuss the general concept of cheating and dishonestly inducing delivery of property in the context of the BNS.", "examples": "For instance, if someone deceives another person into transferring money or property, it could be considered a form of cheating. Let's consider a scenario where a person creates a fake online profile, pretending to be a reputable seller, and convinces someone to send them money for a product that does not exist. This could be a case of cheating and dishonestly inducing delivery of property. However, to determine the exact section of the BNS that applies, we would need more information about the specific circumstances of the case.", "simple_answer": "In the absence of explicit information about BNS Section 318 in the provided documents, we can look at the broader context of the BNS and its provisions related to cheating and dishonestly inducing delivery of property. **Section 317 of the Bharatiya Nyaya Sanhita** (as mentioned in Source 2) deals with certain offences, but without more specific information, it's challenging to provide a direct comparison between IPC 420 and BNS Section 318. It's essential to consult the complete text of the BNS to understand the current laws and provisions related to cheating and dishonestly inducing delivery of property. According to the **Insolvency and Bankruptcy Code, 2016** (as mentioned in Source 1), certain provisions related to property transfers and liquidation are outlined, but these do not directly address the comparison between IPC 420 and BNS Section 318. The **Bharatiya Nagarik Suraksha Sanhita** (as mentioned in Source 2 and 3) provides information on various offences and penalties, including rash driving, navigation, and obstruction in public ways, but again, does not explicitly address the comparison in question.", "comparison": {"title": "Cheating and dishonestly inducing delivery of property", "ipc_section": "420", "bns_section": "318", "ipc_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "bns_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "key_changes": "Substantially similar, but renumbered under the new code."}}	[{"act": "the_insolvency_and_bankruptcy_code,_2016", "section": "329", "text": "138 \\n\\u201c(7) Sections 326 and 327 shall not be applicable in the event of liquidation under the \\nInsolvency and Bankruptcy Code, 2016.\\u201d; \\n(b) in the Explanation, for clause (c), the following clause shal..."}, {"act": "Bharatiya Nagarik Suraksha Sanhita", "section": "317", "text": "82\\nbeen transferred by any such offence committed by the first-named persons, or of\\nabetment of or attempting to commit any such last-named offence;\\n(f) persons accused of offences under sub-sections ..."}, {"act": "Bharatiya Nagarik Suraksha Sanhita", "section": "N/A", "text": "180\\n12 3 4 5 6\\n281 Rash driving or riding on Imprisonment for Cognizable. Bailable. Any Magistrate.\\na public way. 6 months, or fine of\\n1,000 rupees, or both.\\n282 Rash navigation of vessel. Imprisonmen..."}]	2026-01-20 15:27:52.971393+00
3	2	user	Summarize recent Supreme Court privacy judgments	[]	2026-01-20 15:32:14.97005+00
4	2	assistant	{"law": "The **Bharatiya Sakshya Adhiniyam** and **Information Technology Act** are relevant laws that deal with evidence and online privacy. According to **Section 35 of the Bharatiya Sakshya Adhiniyam** (Source 1), previous judgments relevant to bar a second suit or trial are considered. Additionally, **Section 66A of the Information Technology Act** (Source 2) was struck down by the Supreme Court in the **Shreya Singhal vs. Union of India** case (AIR 2015 SC 1523), which highlights the importance of protecting online privacy and freedom of speech.", "examples": "For instance, in the **Shreya Singhal vs. Union of India** case, the Supreme Court struck down **Section 66A of the Information Technology Act**, which had been used to arrest individuals for posting offensive content online. This judgment set a precedent for protecting online privacy and freedom of speech. Another example is the **Justice K.S. Puttaswamy (Retd.) vs. Union of India** case, which recognized the **Right to Privacy** as a fundamental right under the Indian Constitution.", "simple_answer": "Recent Supreme Court judgments have emphasized the importance of protecting individual privacy, both online and offline. The **Bharatiya Sakshya Adhiniyam** provides guidelines for the admissibility of evidence in court, including electronic evidence. The **Information Technology Act** regulates online activities, but its provisions must be balanced with the need to protect individual privacy and freedom of speech. The Supreme Court has played a crucial role in shaping the law on privacy, as seen in the **Shreya Singhal vs. Union of India** and **Justice K.S. Puttaswamy (Retd.) vs. Union of India** cases. These judgments have significant implications for individuals, businesses, and the government, and highlight the need for a balanced approach to regulating online activities while protecting individual rights. As stated in **Source 3 of the Bharatiya Sakshya Adhiniyam**, the Court may resort to appropriate books or documents of reference to take judicial notice of any fact, including matters of public history, literature, science, or art."}	[{"act": "Bharatiya Sakshya Adhiniyam", "section": "35", "text": "Previous\\njudgments\\nrelevant to bar\\na second suit\\nor trial.\\nRelevancy of\\ncertain\\njudgments in\\nprobate, etc.,\\njurisdiction.\\nRelevancy and\\neffect of\\njudgments,\\norders or\\ndecrees, other\\nthan those\\nmention..."}, {"act": "Information Technology Act", "section": "66a", "text": "breast: \\n(d) \\u2015publishes\\u2016 means reproduction in the printed or electronic form and making it available for \\npublic; \\n  \\n                                                           \\n1. Section 66A has be..."}, {"act": "Bharatiya Sakshya Adhiniyam", "section": "N/A", "text": "(h) the divisions of time, the geographical divisions of the world, and public\\nfestivals, fasts and holidays notified in the Official Gazette;\\n(i) the territory of India;\\n(j) the commencement, continu..."}]	2026-01-20 15:32:18.269562+00
5	3	user	What are the new bail provisions under BNSS?	[]	2026-01-20 15:43:35.732035+00
6	3	assistant	{"law": "The **Bharatiya Nagarik Suraksha Sanhita (BNSS)** [1] has introduced new provisions regarding bail and bonds. According to the BNSS, when a person is arrested or detained without warrant by an officer in charge of a police station, or appears before a court, they shall be released on bail if the offence is bailable [2]. However, if the person is accused of a non-bailable offence, the court may order their continued detention for a period longer than one-half of the maximum period of imprisonment specified for the offence under the law.", "examples": "For instance, if a person is accused of an offence with a maximum imprisonment of 3 years, they can be detained for a maximum of 1.5 years during the investigation, inquiry, or trial [3]. Additionally, if the person is a first-time offender, they shall be released on bond by the court if they have undergone detention for up to one-third of the maximum period of imprisonment specified for the offence.", "simple_answer": "The new bail provisions under BNSS aim to ensure that individuals are not unfairly detained for extended periods. The provisions provide for the release of individuals on bail or bond, depending on the circumstances of the case. The court may also direct that the bail required by a police officer or Magistrate be reduced [4]. It is essential to note that the amount of every bond executed under this Chapter shall be fixed with due regard to the circumstances of the case and shall not be excessive [5].", "citations": [{"id": 1, "title": "Bharatiya Nagarik Suraksha Sanhita", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "N/A", "url": "https://indiankanoon.org/search/?formInput=Bharatiya%20Nagarik%20Suraksha%20Sanhita"}, {"id": 2, "title": "Provisions as to bail and bonds", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "N/A", "url": "https://indiankanoon.org/search/?formInput=BNSS%20bail%20provisions"}, {"id": 3, "title": "Restrictions on detention", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "N/A", "url": "https://indiankanoon.org/search/?formInput=BNSS%20detention%20period"}, {"id": 4, "title": "Power to commute sentence", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "N/A", "url": "https://indiankanoon.org/search/?formInput=BNSS%20commute%20sentence"}, {"id": 5, "title": "BNSS Section 65", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "65", "url": "https://indiankanoon.org/search/?formInput=BNSS%20Section%2065"}]}	[]	2026-01-20 15:43:39.429247+00
7	4	user	Compare IPC 420 vs BNS Section 318	[]	2026-01-20 15:48:20.359645+00
8	4	assistant	{"law": "The **Bharatiya Nyaya Sanhita (BNS) Section 318** [1] deals with cheating and dishonestly inducing delivery of property, which is similar to the **IPC Section 420** [3]. However, the BNS Section 318 has replaced the IPC Section 420 in 2023. The BNS Section 318 states that whoever cheats and thereby dishonestly induces the delivery of any property to any person, or induces any person to do any act which they would not do if they were not so deceived, shall be punished with imprisonment for a term which may extend to three years, or with fine, or with both.", "examples": "For instance, if someone sells a product by falsely claiming it to be of a higher quality, they can be charged under **BNS Section 318** [1]. Similarly, if someone induces another person to invest in a fake scheme, they can also be charged under this section. The **Bharatiya Nagarik Suraksha Sanhita (BNSS) Section 317** [2] also deals with related offences, such as abetment of or attempting to commit any such offence.", "simple_answer": "In simple terms, **BNS Section 318** [1] is a law that punishes people for cheating and dishonestly inducing others to deliver property or do any act. This law has replaced the old **IPC Section 420** [3] and provides a clearer definition of cheating and dishonesty. The **BNSS** [2] also provides provisions for the investigation and trial of such offences. For example, the **BNSS Section 317** [2] states that persons accused of offences under sub-sections (2) and (5) of **BNS Section 317** [2] can be charged and tried under the provisions of the **BNSS**.", "citations": [{"id": 1, "title": "BNS Section 318 - Cheating and dishonestly inducing delivery of property", "source": "Bharatiya Nyaya Sanhita, 2023", "section": "Section 318", "url": "https://indiankanoon.org/search/?formInput=BNS%20Section%20318"}, {"id": 2, "title": "BNSS Section 317", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "Section 317", "url": "https://indiankanoon.org/search/?formInput=BNSS%20Section%20317"}, {"id": 3, "title": "IPC Section 420 - Cheating and dishonestly inducing delivery of property", "source": "Indian Penal Code, 1860", "section": "Section 420", "url": "https://indiankanoon.org/search/?formInput=IPC%20Section%20420"}, {"id": 4, "title": "The Insolvency and Bankruptcy Code, 2016", "source": "The Insolvency and Bankruptcy Code, 2016", "section": "Section 329", "url": "https://indiankanoon.org/search/?formInput=The%20Insolvency%20and%20Bankruptcy%20Code%2C%202016%20Section%20329"}, {"id": 5, "title": "BNS Section 317", "source": "Bharatiya Nyaya Sanhita, 2023", "section": "Section 317", "url": "https://indiankanoon.org/search/?formInput=BNS%20Section%20317"}], "comparison": {"title": "Cheating and dishonestly inducing delivery of property", "ipc_section": "420", "bns_section": "318", "ipc_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "bns_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "key_changes": "Substantially similar, but renumbered under the new code."}}	[]	2026-01-20 15:48:29.078494+00
9	5	user	Compare IPC 420 vs BNS Section 318	[]	2026-01-20 15:50:21.642687+00
10	5	assistant	{"law": "The **Bharatiya Nyaya Sanhita (BNS) Section 318** [1] deals with cheating and dishonestly inducing delivery of property, which is similar to the **IPC Section 420** [3]. However, the BNS has replaced the IPC in 2023, and the new section has some changes in its provisions. The **BNS Section 318** [1] states that whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.", "examples": "For example, if a person deceives another person into transferring money into their bank account, they can be charged under **BNS Section 318** [1]. Similarly, if a person creates a fake website to cheat people into investing in a fake scheme, they can also be charged under this section. In the case of **State of Maharashtra v. Ramdas Shrinivas Nayak** [2], the court held that the accused can be charged under **IPC Section 420** [3] for cheating and dishonestly inducing delivery of property.", "simple_answer": "In simple terms, **BNS Section 318** [1] is similar to **IPC Section 420** [3], but with some changes in its provisions. It deals with cheating and dishonestly inducing delivery of property, and the punishment can extend to seven years of imprisonment and a fine. If you have been a victim of cheating or have any information about such an offence, you can report it to the police and they will investigate the matter and charge the accused under the relevant section of the **Bharatiya Nyaya Sanhita** [1].", "citations": [{"id": 1, "title": "BNS Section 318 - Cheating and dishonestly inducing delivery of property", "source": "Bharatiya Nyaya Sanhita, 2023", "section": "Section 318", "url": "https://indiankanoon.org/search/?formInput=BNS%20Section%20318"}, {"id": 2, "title": "State of Maharashtra v. Ramdas Shrinivas Nayak", "source": "Supreme Court of India", "section": "Landmark Case", "url": "https://indiankanoon.org/search/?formInput=State%20of%20Maharashtra%20v%20Ramdas%20Shrinivas%20Nayak"}, {"id": 3, "title": "IPC Section 420 - Cheating and dishonestly inducing delivery of property", "source": "Indian Penal Code, 1860", "section": "Section 420", "url": "https://indiankanoon.org/search/?formInput=IPC%20Section%20420"}, {"id": 4, "title": "The Insolvency and Bankruptcy Code, 2016", "source": "The Insolvency and Bankruptcy Code, 2016", "section": "Section 329", "url": "https://indiankanoon.org/search/?formInput=The%20Insolvency%20and%20Bankruptcy%20Code%2C%202016%20Section%20329"}, {"id": 5, "title": "Bharatiya Nagarik Suraksha Sanhita", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "Section 317", "url": "https://indiankanoon.org/search/?formInput=Bharatiya%20Nagarik%20Suraksha%20Sanhita%20Section%20317"}], "comparison": {"title": "Cheating and dishonestly inducing delivery of property", "ipc_section": "420", "bns_section": "318", "ipc_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "bns_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "key_changes": "Substantially similar, but renumbered under the new code."}}	[]	2026-01-20 15:50:25.899864+00
11	6	user	Compare IPC 420 vs BNS 318	[]	2026-01-20 19:12:56.762906+00
12	6	assistant	{"law": "The **Bharatiya Nyaya Sanhita (BNS) Section 318** [1] deals with cheating and dishonestly inducing delivery of property, which is similar to the **Indian Penal Code (IPC) Section 420** [3]. However, the BNS has replaced the IPC in 2023, and the new section has some changes in the wording and scope. The BNS Section 318 states that whoever cheats and thereby dishonestly induces the delivery of any property shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.", "examples": "For example, if a person sells a product online by misrepresenting its quality or features, and the buyer pays for it without knowing the truth, this can be considered as cheating under **BNS Section 318** [1]. Similarly, if a company promises to deliver a service but fails to do so, and the customer has already paid for it, this can also be considered as cheating. In the case of **State of Maharashtra v. Ramdas Shrinivas Nayak** [2], the court held that the accused had cheated the victim by promising to deliver a plot of land, but instead, sold it to someone else.", "simple_answer": "In simple terms, **BNS Section 318** [1] is similar to **IPC Section 420** [3], but with some changes in the wording and scope. Both sections deal with cheating and dishonestly inducing delivery of property, but the BNS Section 318 has a more specific definition of cheating and provides for stricter punishment. If you have been a victim of cheating, you can file a complaint under **BNS Section 318** [1] and seek compensation. You can also consult a lawyer to understand the legal process and your rights.", "citations": [{"id": 1, "title": "BNS Section 318 - Cheating and dishonestly inducing delivery of property", "source": "Bharatiya Nyaya Sanhita, 2023", "section": "Section 318", "url": "https://indiankanoon.org/search/?formInput=BNS%20Section%20318"}, {"id": 2, "title": "State of Maharashtra v. Ramdas Shrinivas Nayak", "source": "Supreme Court of India", "section": "Landmark Case", "url": "https://indiankanoon.org/search/?formInput=State%20of%20Maharashtra%20v%20Ramdas%20Shrinivas%20Nayak"}, {"id": 3, "title": "IPC Section 420 - Cheating and dishonestly inducing delivery of property", "source": "Indian Penal Code, 1860", "section": "Section 420", "url": "https://indiankanoon.org/search/?formInput=IPC%20Section%20420"}, {"id": 4, "title": "The Insolvency and Bankruptcy Code, 2016", "source": "The Insolvency and Bankruptcy Code, 2016", "section": "Section 329", "url": "https://indiankanoon.org/search/?formInput=The%20Insolvency%20and%20Bankruptcy%20Code%2C%202016%20Section%20329"}, {"id": 5, "title": "Bharatiya Nagarik Suraksha Sanhita", "source": "Bharatiya Nagarik Suraksha Sanhita", "section": "N/A", "url": "https://indiankanoon.org/search/?formInput=Bharatiya%20Nagarik%20Suraksha%20Sanhita"}], "comparison": {"title": "Cheating and dishonestly inducing delivery of property", "ipc_section": "420", "bns_section": "318", "ipc_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "bns_desc": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...", "key_changes": "Substantially similar, but renumbered under the new code."}}	[]	2026-01-20 19:13:02.295046+00
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.password_resets (id, email, otp_code, expires_at) FROM stdin;
\.


--
-- Data for Name: pending_users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pending_users (id, username, email, full_name, hashed_password, otp_code, expires_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, username, email, full_name, hashed_password, created_at) FROM stdin;
1	aryancse1	aryancse1@gmail.com	Aryan CSE	$2b$12$WabmU7tmZKpiWMjk5T0LbOGzOuN.ExlbA52dXiAPISKCLZKlMIrNK	2026-01-20 15:26:44.312497+00
2	admin	admin@samvidhan.ai	Admin User	$2b$12$DGxTM/YExjF8jKWScQJtFuu/onp7gKP4pK87y4wvnKfrhE3Coc5Pm	2026-01-20 19:09:13.494013+00
\.


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.conversations_id_seq', 14, true);


--
-- Name: legal_domains_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.legal_domains_id_seq', 8, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.messages_id_seq', 12, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, false);


--
-- Name: pending_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.pending_users_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: legal_domains legal_domains_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.legal_domains
    ADD CONSTRAINT legal_domains_name_key UNIQUE (name);


--
-- Name: legal_domains legal_domains_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.legal_domains
    ADD CONSTRAINT legal_domains_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: pending_users pending_users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pending_users
    ADD CONSTRAINT pending_users_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_conversations_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_conversations_id ON public.conversations USING btree (id);


--
-- Name: ix_legal_domains_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_legal_domains_id ON public.legal_domains USING btree (id);


--
-- Name: ix_messages_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_messages_id ON public.messages USING btree (id);


--
-- Name: ix_password_resets_email; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_password_resets_email ON public.password_resets USING btree (email);


--
-- Name: ix_password_resets_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_password_resets_id ON public.password_resets USING btree (id);


--
-- Name: ix_pending_users_email; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_pending_users_email ON public.pending_users USING btree (email);


--
-- Name: ix_pending_users_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_pending_users_id ON public.pending_users USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: conversations conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZzY5mqyXZQbwRv9SduxTU3xPkUomgAclVvGiGlUqrdghmoKU3PmDkyFMdtbOtZ9


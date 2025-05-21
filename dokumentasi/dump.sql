--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: check_empty_room(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.check_empty_room() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- If we're deleting a player and it was the last one
    IF (TG_OP = 'DELETE') THEN
        -- Instead of deleting the room, just update its timestamp
        -- This will allow the room to persist for a while
        UPDATE rooms 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.room_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.check_empty_room() OWNER TO neondb_owner;

--
-- Name: FUNCTION check_empty_room(); Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON FUNCTION public.check_empty_room() IS 'Updates room timestamp when last player leaves instead of deleting it immediately';


--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: drawings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.drawings (
    id integer NOT NULL,
    round_number integer NOT NULL,
    prompt_id integer,
    artist_id integer,
    image_url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    room_id character varying(6)
);


ALTER TABLE public.drawings OWNER TO neondb_owner;

--
-- Name: drawings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.drawings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drawings_id_seq OWNER TO neondb_owner;

--
-- Name: drawings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.drawings_id_seq OWNED BY public.drawings.id;


--
-- Name: game_results; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.game_results (
    id integer NOT NULL,
    room_id character varying(6),
    user_id integer,
    username character varying(50) NOT NULL,
    score integer NOT NULL,
    rank integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.game_results OWNER TO neondb_owner;

--
-- Name: game_results_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.game_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_results_id_seq OWNER TO neondb_owner;

--
-- Name: game_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.game_results_id_seq OWNED BY public.game_results.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO neondb_owner;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO neondb_owner;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: prompts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prompts (
    id integer NOT NULL,
    text character varying(255) NOT NULL,
    category character varying(50) DEFAULT 'general'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prompts OWNER TO neondb_owner;

--
-- Name: prompts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.prompts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prompts_id_seq OWNER TO neondb_owner;

--
-- Name: prompts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.prompts_id_seq OWNED BY public.prompts.id;


--
-- Name: room_players; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.room_players (
    room_id character varying(6) NOT NULL,
    user_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_active timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.room_players OWNER TO neondb_owner;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.rooms (
    id character varying(6) NOT NULL,
    name character varying(100) NOT NULL,
    host_id integer,
    max_players integer DEFAULT 6,
    drawing_time integer DEFAULT 60,
    voting_time integer DEFAULT 15,
    rounds integer DEFAULT 3,
    is_private boolean DEFAULT false,
    status character varying(20) DEFAULT 'waiting'::character varying,
    current_round integer DEFAULT 0,
    current_phase character varying(20) DEFAULT NULL::character varying,
    current_prompt_id integer,
    current_drawing_index integer DEFAULT 0,
    phase_end_time timestamp with time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rooms OWNER TO neondb_owner;

--
-- Name: stars; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stars (
    id integer NOT NULL,
    drawing_id integer,
    voter_id integer,
    rating integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stars_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.stars OWNER TO neondb_owner;

--
-- Name: stars_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stars_id_seq OWNER TO neondb_owner;

--
-- Name: stars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stars_id_seq OWNED BY public.stars.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: drawings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drawings ALTER COLUMN id SET DEFAULT nextval('public.drawings_id_seq'::regclass);


--
-- Name: game_results id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.game_results ALTER COLUMN id SET DEFAULT nextval('public.game_results_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: prompts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompts ALTER COLUMN id SET DEFAULT nextval('public.prompts_id_seq'::regclass);


--
-- Name: stars id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stars ALTER COLUMN id SET DEFAULT nextval('public.stars_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: drawings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.drawings (id, round_number, prompt_id, artist_id, image_url, created_at, room_id) FROM stdin;
90	3	169	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747753922/drawing-battle/drawing-1747753910782.png	2025-05-20 15:12:03.536453	AYN679
82	1	238	7	https://res.cloudinary.com/drawingbattle/image/upload/v1747752750/drawing-battle/drawing-1747752750808.png	2025-05-20 14:52:31.489098	\N
83	1	238	12	https://res.cloudinary.com/drawingbattle/image/upload/v1747752753/drawing-battle/drawing-1747752755077.png	2025-05-20 14:52:34.289061	\N
35	3	179	8	https://res.cloudinary.com/drawingbattle/image/upload/v1747640532/drawing-battle/drawing-1747640531653.png	2025-05-19 07:42:13.103556	\N
30	1	149	9	https://res.cloudinary.com/drawingbattle/image/upload/v1747640496/drawing-battle/drawing-1747640495337.png	2025-05-19 07:41:37.143387	\N
31	1	149	8	https://res.cloudinary.com/drawingbattle/image/upload/v1747640497/drawing-battle/drawing-1747640496185.png	2025-05-19 07:41:38.433481	\N
24	1	323	5	https://res.cloudinary.com/drawingbattle/image/upload/v1747577728/drawing-battle/drawing-1747577722543.png	2025-05-18 14:15:30.323401	\N
25	1	323	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747577732/drawing-battle/drawing-1747577727145.png	2025-05-18 14:15:32.93586	\N
27	2	265	5	https://res.cloudinary.com/drawingbattle/image/upload/v1747577850/drawing-battle/drawing-1747577843831.png	2025-05-18 14:17:31.429997	\N
29	3	38	5	https://res.cloudinary.com/drawingbattle/image/upload/v1747577960/drawing-battle/drawing-1747577953387.png	2025-05-18 14:19:20.816532	\N
32	2	229	8	https://res.cloudinary.com/drawingbattle/image/upload/v1747640517/drawing-battle/drawing-1747640516649.png	2025-05-19 07:41:58.562315	\N
33	2	229	9	https://res.cloudinary.com/drawingbattle/image/upload/v1747640519/drawing-battle/drawing-1747640518875.png	2025-05-19 07:42:00.13386	\N
34	3	179	9	https://res.cloudinary.com/drawingbattle/image/upload/v1747640531/drawing-battle/drawing-1747640530862.png	2025-05-19 07:42:12.420635	\N
97	1	50	5	https://res.cloudinary.com/drawingbattle/image/upload/v1747754672/drawing-battle/drawing-1747754660515.png	2025-05-20 15:24:33.445127	\N
47	1	92	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747655282/drawing-battle/drawing-1747655275364.png	2025-05-19 11:48:02.794435	\N
69	1	127	5	https://res.cloudinary.com/drawingbattle/image/upload/v1747747346/drawing-battle/drawing-1747747333802.png	2025-05-20 13:22:26.815983	\N
70	1	127	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747747361/drawing-battle/drawing-1747747348484.png	2025-05-20 13:22:42.315404	\N
72	1	181	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747751459/drawing-battle/drawing-1747751448574.png	2025-05-20 14:31:00.726809	\N
61	1	86	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747745519/drawing-battle/drawing-1747745507089.png	2025-05-20 12:52:00.014465	\N
59	1	48	7	https://res.cloudinary.com/drawingbattle/image/upload/v1747743856/drawing-battle/drawing-1747743856854.png	2025-05-20 12:24:16.984727	\N
60	1	48	12	https://res.cloudinary.com/drawingbattle/image/upload/v1747743866/drawing-battle/drawing-1747743866900.png	2025-05-20 12:24:27.544537	\N
99	2	183	5	https://res.cloudinary.com/drawingbattle/image/upload/v1747754705/drawing-battle/drawing-1747754693420.png	2025-05-20 15:25:06.448285	\N
112	1	238	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747757795/drawing-battle/drawing-1747757785044.png	2025-05-20 16:16:36.799017	\N
105	1	66	7	https://res.cloudinary.com/drawingbattle/image/upload/v1747755628/drawing-battle/drawing-1747755629949.png	2025-05-20 15:40:29.987427	\N
106	1	66	12	https://res.cloudinary.com/drawingbattle/image/upload/v1747755638/drawing-battle/drawing-1747755640076.png	2025-05-20 15:40:39.18363	\N
107	2	4	7	https://res.cloudinary.com/drawingbattle/image/upload/v1747755687/drawing-battle/drawing-1747755688146.png	2025-05-20 15:41:28.40599	\N
108	2	4	12	https://res.cloudinary.com/drawingbattle/image/upload/v1747755692/drawing-battle/drawing-1747755693767.png	2025-05-20 15:41:32.875325	\N
109	3	214	7	https://res.cloudinary.com/drawingbattle/image/upload/v1747755733/drawing-battle/drawing-1747755733850.png	2025-05-20 15:42:14.374533	\N
110	3	214	12	https://res.cloudinary.com/drawingbattle/image/upload/v1747755736/drawing-battle/drawing-1747755738169.png	2025-05-20 15:42:17.164949	\N
113	1	142	5	https://res.cloudinary.com/drawingbattle/image/upload/v1747758619/drawing-battle/drawing-1747758608211.png	2025-05-20 16:30:20.845997	\N
114	1	142	6	https://res.cloudinary.com/drawingbattle/image/upload/v1747758628/drawing-battle/drawing-1747758617279.png	2025-05-20 16:30:29.528323	\N
116	1	18	12	https://res.cloudinary.com/drawingbattle/image/upload/v1747759206/drawing-battle/drawing-1747759207534.png	2025-05-20 16:40:06.95601	NO4LBF
117	1	18	7	https://res.cloudinary.com/drawingbattle/image/upload/v1747759206/drawing-battle/drawing-1747759207146.png	2025-05-20 16:40:07.202365	NO4LBF
\.


--
-- Data for Name: game_results; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.game_results (id, room_id, user_id, username, score, rank, created_at) FROM stdin;
5	5Z6J47	5	adriann	100	1	2025-05-20 15:17:14.651809
6	5Z6J47	6	dika	100	2	2025-05-20 15:17:14.689943
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.migrations (id, name, applied_at) FROM stdin;
1	002_add_activity_tracking.sql	2025-05-19 13:53:48.685926
2	003_modify_room_deletion_trigger.sql	2025-05-20 10:16:38.918526
\.


--
-- Data for Name: prompts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prompts (id, text, category, created_at) FROM stdin;
1	Elephant	animals	2025-05-13 02:05:30.743255
2	Fox	animals	2025-05-13 02:05:30.743255
3	Penguin	animals	2025-05-13 02:05:30.743255
4	Tiger	animals	2025-05-13 02:05:30.743255
5	Giraffe	animals	2025-05-13 02:05:30.743255
6	Whale	animals	2025-05-13 02:05:30.743255
7	Sloth	animals	2025-05-13 02:05:30.743255
8	Kangaroo	animals	2025-05-13 02:05:30.743255
9	Octopus	animals	2025-05-13 02:05:30.743255
10	Zebra	animals	2025-05-13 02:05:30.743255
11	Owl	birds	2025-05-13 02:05:30.743255
12	Parrot	birds	2025-05-13 02:05:30.743255
13	Peacock	birds	2025-05-13 02:05:30.743255
14	Eagle	birds	2025-05-13 02:05:30.743255
15	Flamingo	birds	2025-05-13 02:05:30.743255
16	Crow	birds	2025-05-13 02:05:30.743255
17	Toucan	birds	2025-05-13 02:05:30.743255
18	Hawk	birds	2025-05-13 02:05:30.743255
19	Hummingbird	birds	2025-05-13 02:05:30.743255
20	Pigeon	birds	2025-05-13 02:05:30.743255
21	Clownfish	fishes	2025-05-13 02:05:30.743255
22	Goldfish	fishes	2025-05-13 02:05:30.743255
23	Shark	fishes	2025-05-13 02:05:30.743255
24	Anglerfish	fishes	2025-05-13 02:05:30.743255
25	Tuna	fishes	2025-05-13 02:05:30.743255
26	Betta Fish	fishes	2025-05-13 02:05:30.743255
27	Eel	fishes	2025-05-13 02:05:30.743255
28	Salmon	fishes	2025-05-13 02:05:30.743255
29	Swordfish	fishes	2025-05-13 02:05:30.743255
30	Jellyfish	fishes	2025-05-13 02:05:30.743255
31	Tree	nature	2025-05-13 02:05:30.743255
32	Flower	nature	2025-05-13 02:05:30.743255
33	Leaf	nature	2025-05-13 02:05:30.743255
34	Mushroom	nature	2025-05-13 02:05:30.743255
35	Fern	nature	2025-05-13 02:05:30.743255
36	Vine	nature	2025-05-13 02:05:30.743255
37	Cactus	nature	2025-05-13 02:05:30.743255
38	Moss	nature	2025-05-13 02:05:30.743255
39	Pinecone	nature	2025-05-13 02:05:30.743255
40	Acorn	nature	2025-05-13 02:05:30.743255
41	Pirate	characters	2025-05-13 02:05:30.743255
42	Ninja	characters	2025-05-13 02:05:30.743255
43	Chef	characters	2025-05-13 02:05:30.743255
44	Astronaut	characters	2025-05-13 02:05:30.743255
45	Knight	characters	2025-05-13 02:05:30.743255
46	Robot	characters	2025-05-13 02:05:30.743255
47	Detective	characters	2025-05-13 02:05:30.743255
48	Farmer	characters	2025-05-13 02:05:30.743255
49	Dancer	characters	2025-05-13 02:05:30.743255
50	Witch	characters	2025-05-13 02:05:30.743255
51	Island	places	2025-05-13 02:05:30.743255
52	Desert	places	2025-05-13 02:05:30.743255
53	Jungle	places	2025-05-13 02:05:30.743255
54	Village	places	2025-05-13 02:05:30.743255
55	Mountain	places	2025-05-13 02:05:30.743255
56	Lake	places	2025-05-13 02:05:30.743255
57	Forest	places	2025-05-13 02:05:30.743255
58	Valley	places	2025-05-13 02:05:30.743255
59	Swamp	places	2025-05-13 02:05:30.743255
60	Ruins	places	2025-05-13 02:05:30.743255
61	Pizza	food	2025-05-13 02:05:30.743255
62	Sushi	food	2025-05-13 02:05:30.743255
63	Burger	food	2025-05-13 02:05:30.743255
64	Cupcake	food	2025-05-13 02:05:30.743255
65	Ice Cream	food	2025-05-13 02:05:30.743255
66	Hotdog	food	2025-05-13 02:05:30.743255
67	Sandwich	food	2025-05-13 02:05:30.743255
68	Pretzel	food	2025-05-13 02:05:30.743255
69	Popcorn	food	2025-05-13 02:05:30.743255
70	Burrito	food	2025-05-13 02:05:30.743255
71	Computer	technology	2025-05-13 02:05:30.743255
72	Drone	technology	2025-05-13 02:05:30.743255
73	Camera	technology	2025-05-13 02:05:30.743255
74	Phone	technology	2025-05-13 02:05:30.743255
75	Keyboard	technology	2025-05-13 02:05:30.743255
76	Satellite	technology	2025-05-13 02:05:30.743255
77	Printer	technology	2025-05-13 02:05:30.743255
78	Calculator	technology	2025-05-13 02:05:30.743255
79	Tablet	technology	2025-05-13 02:05:30.743255
80	Speaker	technology	2025-05-13 02:05:30.743255
81	Controller	gaming	2025-05-13 02:05:30.743255
82	Joystick	gaming	2025-05-13 02:05:30.743255
83	Arcade	gaming	2025-05-13 02:05:30.743255
84	Coin	gaming	2025-05-13 02:05:30.743255
85	Sword	gaming	2025-05-13 02:05:30.743255
86	Shield	gaming	2025-05-13 02:05:30.743255
87	Dice	gaming	2025-05-13 02:05:30.743255
88	Potion	gaming	2025-05-13 02:05:30.743255
89	Helmet	gaming	2025-05-13 02:05:30.743255
90	Spaceship	gaming	2025-05-13 02:05:30.743255
91	Swimming	activities	2025-05-13 02:05:30.743255
92	Cycling	activities	2025-05-13 02:05:30.743255
93	Climbing	activities	2025-05-13 02:05:30.743255
94	Painting	activities	2025-05-13 02:05:30.743255
95	Cooking	activities	2025-05-13 02:05:30.743255
96	Dancing	activities	2025-05-13 02:05:30.743255
97	Coding	activities	2025-05-13 02:05:30.743255
98	Fishing	activities	2025-05-13 02:05:30.743255
99	Hiking	activities	2025-05-13 02:05:30.743255
100	Writing	activities	2025-05-13 02:05:30.743255
101	Car	vehicles	2025-05-13 02:05:30.743255
102	Train	vehicles	2025-05-13 02:05:30.743255
103	Bus	vehicles	2025-05-13 02:05:30.743255
104	Airplane	vehicles	2025-05-13 02:05:30.743255
105	Boat	vehicles	2025-05-13 02:05:30.743255
106	Motorcycle	vehicles	2025-05-13 02:05:30.743255
107	Truck	vehicles	2025-05-13 02:05:30.743255
108	Helicopter	vehicles	2025-05-13 02:05:30.743255
109	Scooter	vehicles	2025-05-13 02:05:30.743255
110	Spaceship	vehicles	2025-05-13 02:05:30.743255
111	Rose	plants	2025-05-13 02:05:30.743255
112	Bamboo	plants	2025-05-13 02:05:30.743255
113	Sunflower	plants	2025-05-13 02:05:30.743255
114	Tulip	plants	2025-05-13 02:05:30.743255
115	Dandelion	plants	2025-05-13 02:05:30.743255
116	Palm Tree	plants	2025-05-13 02:05:30.743255
117	Fern	plants	2025-05-13 02:05:30.743255
118	Orchid	plants	2025-05-13 02:05:30.743255
119	Lily	plants	2025-05-13 02:05:30.743255
120	Succulent	plants	2025-05-13 02:05:30.743255
121	Chair	objects	2025-05-13 02:05:30.743255
122	Lamp	objects	2025-05-13 02:05:30.743255
123	Clock	objects	2025-05-13 02:05:30.743255
124	Mirror	objects	2025-05-13 02:05:30.743255
125	Vase	objects	2025-05-13 02:05:30.743255
126	Door	objects	2025-05-13 02:05:30.743255
127	Statue	objects	2025-05-13 02:05:30.743255
128	Candle	objects	2025-05-13 02:05:30.743255
129	Teapot	objects	2025-05-13 02:05:30.743255
130	Table	objects	2025-05-13 02:05:30.743255
131	Ball	sports	2025-05-13 02:05:30.743255
132	Net	sports	2025-05-13 02:05:30.743255
133	Skateboard	sports	2025-05-13 02:05:30.743255
134	Goal	sports	2025-05-13 02:05:30.743255
135	Yellow Card	sports	2025-05-13 02:05:30.743255
136	Baseball Bat	sports	2025-05-13 02:05:30.743255
137	Glove	sports	2025-05-13 02:05:30.743255
138	Hoops	sports	2025-05-13 02:05:30.743255
139	Racket	sports	2025-05-13 02:05:30.743255
140	Skis	sports	2025-05-13 02:05:30.743255
141	Guitar	music	2025-05-13 02:05:30.743255
142	Piano	music	2025-05-13 02:05:30.743255
143	Drum	music	2025-05-13 02:05:30.743255
144	Violin	music	2025-05-13 02:05:30.743255
145	Flute	music	2025-05-13 02:05:30.743255
146	Trumpet	music	2025-05-13 02:05:30.743255
147	Saxophone	music	2025-05-13 02:05:30.743255
148	Microphone	music	2025-05-13 02:05:30.743255
149	DJ Turntable	music	2025-05-13 02:05:30.743255
150	Gamelan	music	2025-05-13 02:05:30.743255
151	Singer	celebrities	2025-05-13 02:05:30.743255
152	Actor	celebrities	2025-05-13 02:05:30.743255
153	Athlete	celebrities	2025-05-13 02:05:30.743255
154	Model	celebrities	2025-05-13 02:05:30.743255
155	Comedian	celebrities	2025-05-13 02:05:30.743255
156	Influencer	celebrities	2025-05-13 02:05:30.743255
157	Director	celebrities	2025-05-13 02:05:30.743255
158	Producer	celebrities	2025-05-13 02:05:30.743255
159	Author	celebrities	2025-05-13 02:05:30.743255
160	Artist	celebrities	2025-05-13 02:05:30.743255
161	Doctor	professions	2025-05-13 02:05:30.743255
162	Engineer	professions	2025-05-13 02:05:30.743255
163	Teacher	professions	2025-05-13 02:05:30.743255
164	Scientist	professions	2025-05-13 02:05:30.743255
165	Artist	professions	2025-05-13 02:05:30.743255
166	Chef	professions	2025-05-13 02:05:30.743255
167	Nurse	professions	2025-05-13 02:05:30.743255
168	Firefighter	professions	2025-05-13 02:05:30.743255
169	Police Officer	professions	2025-05-13 02:05:30.743255
170	Pilot	professions	2025-05-13 02:05:30.743255
171	Dragon	fantasy	2025-05-13 02:05:30.743255
172	Unicorn	fantasy	2025-05-13 02:05:30.743255
173	Fairy	fantasy	2025-05-13 02:05:30.743255
174	Mermaid	fantasy	2025-05-13 02:05:30.743255
175	Goblin	fantasy	2025-05-13 02:05:30.743255
176	Phoenix	fantasy	2025-05-13 02:05:30.743255
177	Griffin	fantasy	2025-05-13 02:05:30.743255
178	Centaur	fantasy	2025-05-13 02:05:30.743255
179	Giant	fantasy	2025-05-13 02:05:30.743255
180	Werewolf	fantasy	2025-05-13 02:05:30.743255
181	Pyramid	landmarks	2025-05-13 02:05:30.743255
182	Colosseum	landmarks	2025-05-13 02:05:30.743255
183	Monas	landmarks	2025-05-13 02:05:30.743255
184	Machu Picchu	landmarks	2025-05-13 02:05:30.743255
185	Great Wall	landmarks	2025-05-13 02:05:30.743255
186	Stonehenge	landmarks	2025-05-13 02:05:30.743255
187	Acropolis	landmarks	2025-05-13 02:05:30.743255
188	Taj Mahal	landmarks	2025-05-13 02:05:30.743255
189	Eiffel Tower	landmarks	2025-05-13 02:05:30.743255
190	Statue of Liberty	landmarks	2025-05-13 02:05:30.743255
191	Ferris Wheel	fair	2025-05-13 02:05:30.743255
192	Roller Coaster	fair	2025-05-13 02:05:30.743255
193	Cotton Candy	fair	2025-05-13 02:05:30.743255
194	Carousel	fair	2025-05-13 02:05:30.743255
195	Funhouse	fair	2025-05-13 02:05:30.743255
196	Bumper Cars	fair	2025-05-13 02:05:30.743255
197	Game Booth	fair	2025-05-13 02:05:30.743255
198	Popcorn Stand	fair	2025-05-13 02:05:30.743255
199	Water Slide	fair	2025-05-13 02:05:30.743255
200	Haunted House	fair	2025-05-13 02:05:30.743255
201	Balloon	party	2025-05-13 02:05:30.743255
202	Cake	party	2025-05-13 02:05:30.743255
203	Confetti	party	2025-05-13 02:05:30.743255
204	Party Hat	party	2025-05-13 02:05:30.743255
205	Streamers	party	2025-05-13 02:05:30.743255
206	Gift Box	party	2025-05-13 02:05:30.743255
207	Party Popper	party	2025-05-13 02:05:30.743255
208	Balloons	party	2025-05-13 02:05:30.743255
209	Party Favor	party	2025-05-13 02:05:30.743255
210	Piñata	party	2025-05-13 02:05:30.743255
211	Present	gifts	2025-05-13 02:05:30.743255
212	Gift Bag	gifts	2025-05-13 02:05:30.743255
213	Ribbon	gifts	2025-05-13 02:05:30.743255
214	Wrapping Paper	gifts	2025-05-13 02:05:30.743255
215	Gift Card	gifts	2025-05-13 02:05:30.743255
216	Bow	gifts	2025-05-13 02:05:30.743255
217	Gift Box	gifts	2025-05-13 02:05:30.743255
218	Greeting Card	gifts	2025-05-13 02:05:30.743255
219	Teddy Bear	gifts	2025-05-13 02:05:30.743255
220	Chocolate Box	gifts	2025-05-13 02:05:30.743255
221	Backpack	stationery	2025-05-13 02:05:30.743255
222	Notebook	stationery	2025-05-13 02:05:30.743255
223	Pencil	stationery	2025-05-13 02:05:30.743255
224	Eraser	stationery	2025-05-13 02:05:30.743255
225	Ruler	stationery	2025-05-13 02:05:30.743255
226	Calculator	stationery	2025-05-13 02:05:30.743255
227	Glue Stick	stationery	2025-05-13 02:05:30.743255
228	Highlighter	stationery	2025-05-13 02:05:30.743255
229	Stapler	stationery	2025-05-13 02:05:30.743255
230	Ballpoint Pen	stationery	2025-05-13 02:05:30.743255
231	Hat	clothing	2025-05-13 02:05:30.743255
232	Boots	clothing	2025-05-13 02:05:30.743255
233	Scarf	clothing	2025-05-13 02:05:30.743255
234	Gloves	clothing	2025-05-13 02:05:30.743255
235	Belt	clothing	2025-05-13 02:05:30.743255
236	Hoodie	clothing	2025-05-13 02:05:30.743255
237	Jacket	clothing	2025-05-13 02:05:30.743255
238	Sneakers	clothing	2025-05-13 02:05:30.743255
239	Tie	clothing	2025-05-13 02:05:30.743255
240	Cape	clothing	2025-05-13 02:05:30.743255
241	Cloud	weather	2025-05-13 02:05:30.743255
242	Rain	weather	2025-05-13 02:05:30.743255
243	Lightning	weather	2025-05-13 02:05:30.743255
244	Snowflake	weather	2025-05-13 02:05:30.743255
245	Sun	weather	2025-05-13 02:05:30.743255
246	Rainbow	weather	2025-05-13 02:05:30.743255
247	Wind	weather	2025-05-13 02:05:30.743255
248	Tornado	weather	2025-05-13 02:05:30.743255
249	Storm	weather	2025-05-13 02:05:30.743255
250	Frost	weather	2025-05-13 02:05:30.743255
251	Planet	space	2025-05-13 02:05:30.743255
252	Star	space	2025-05-13 02:05:30.743255
253	Asteroid	space	2025-05-13 02:05:30.743255
254	Comet	space	2025-05-13 02:05:30.743255
255	Moon	space	2025-05-13 02:05:30.743255
256	Galaxy	space	2025-05-13 02:05:30.743255
257	Nebula	space	2025-05-13 02:05:30.743255
258	Pillars of Creation	space	2025-05-13 02:05:30.743255
259	Meteor	space	2025-05-13 02:05:30.743255
260	Satellite	space	2025-05-13 02:05:30.743255
261	Volcano	landscapes	2025-05-13 02:05:30.743255
262	Canyon	landscapes	2025-05-13 02:05:30.743255
263	Glacier	landscapes	2025-05-13 02:05:30.743255
264	Tundra	landscapes	2025-05-13 02:05:30.743255
265	Wetland	landscapes	2025-05-13 02:05:30.743255
266	Prairie	landscapes	2025-05-13 02:05:30.743255
267	Coral Reef	landscapes	2025-05-13 02:05:30.743255
268	Savannah	landscapes	2025-05-13 02:05:30.743255
269	Badlands	landscapes	2025-05-13 02:05:30.743255
270	Delta	landscapes	2025-05-13 02:05:30.743255
271	Kitchen	rooms	2025-05-13 02:05:30.743255
272	Bathroom	rooms	2025-05-13 02:05:30.743255
273	Bedroom	rooms	2025-05-13 02:05:30.743255
274	Office	rooms	2025-05-13 02:05:30.743255
275	Living Room	rooms	2025-05-13 02:05:30.743255
276	Library	rooms	2025-05-13 02:05:30.743255
277	Garden	rooms	2025-05-13 02:05:30.743255
278	Balcony	rooms	2025-05-13 02:05:30.743255
279	Hallway	rooms	2025-05-13 02:05:30.743255
280	Attic	rooms	2025-05-13 02:05:30.743255
281	Titanic	movies	2025-05-13 02:05:30.743255
282	Jaws	movies	2025-05-13 02:05:30.743255
283	Avengers	movies	2025-05-13 02:05:30.743255
284	Joker	movies	2025-05-13 02:05:30.743255
285	Avatar	movies	2025-05-13 02:05:30.743255
286	Star Wars	movies	2025-05-13 02:05:30.743255
287	Jurassic World	movies	2025-05-13 02:05:30.743255
288	Harry Potter	movies	2025-05-13 02:05:30.743255
289	Lord of the Rings	movies	2025-05-13 02:05:30.743255
290	Pocong	movies	2025-05-13 02:05:30.743255
291	Palette	art	2025-05-13 02:05:30.743255
292	Paintbrush	art	2025-05-13 02:05:30.743255
293	Sculpture	art	2025-05-13 02:05:30.743255
294	Easel	art	2025-05-13 02:05:30.743255
295	Canvas	art	2025-05-13 02:05:30.743255
296	Chisel	art	2025-05-13 02:05:30.743255
297	Sketchbook	art	2025-05-13 02:05:30.743255
298	Crayon	art	2025-05-13 02:05:30.743255
299	Marker	art	2025-05-13 02:05:30.743255
300	Clay	art	2025-05-13 02:05:30.743255
301	Origami	crafts	2025-05-13 02:05:30.743255
302	Glue	crafts	2025-05-13 02:05:30.743255
303	Scissors	crafts	2025-05-13 02:05:30.743255
304	Styrofoam	crafts	2025-05-13 02:05:30.743255
305	Beads	crafts	2025-05-13 02:05:30.743255
306	String	crafts	2025-05-13 02:05:30.743255
307	Recyclables	crafts	2025-05-13 02:05:30.743255
308	Stickers	crafts	2025-05-13 02:05:30.743255
309	Markers	crafts	2025-05-13 02:05:30.743255
310	Tape	crafts	2025-05-13 02:05:30.743255
311	Raging Red	colors	2025-05-13 02:05:30.743255
312	Brooding Blue	colors	2025-05-13 02:05:30.743255
313	Grateful Green	colors	2025-05-13 02:05:30.743255
314	Powerful Purple	colors	2025-05-13 02:05:30.743255
315	Overzealous Orange	colors	2025-05-13 02:05:30.743255
316	Youthful Yellow	colors	2025-05-13 02:05:30.743255
317	Playful Pink	colors	2025-05-13 02:05:30.743255
318	Cool Cyan	colors	2025-05-13 02:05:30.743255
319	Magnificent Magenta	colors	2025-05-13 02:05:30.743255
320	Bubbly Brown	colors	2025-05-13 02:05:30.743255
321	Tyrannosaurus	dinosaurs	2025-05-13 02:05:30.743255
322	Triceratops	dinosaurs	2025-05-13 02:05:30.743255
323	Stegosaurus	dinosaurs	2025-05-13 02:05:30.743255
324	Velociraptor	dinosaurs	2025-05-13 02:05:30.743255
325	Brachiosaurus	dinosaurs	2025-05-13 02:05:30.743255
326	Ankylosaurus	dinosaurs	2025-05-13 02:05:30.743255
327	Spinosaurus	dinosaurs	2025-05-13 02:05:30.743255
328	Pterodactyl	dinosaurs	2025-05-13 02:05:30.743255
329	Argentinosaurus	dinosaurs	2025-05-13 02:05:30.743255
330	Mosasaurus	dinosaurs	2025-05-13 02:05:30.743255
331	Party	occasions	2025-05-13 02:05:30.743255
332	Parade	occasions	2025-05-13 02:05:30.743255
333	Concert	occasions	2025-05-13 02:05:30.743255
334	Festival	occasions	2025-05-13 02:05:30.743255
335	Fair	occasions	2025-05-13 02:05:30.743255
336	Ceremony	occasions	2025-05-13 02:05:30.743255
337	Rally	occasions	2025-05-13 02:05:30.743255
338	Tournament	occasions	2025-05-13 02:05:30.743255
339	Marathon	occasions	2025-05-13 02:05:30.743255
340	Exhibition	occasions	2025-05-13 02:05:30.743255
341	Christmas	occasions	2025-05-13 02:05:30.743255
342	Halloween	occasions	2025-05-13 02:05:30.743255
343	New Year	occasions	2025-05-13 02:05:30.743255
344	Valentine	occasions	2025-05-13 02:05:30.743255
345	Easter	occasions	2025-05-13 02:05:30.743255
346	Diwali	occasions	2025-05-13 02:05:30.743255
347	Hanukkah	occasions	2025-05-13 02:05:30.743255
348	Eid	occasions	2025-05-13 02:05:30.743255
349	Thanksgiving	occasions	2025-05-13 02:05:30.743255
350	Independence	occasions	2025-05-13 02:05:30.743255
\.


--
-- Data for Name: room_players; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.room_players (room_id, user_id, joined_at, last_active) FROM stdin;
NO4LBF	7	2025-05-20 16:37:58.700574	2025-05-20 16:37:58.700574
NO4LBF	12	2025-05-20 16:38:03.877093	2025-05-20 16:38:03.877093
WCYS6J	6	2025-05-20 16:41:27.776217	2025-05-20 16:41:27.776217
WCYS6J	5	2025-05-20 16:41:40.008932	2025-05-20 16:41:40.008932
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.rooms (id, name, host_id, max_players, drawing_time, voting_time, rounds, is_private, status, current_round, current_phase, current_prompt_id, current_drawing_index, phase_end_time, created_at, updated_at) FROM stdin;
AYN679	ok	6	3	30	10	3	f	playing	3	results	169	1	\N	2025-05-20 15:10:50.945905	2025-05-20 15:12:18.11072
NO4LBF	nigg	7	6	120	20	3	f	completed	3	results	197	0	\N	2025-05-20 16:37:58.679504	2025-05-20 16:45:00.338942
WCYS6J	ok	6	6	120	20	3	f	completed	3	results	239	0	\N	2025-05-20 16:41:27.756795	2025-05-20 16:48:45.27796
SUU22Z	ok	6	4	30	10	1	f	completed	1	results	121	0	\N	2025-05-20 14:55:29.788778	2025-05-20 14:56:31.456334
SVPZRC	ok	6	3	30	10	3	f	completed	3	results	333	0	\N	2025-05-20 15:14:54.025305	2025-05-20 15:16:35.381473
5Z6J47	ok	6	2	30	10	1	f	playing	1	results	116	1	\N	2025-05-20 15:16:55.352057	2025-05-20 15:17:18.132361
DYFLZZ	ok	6	2	120	30	1	f	completed	1	results	106	0	\N	2025-05-20 15:18:12.710648	2025-05-20 15:20:48.734819
1ZFC1B	ok	6	3	30	10	3	f	completed	3	results	105	0	\N	2025-05-20 15:06:04.304675	2025-05-20 15:08:12.923032
\.


--
-- Data for Name: stars; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stars (id, drawing_id, voter_id, rating, created_at) FROM stdin;
96	112	5	1	2025-05-20 16:16:43.499853
97	113	6	5	2025-05-20 16:30:36.641177
98	114	5	1	2025-05-20 16:30:39.482516
100	116	7	5	2025-05-20 16:40:15.935181
101	117	12	4	2025-05-20 16:40:18.594742
19	24	6	5	2025-05-18 14:15:35.957569
20	25	5	3	2025-05-18 14:15:38.494655
22	27	6	5	2025-05-18 14:17:48.094346
24	29	6	5	2025-05-18 14:19:29.327814
25	30	8	5	2025-05-19 07:41:43.376192
26	31	9	5	2025-05-19 07:41:44.788183
27	32	9	5	2025-05-19 07:42:04.712785
28	33	8	5	2025-05-19 07:42:05.909179
29	34	8	5	2025-05-19 07:42:32.968737
30	35	9	4	2025-05-19 07:42:34.271518
41	47	5	5	2025-05-19 11:49:06.657163
50	59	12	4	2025-05-20 12:24:32.865915
51	60	7	5	2025-05-20 12:24:34.901581
52	61	5	5	2025-05-20 12:52:07.710471
60	69	6	5	2025-05-20 13:22:48.421022
61	70	5	2	2025-05-20 13:22:51.418707
62	72	5	4	2025-05-20 14:31:16.80485
74	90	5	2	2025-05-20 15:12:09.80525
81	97	6	5	2025-05-20 15:24:47.631174
83	99	6	5	2025-05-20 15:25:17.646115
89	105	12	5	2025-05-20 15:40:47.913813
90	106	7	5	2025-05-20 15:40:53.803299
91	107	12	4	2025-05-20 15:41:42.344083
92	108	7	4	2025-05-20 15:41:45.334546
93	109	12	4	2025-05-20 15:42:25.984378
94	110	7	5	2025-05-20 15:42:29.714619
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, created_at) FROM stdin;
1	adrian	$2b$10$I5UyFFNzX4mT8DQ1hycJwu8V4IZzLIAIFkLgl8CfrDjKlbIitaUMi	2025-05-13 02:31:07.803419
2	test1946	$2b$10$1Z77uuvxzcIPnmc7KS0oPezQJYv0bz7aW/fUy7LDrBmkqm2XqGIWe	2025-05-17 12:46:58.970182
3	test1947	$2b$10$gmqNnqabJQHXWQL5r6uI4.aWzA/2mG1.Wrtj40qsDDUipKlwweQEm	2025-05-17 12:48:02.144816
6	dika	$2b$10$plcaMA315QoKTwQMLvOwH.dap7zwe0cwI7mvpbdy6QH.Ur8vb5vHu	2025-05-18 02:47:04.681716
8	Alex	$2b$10$izlXBDizaLlq4SpzM03F5u98PdXkFRCihtoXUdBfpEUgPuiGTSJdK	2025-05-19 07:40:13.524578
9	BantalEmak	$2b$10$/GdFTAIjRK927i/UgJfZ.uMz05B7yCdU1zMbWZI/clRgKUiM2ESwS	2025-05-19 07:41:16.156502
10	aaaaaee	$2b$10$3buvjUQRYH.N/QIA9CXGKeJs5tMr/vjgH742ulAxCTueHtrLjzcwC	2025-05-19 12:54:01.539559
11	hueeeee	$2b$10$Nf4dhllGBE5qcc0wTcI3.uMr3Bw5/B5InhrIAyflJnkSay1ciSlTm	2025-05-20 11:21:00.606273
4	testifan1	$2b$10$n887K2v2uKU204AcDF8Die8eJN37jOFS3Re8GHYmk7.jOH65bwq/C	2025-05-17 14:03:08.999065
7	testifan2new	$2b$10$8EGrR/BDnre.eMvEZ.AYYequF.Is04GMARpbfXY8pvH5L6ezz.M1a	2025-05-17 16:07:29.063237
12	testifan3	$2b$10$e2HMyeFHd1a8uENOWJAjiukZk05dx2zVZmZjaRXg4CwD5xMaFnIYC	2025-05-20 12:21:03.081495
5	adriann	$2b$10$hvdpjf6S11tA8IENrZxTJebSigvijACcznmOS6QhlE0KqQd0R3e4S	2025-05-18 02:55:34.846434
\.


--
-- Name: drawings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.drawings_id_seq', 117, true);


--
-- Name: game_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.game_results_id_seq', 20, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.migrations_id_seq', 2, true);


--
-- Name: prompts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.prompts_id_seq', 350, true);


--
-- Name: stars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stars_id_seq', 101, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: drawings drawings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drawings
    ADD CONSTRAINT drawings_pkey PRIMARY KEY (id);


--
-- Name: game_results game_results_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_pkey PRIMARY KEY (id);


--
-- Name: game_results game_results_room_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_room_id_user_id_key UNIQUE (room_id, user_id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: prompts prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_pkey PRIMARY KEY (id);


--
-- Name: room_players room_players_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.room_players
    ADD CONSTRAINT room_players_pkey PRIMARY KEY (room_id, user_id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: stars stars_drawing_id_voter_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stars
    ADD CONSTRAINT stars_drawing_id_voter_id_key UNIQUE (drawing_id, voter_id);


--
-- Name: stars stars_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stars
    ADD CONSTRAINT stars_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_room_players_last_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_room_players_last_active ON public.room_players USING btree (last_active);


--
-- Name: idx_rooms_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_rooms_status ON public.rooms USING btree (status);


--
-- Name: idx_rooms_updated_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_rooms_updated_at ON public.rooms USING btree (updated_at);


--
-- Name: room_players trigger_check_empty_room; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER trigger_check_empty_room AFTER DELETE ON public.room_players FOR EACH ROW EXECUTE FUNCTION public.check_empty_room();


--
-- Name: room_players update_room_players_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_room_players_timestamp BEFORE UPDATE ON public.room_players FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: rooms update_rooms_timestamp; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER update_rooms_timestamp BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: drawings drawings_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drawings
    ADD CONSTRAINT drawings_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: drawings drawings_prompt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drawings
    ADD CONSTRAINT drawings_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.prompts(id);


--
-- Name: drawings drawings_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drawings
    ADD CONSTRAINT drawings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;


--
-- Name: game_results game_results_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: game_results game_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.game_results
    ADD CONSTRAINT game_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: room_players room_players_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.room_players
    ADD CONSTRAINT room_players_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- Name: room_players room_players_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.room_players
    ADD CONSTRAINT room_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: rooms rooms_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stars stars_drawing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stars
    ADD CONSTRAINT stars_drawing_id_fkey FOREIGN KEY (drawing_id) REFERENCES public.drawings(id) ON DELETE CASCADE;


--
-- Name: stars stars_voter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stars
    ADD CONSTRAINT stars_voter_id_fkey FOREIGN KEY (voter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--


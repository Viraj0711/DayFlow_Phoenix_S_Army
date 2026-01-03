--
-- PostgreSQL database dump
--

\restrict SofnbU48anVizwSyE5U6TOZKzj3Ii7bKzugs3COW3uu4sEo4aVs8b0oG4pIXNlv

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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

ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.payroll_records DROP CONSTRAINT IF EXISTS payroll_records_salary_structure_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payroll_records DROP CONSTRAINT IF EXISTS payroll_records_generated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.payroll_records DROP CONSTRAINT IF EXISTS payroll_records_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_approver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_salary_structure_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_reporting_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_employee_id_fkey;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_salary_structure_updated_at ON public.salary_structures;
DROP TRIGGER IF EXISTS update_leave_updated_at ON public.leave_requests;
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance_records;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_employee_id;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_created_at;
DROP INDEX IF EXISTS public.idx_salary_structures_active;
DROP INDEX IF EXISTS public.idx_payroll_status;
DROP INDEX IF EXISTS public.idx_payroll_period;
DROP INDEX IF EXISTS public.idx_payroll_generated;
DROP INDEX IF EXISTS public.idx_payroll_employee;
DROP INDEX IF EXISTS public.idx_notifications_user_unread;
DROP INDEX IF EXISTS public.idx_notifications_user;
DROP INDEX IF EXISTS public.idx_notifications_type;
DROP INDEX IF EXISTS public.idx_notifications_read;
DROP INDEX IF EXISTS public.idx_notifications_payload;
DROP INDEX IF EXISTS public.idx_notifications_created;
DROP INDEX IF EXISTS public.idx_leave_type;
DROP INDEX IF EXISTS public.idx_leave_status;
DROP INDEX IF EXISTS public.idx_leave_employee;
DROP INDEX IF EXISTS public.idx_leave_dates;
DROP INDEX IF EXISTS public.idx_leave_created;
DROP INDEX IF EXISTS public.idx_leave_approver;
DROP INDEX IF EXISTS public.idx_employees_user_id;
DROP INDEX IF EXISTS public.idx_employees_status;
DROP INDEX IF EXISTS public.idx_employees_manager;
DROP INDEX IF EXISTS public.idx_employees_joining_date;
DROP INDEX IF EXISTS public.idx_employees_documents;
DROP INDEX IF EXISTS public.idx_employees_designation;
DROP INDEX IF EXISTS public.idx_employees_department;
DROP INDEX IF EXISTS public.idx_audit_user;
DROP INDEX IF EXISTS public.idx_audit_entity;
DROP INDEX IF EXISTS public.idx_audit_created;
DROP INDEX IF EXISTS public.idx_audit_action;
DROP INDEX IF EXISTS public.idx_attendance_status;
DROP INDEX IF EXISTS public.idx_attendance_employee_date;
DROP INDEX IF EXISTS public.idx_attendance_employee;
DROP INDEX IF EXISTS public.idx_attendance_date_range;
DROP INDEX IF EXISTS public.idx_attendance_date;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_employee_id_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.payroll_records DROP CONSTRAINT IF EXISTS unique_payroll_per_month;
ALTER TABLE IF EXISTS ONLY public.attendance_records DROP CONSTRAINT IF EXISTS unique_attendance_per_day;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.salary_structures DROP CONSTRAINT IF EXISTS salary_structures_pkey;
ALTER TABLE IF EXISTS ONLY public.payroll_records DROP CONSTRAINT IF EXISTS payroll_records_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_user_id_key;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance_records DROP CONSTRAINT IF EXISTS attendance_records_pkey;
ALTER TABLE IF EXISTS public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.salary_structures ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payroll_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leave_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendance_records ALTER COLUMN id DROP DEFAULT;
DROP VIEW IF EXISTS public.v_monthly_attendance_summary;
DROP VIEW IF EXISTS public.v_employee_details;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.system_settings_id_seq;
DROP TABLE IF EXISTS public.system_settings;
DROP TABLE IF EXISTS public.schema_migrations;
DROP SEQUENCE IF EXISTS public.salary_structures_id_seq;
DROP TABLE IF EXISTS public.salary_structures;
DROP SEQUENCE IF EXISTS public.payroll_records_id_seq;
DROP TABLE IF EXISTS public.payroll_records;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.leave_requests_id_seq;
DROP TABLE IF EXISTS public.leave_requests;
DROP SEQUENCE IF EXISTS public.employees_id_seq;
DROP TABLE IF EXISTS public.employees;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.attendance_records_id_seq;
DROP TABLE IF EXISTS public.attendance_records;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.notification_type;
DROP TYPE IF EXISTS public.leave_type;
DROP TYPE IF EXISTS public.leave_status;
DROP TYPE IF EXISTS public.employment_status;
DROP TYPE IF EXISTS public.attendance_status;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS citext;
--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: attendance_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.attendance_status AS ENUM (
    'PRESENT',
    'ABSENT',
    'HALF_DAY',
    'LEAVE',
    'WORK_FROM_HOME',
    'ON_DUTY'
);


ALTER TYPE public.attendance_status OWNER TO postgres;

--
-- Name: employment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employment_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'TERMINATED',
    'RESIGNED',
    'ON_NOTICE'
);


ALTER TYPE public.employment_status OWNER TO postgres;

--
-- Name: leave_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leave_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.leave_status OWNER TO postgres;

--
-- Name: leave_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.leave_type AS ENUM (
    'PAID',
    'SICK',
    'CASUAL',
    'UNPAID',
    'MATERNITY',
    'PATERNITY',
    'BEREAVEMENT',
    'COMPENSATORY'
);


ALTER TYPE public.leave_type OWNER TO postgres;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'LEAVE_REQUEST',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'ATTENDANCE_ALERT',
    'PAYROLL_GENERATED',
    'PROFILE_UPDATE',
    'SYSTEM_ANNOUNCEMENT',
    'DOCUMENT_UPLOADED'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'PENDING',
    'PROCESSED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'EMPLOYEE',
    'HR_ADMIN',
    'MANAGER',
    'SUPER_ADMIN'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_records (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    date date NOT NULL,
    check_in_at timestamp with time zone,
    check_out_at timestamp with time zone,
    status public.attendance_status DEFAULT 'ABSENT'::public.attendance_status NOT NULL,
    work_hours numeric(4,2) GENERATED ALWAYS AS (
CASE
    WHEN ((check_in_at IS NOT NULL) AND (check_out_at IS NOT NULL)) THEN (EXTRACT(epoch FROM (check_out_at - check_in_at)) / (3600)::numeric)
    ELSE (0)::numeric
END) STORED,
    remarks text,
    is_late boolean DEFAULT false,
    late_by_minutes integer DEFAULT 0,
    location_check_in character varying(255),
    location_check_out character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attendance_records OWNER TO postgres;

--
-- Name: attendance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_records_id_seq OWNER TO postgres;

--
-- Name: attendance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_records_id_seq OWNED BY public.attendance_records.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id integer,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    first_name character varying(100) NOT NULL,
    middle_name character varying(100),
    last_name character varying(100) NOT NULL,
    date_of_birth date NOT NULL,
    gender character varying(20),
    marital_status character varying(20),
    blood_group character varying(10),
    phone character varying(20) NOT NULL,
    alternate_phone character varying(20),
    personal_email public.citext,
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state character varying(100),
    postal_code character varying(20),
    country character varying(100) DEFAULT 'India'::character varying,
    designation character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    date_of_joining date NOT NULL,
    employment_status public.employment_status DEFAULT 'ACTIVE'::public.employment_status NOT NULL,
    reporting_manager_id integer,
    salary_structure_id integer,
    profile_picture_url text,
    emergency_contact_name character varying(100),
    emergency_contact_phone character varying(20),
    emergency_contact_relation character varying(50),
    documents jsonb DEFAULT '{}'::jsonb,
    paid_leave_balance integer DEFAULT 20 NOT NULL,
    sick_leave_balance integer DEFAULT 10 NOT NULL,
    casual_leave_balance integer DEFAULT 7 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    leave_type public.leave_type NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    remarks text,
    status public.leave_status DEFAULT 'PENDING'::public.leave_status NOT NULL,
    approver_id integer,
    approver_comment text,
    decided_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT valid_date_range CHECK ((end_date >= start_date)),
    CONSTRAINT valid_total_days CHECK ((total_days > 0))
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_requests_id_seq OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    type public.notification_type NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payroll_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_records (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    salary_structure_id integer,
    month integer NOT NULL,
    year integer NOT NULL,
    basic_salary numeric(12,2) NOT NULL,
    hra numeric(12,2) DEFAULT 0.00 NOT NULL,
    transport_allowance numeric(12,2) DEFAULT 0.00 NOT NULL,
    medical_allowance numeric(12,2) DEFAULT 0.00 NOT NULL,
    special_allowance numeric(12,2) DEFAULT 0.00 NOT NULL,
    provident_fund numeric(12,2) DEFAULT 0.00 NOT NULL,
    professional_tax numeric(12,2) DEFAULT 0.00 NOT NULL,
    income_tax numeric(12,2) DEFAULT 0.00 NOT NULL,
    other_deductions numeric(12,2) DEFAULT 0.00 NOT NULL,
    days_present integer DEFAULT 0 NOT NULL,
    days_absent integer DEFAULT 0 NOT NULL,
    days_leave integer DEFAULT 0 NOT NULL,
    loss_of_pay_days integer DEFAULT 0 NOT NULL,
    loss_of_pay_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    bonus numeric(12,2) DEFAULT 0.00 NOT NULL,
    incentive numeric(12,2) DEFAULT 0.00 NOT NULL,
    gross_salary numeric(12,2) NOT NULL,
    total_deductions numeric(12,2) NOT NULL,
    net_salary numeric(12,2) NOT NULL,
    payment_status public.payment_status DEFAULT 'PENDING'::public.payment_status NOT NULL,
    payment_date date,
    payment_reference character varying(255),
    generated_by integer,
    generated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payroll_records_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT payroll_records_year_check CHECK ((year >= 2020))
);


ALTER TABLE public.payroll_records OWNER TO postgres;

--
-- Name: payroll_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payroll_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payroll_records_id_seq OWNER TO postgres;

--
-- Name: payroll_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payroll_records_id_seq OWNED BY public.payroll_records.id;


--
-- Name: salary_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_structures (
    id integer NOT NULL,
    structure_name character varying(100) NOT NULL,
    basic_salary numeric(12,2) NOT NULL,
    hra numeric(12,2) DEFAULT 0.00 NOT NULL,
    transport_allowance numeric(12,2) DEFAULT 0.00 NOT NULL,
    medical_allowance numeric(12,2) DEFAULT 0.00 NOT NULL,
    special_allowance numeric(12,2) DEFAULT 0.00 NOT NULL,
    provident_fund_percent numeric(5,2) DEFAULT 12.00 NOT NULL,
    professional_tax numeric(10,2) DEFAULT 0.00 NOT NULL,
    income_tax_percent numeric(5,2) DEFAULT 0.00 NOT NULL,
    other_deductions numeric(10,2) DEFAULT 0.00 NOT NULL,
    gross_salary numeric(12,2) GENERATED ALWAYS AS (((((basic_salary + hra) + transport_allowance) + medical_allowance) + special_allowance)) STORED,
    net_salary numeric(12,2) GENERATED ALWAYS AS ((((((((basic_salary + hra) + transport_allowance) + medical_allowance) + special_allowance) - ((basic_salary * provident_fund_percent) / (100)::numeric)) - professional_tax) - other_deductions)) STORED,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.salary_structures OWNER TO postgres;

--
-- Name: salary_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salary_structures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salary_structures_id_seq OWNER TO postgres;

--
-- Name: salary_structures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salary_structures_id_seq OWNED BY public.salary_structures.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schema_migrations (
    version character varying(50) NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.schema_migrations OWNER TO postgres;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    description text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id character varying(50) NOT NULL,
    email public.citext NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role DEFAULT 'EMPLOYEE'::public.user_role NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    verification_token character varying(255),
    reset_token character varying(255),
    reset_token_expires_at timestamp with time zone,
    last_login_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: v_employee_details; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_employee_details AS
 SELECT e.id,
    e.user_id,
    u.employee_id,
    u.email,
    u.role,
    e.first_name,
    e.middle_name,
    e.last_name,
    concat(e.first_name, ' ', e.last_name) AS full_name,
    e.phone,
    e.designation,
    e.department,
    e.date_of_joining,
    e.employment_status,
    e.profile_picture_url,
    s.structure_name AS salary_structure,
    s.gross_salary,
    s.net_salary,
    (((manager.first_name)::text || ' '::text) || (manager.last_name)::text) AS manager_name,
    e.paid_leave_balance,
    e.sick_leave_balance,
    e.casual_leave_balance
   FROM (((public.employees e
     JOIN public.users u ON ((e.user_id = u.id)))
     LEFT JOIN public.salary_structures s ON ((e.salary_structure_id = s.id)))
     LEFT JOIN public.employees manager ON ((e.reporting_manager_id = manager.id)));


ALTER VIEW public.v_employee_details OWNER TO postgres;

--
-- Name: v_monthly_attendance_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_monthly_attendance_summary AS
 SELECT employee_id,
    EXTRACT(year FROM date) AS year,
    EXTRACT(month FROM date) AS month,
    count(*) FILTER (WHERE (status = 'PRESENT'::public.attendance_status)) AS present_days,
    count(*) FILTER (WHERE (status = 'ABSENT'::public.attendance_status)) AS absent_days,
    count(*) FILTER (WHERE (status = 'HALF_DAY'::public.attendance_status)) AS half_days,
    count(*) FILTER (WHERE (status = 'LEAVE'::public.attendance_status)) AS leave_days,
    count(*) FILTER (WHERE (is_late = true)) AS late_days,
    round(avg(work_hours), 2) AS avg_work_hours
   FROM public.attendance_records
  GROUP BY employee_id, (EXTRACT(year FROM date)), (EXTRACT(month FROM date));


ALTER VIEW public.v_monthly_attendance_summary OWNER TO postgres;

--
-- Name: attendance_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_records ALTER COLUMN id SET DEFAULT nextval('public.attendance_records_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payroll_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_records ALTER COLUMN id SET DEFAULT nextval('public.payroll_records_id_seq'::regclass);


--
-- Name: salary_structures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_structures ALTER COLUMN id SET DEFAULT nextval('public.salary_structures_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_records (id, employee_id, date, check_in_at, check_out_at, status, remarks, is_late, late_by_minutes, location_check_in, location_check_out, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, user_id, first_name, middle_name, last_name, date_of_birth, gender, marital_status, blood_group, phone, alternate_phone, personal_email, address_line1, address_line2, city, state, postal_code, country, designation, department, date_of_joining, employment_status, reporting_manager_id, salary_structure_id, profile_picture_url, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, documents, paid_leave_balance, sick_leave_balance, casual_leave_balance, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, employee_id, leave_type, start_date, end_date, total_days, remarks, status, approver_id, approver_comment, decided_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, payload, is_read, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_records (id, employee_id, salary_structure_id, month, year, basic_salary, hra, transport_allowance, medical_allowance, special_allowance, provident_fund, professional_tax, income_tax, other_deductions, days_present, days_absent, days_leave, loss_of_pay_days, loss_of_pay_amount, bonus, incentive, gross_salary, total_deductions, net_salary, payment_status, payment_date, payment_reference, generated_by, generated_at) FROM stdin;
\.


--
-- Data for Name: salary_structures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_structures (id, structure_name, basic_salary, hra, transport_allowance, medical_allowance, special_allowance, provident_fund_percent, professional_tax, income_tax_percent, other_deductions, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schema_migrations (version, applied_at) FROM stdin;
1.0.0	2026-01-03 15:47:06.330555+05:30
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, setting_key, setting_value, description, updated_by, updated_at) FROM stdin;
1	work_start_time	09:00:00	Standard work start time	\N	2026-01-03 15:47:06.330555+05:30
2	work_end_time	18:00:00	Standard work end time	\N	2026-01-03 15:47:06.330555+05:30
3	late_threshold_minutes	15	Minutes after which employee is marked late	\N	2026-01-03 15:47:06.330555+05:30
4	half_day_hours	4	Minimum hours for half day	\N	2026-01-03 15:47:06.330555+05:30
5	full_day_hours	8	Minimum hours for full day	\N	2026-01-03 15:47:06.330555+05:30
6	paid_leave_annual	20	Annual paid leave quota	\N	2026-01-03 15:47:06.330555+05:30
7	sick_leave_annual	10	Annual sick leave quota	\N	2026-01-03 15:47:06.330555+05:30
8	casual_leave_annual	7	Annual casual leave quota	\N	2026-01-03 15:47:06.330555+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, employee_id, email, password_hash, role, email_verified, verification_token, reset_token, reset_token_expires_at, last_login_at, is_active, created_at, updated_at) FROM stdin;
5f2bfbad-3770-4bda-89a3-900e507698e0	EMP001	admin@dayflow.com	$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQbgi9/MPaGOskngdiwu.	HR_ADMIN	t	\N	\N	\N	\N	t	2026-01-03 15:47:06.330555+05:30	2026-01-03 15:47:06.330555+05:30
\.


--
-- Name: attendance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_records_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: payroll_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payroll_records_id_seq', 1, false);


--
-- Name: salary_structures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salary_structures_id_seq', 1, false);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 8, true);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payroll_records payroll_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_pkey PRIMARY KEY (id);


--
-- Name: salary_structures salary_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_structures
    ADD CONSTRAINT salary_structures_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: attendance_records unique_attendance_per_day; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT unique_attendance_per_day UNIQUE (employee_id, date);


--
-- Name: payroll_records unique_payroll_per_month; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT unique_payroll_per_month UNIQUE (employee_id, month, year);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_attendance_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_date ON public.attendance_records USING btree (date);


--
-- Name: idx_attendance_date_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_date_range ON public.attendance_records USING btree (date DESC);


--
-- Name: idx_attendance_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_employee ON public.attendance_records USING btree (employee_id);


--
-- Name: idx_attendance_employee_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_employee_date ON public.attendance_records USING btree (employee_id, date);


--
-- Name: idx_attendance_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_status ON public.attendance_records USING btree (status);


--
-- Name: idx_audit_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_created ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department);


--
-- Name: idx_employees_designation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_designation ON public.employees USING btree (designation);


--
-- Name: idx_employees_documents; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_documents ON public.employees USING gin (documents);


--
-- Name: idx_employees_joining_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_joining_date ON public.employees USING btree (date_of_joining);


--
-- Name: idx_employees_manager; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_manager ON public.employees USING btree (reporting_manager_id);


--
-- Name: idx_employees_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_status ON public.employees USING btree (employment_status);


--
-- Name: idx_employees_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_user_id ON public.employees USING btree (user_id);


--
-- Name: idx_leave_approver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_approver ON public.leave_requests USING btree (approver_id);


--
-- Name: idx_leave_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_created ON public.leave_requests USING btree (created_at DESC);


--
-- Name: idx_leave_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_dates ON public.leave_requests USING btree (start_date, end_date);


--
-- Name: idx_leave_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_employee ON public.leave_requests USING btree (employee_id);


--
-- Name: idx_leave_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_status ON public.leave_requests USING btree (status);


--
-- Name: idx_leave_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_type ON public.leave_requests USING btree (leave_type);


--
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_payload; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_payload ON public.notifications USING gin (payload);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_payroll_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_employee ON public.payroll_records USING btree (employee_id);


--
-- Name: idx_payroll_generated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_generated ON public.payroll_records USING btree (generated_at DESC);


--
-- Name: idx_payroll_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_period ON public.payroll_records USING btree (year, month);


--
-- Name: idx_payroll_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_status ON public.payroll_records USING btree (payment_status);


--
-- Name: idx_salary_structures_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_salary_structures_active ON public.salary_structures USING btree (is_active);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_employee_id ON public.users USING btree (employee_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: attendance_records update_attendance_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: employees update_employees_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leave_requests update_leave_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_leave_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: salary_structures update_salary_structure_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_salary_structure_updated_at BEFORE UPDATE ON public.salary_structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendance_records attendance_records_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employees employees_reporting_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_reporting_manager_id_fkey FOREIGN KEY (reporting_manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: employees employees_salary_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_salary_structure_id_fkey FOREIGN KEY (salary_structure_id) REFERENCES public.salary_structures(id) ON DELETE SET NULL;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payroll_records payroll_records_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: payroll_records payroll_records_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: payroll_records payroll_records_salary_structure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_salary_structure_id_fkey FOREIGN KEY (salary_structure_id) REFERENCES public.salary_structures(id) ON DELETE SET NULL;


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict SofnbU48anVizwSyE5U6TOZKzj3Ii7bKzugs3COW3uu4sEo4aVs8b0oG4pIXNlv


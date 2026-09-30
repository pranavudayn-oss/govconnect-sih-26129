from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from .models import (
    Department, Citizen, Application, ApplicationEvent,
    Notification, AuditLog, User, ServiceCatalog, Document, ConsentRecord
)

def seed(db: Session):
    # 1. Seed Demo Users
    if db.query(User).count() == 0:
        demo_users = [
            User(
                email="citizen@govconnect.demo",
                username="priya.sharma",
                full_name="Priya Sharma",
                role="CITIZEN",
                citizen_ref="CIT-DEMO-001",
                designation="Citizen Applicant",
                is_active=True
            ),
            User(
                email="officer@govconnect.demo",
                username="rajesh.kumar",
                full_name="Rajesh Kumar",
                role="OFFICER",
                department_code="REV",
                designation="Senior Verification Officer",
                is_active=True
            ),
            User(
                email="deptadmin@govconnect.demo",
                username="sunita.rao",
                full_name="Sunita Rao",
                role="DEPARTMENT_ADMIN",
                department_code="MUNI",
                designation="Municipal Services Director",
                is_active=True
            ),
            User(
                email="admin@govconnect.demo",
                username="dr.v.narayanan",
                full_name="Dr. V. Narayanan",
                role="SYSTEM_ADMIN",
                designation="Interoperability Gateway Administrator",
                is_active=True
            )
        ]
        db.add_all(demo_users)
        db.commit()

    # 2. Seed Departments
    departments_spec = [
        Department(
            code="REV",
            name="Revenue Department",
            category="Certificates & Land Records",
            connector_type="REST",
            endpoint="simulated://revenue-api.gov.internal/v2",
            officer_count=18,
            total_requests_today=1420,
            success_rate=99.4,
            average_latency_ms=115,
            status="Connected"
        ),
        Department(
            code="MUNI",
            name="Municipal Services Corporation",
            category="Civic Services & Property",
            connector_type="REST",
            endpoint="simulated://municipal.gov.internal/rest",
            officer_count=14,
            total_requests_today=1180,
            success_rate=98.8,
            average_latency_ms=145,
            status="Connected"
        ),
        Department(
            code="SOC",
            name="Social Welfare Directorate",
            category="Benefits & Pensions",
            connector_type="SOAP",
            endpoint="simulated://socialwelfare.gov.internal/soap-v1",
            officer_count=10,
            total_requests_today=640,
            success_rate=97.9,
            average_latency_ms=210,
            status="Connected"
        ),
        Department(
            code="TRANS",
            name="Transport Authority",
            category="Licensing & Vehicles",
            connector_type="REST",
            endpoint="simulated://sarathi-transport.gov.internal/api",
            officer_count=16,
            total_requests_today=1890,
            success_rate=99.1,
            average_latency_ms=105,
            status="Connected"
        ),
        Department(
            code="EDU",
            name="Education Board",
            category="Scholarships & Higher Education",
            connector_type="DB Adapter",
            endpoint="simulated://edu-federated.internal/sync",
            officer_count=8,
            total_requests_today=520,
            success_rate=99.6,
            average_latency_ms=90,
            status="Connected"
        ),
        Department(
            code="HEALTH",
            name="Health & Family Welfare",
            category="Public Health & Benefits",
            connector_type="FHIR",
            endpoint="simulated://health-abdm.internal/fhir/r4",
            officer_count=12,
            total_requests_today=730,
            success_rate=98.5,
            average_latency_ms=160,
            status="Connected"
        )
    ]
    for d_spec in departments_spec:
        existing_d = db.query(Department).filter_by(code=d_spec.code).first()
        if not existing_d:
            db.add(d_spec)
    db.commit()

    # 3. Seed Primary Demo Citizen
    if db.query(Citizen).count() == 0:
        db.add(Citizen(
            citizen_ref="CIT-DEMO-001",
            name="Priya Sharma",
            email="citizen@govconnect.demo",
            phone="+91 98765 43210",
            address="Flat 402, Block B, Govt Colony, New Delhi",
            kyc_status="VERIFIED",
            profile_completed_pct=95,
            consent_given=True,
            last_login=datetime.utcnow() - timedelta(minutes=45)
        ))
        db.commit()

    # 4. Seed Government Service Catalog
    if db.query(ServiceCatalog).count() == 0:
        rev = db.query(Department).filter_by(code="REV").first()
        muni = db.query(Department).filter_by(code="MUNI").first()
        soc = db.query(Department).filter_by(code="SOC").first()
        trans = db.query(Department).filter_by(code="TRANS").first()
        edu = db.query(Department).filter_by(code="EDU").first()
        health = db.query(Department).filter_by(code="HEALTH").first()

        services = [
            ServiceCatalog(
                code="SRV-REV-INC",
                name="Income Certificate",
                department_id=rev.id,
                category="Revenue",
                description="Official certification of household annual income for scholarship and government welfare eligibility.",
                eligibility="Resident of the state with self-declared or employer-certified income details.",
                required_documents="Identity Proof, Address Proof, Salary Slip or Form 16, Bank Statement",
                estimated_processing_days=7,
                digital_availability="100% Online",
                fee=0,
                workflow_stages="Submission,Identity Verification,Document Verification,Department Processing,Approval,Service Delivered"
            ),
            ServiceCatalog(
                code="SRV-REV-RES",
                name="Residence & Domicile Certificate",
                department_id=rev.id,
                category="Certificates",
                description="Statutory proof of continuous residence required for state quota admissions and government recruitments.",
                eligibility="Minimum continuous residence of 3+ years in the jurisdiction.",
                required_documents="Electricity Bill, Land/Lease Agreement, School Leaving Certificate",
                estimated_processing_days=10,
                digital_availability="100% Online",
                fee=50,
                workflow_stages="Submission,Document Verification,Field Verification,Revenue Officer Approval,Service Delivered"
            ),
            ServiceCatalog(
                code="SRV-MUNI-TAX",
                name="Property Tax Assessment & NOC",
                department_id=muni.id,
                category="Municipal Services",
                description="Assessment of annual municipal property tax dues, online payment, and No Objection Certificate generation.",
                eligibility="Property owner or registered leaseholder within the municipal corporation limits.",
                required_documents="Sale Deed, Previous Tax Receipt, Building Sanction Plan",
                estimated_processing_days=5,
                digital_availability="Instant / 100% Online",
                fee=0,
                workflow_stages="Submission,Property ID Validation,Tax Calculation,Payment,NOC Issuance"
            ),
            ServiceCatalog(
                code="SRV-MUNI-WAT",
                name="New Piped Water Connection",
                department_id=muni.id,
                category="Public Utilities",
                description="Application for domestic or commercial metered piped potable water supply connection.",
                eligibility="Owners of constructed residential or commercial properties within piped network grid.",
                required_documents="Ownership Proof, Plumbing Layout, Identity Proof",
                estimated_processing_days=14,
                digital_availability="Digital Application + Site Inspection",
                fee=250,
                workflow_stages="Submission,Feasibility Survey,Engineering Approval,Connection Installation,Active Supply"
            ),
            ServiceCatalog(
                code="SRV-SOC-PEN",
                name="Social Welfare Pension Benefit",
                department_id=soc.id,
                category="Social Welfare",
                description="Direct benefit transfer (DBT) monthly pension for senior citizens, persons with disabilities, and destitute individuals.",
                eligibility="Citizens aged 60+ or verified disability >40% with family income below threshold.",
                required_documents="Age Proof, Disability Certificate (UDID), Bank Passbook, BPL Card",
                estimated_processing_days=15,
                digital_availability="100% Online",
                fee=0,
                workflow_stages="Submission,Cross-Department Social Audit,Biometric Auth,District Officer Sanction,DBT Enrollment"
            ),
            ServiceCatalog(
                code="SRV-TRANS-DL",
                name="Driving License Renewal & Endorsement",
                department_id=trans.id,
                category="Transport",
                description="Faceless renewal of expired motor vehicle driving license with automated biometric deduplication.",
                eligibility="Valid Indian driving license holder approaching expiry or within grace window.",
                required_documents="Existing Driving License, Medical Fitness Form 1A, Recent Photo",
                estimated_processing_days=3,
                digital_availability="100% Faceless Online",
                fee=200,
                workflow_stages="Submission,Biometric Match,RTO Review,Smart Card Dispatch,Digital mParivahan Push"
            ),
            ServiceCatalog(
                code="SRV-TRANS-PER",
                name="Commercial Vehicle Transport Permit",
                department_id=trans.id,
                category="Transport",
                description="Inter-state and intra-state commercial carrier goods and stage carriage permit authorization.",
                eligibility="Registered owner of valid commercial vehicle with fitness certificate and insurance.",
                required_documents="Vehicle RC, Fitness Certificate, Commercial Insurance, Pollution Under Control",
                estimated_processing_days=5,
                digital_availability="100% Online",
                fee=500,
                workflow_stages="Submission,Fitness Sync,Enforcement Clearances,Permit Issuance"
            ),
            ServiceCatalog(
                code="SRV-EDU-SCH",
                name="Merit-cum-Means Higher Education Scholarship",
                department_id=edu.id,
                category="Education",
                description="Direct monetary scholarship for underprivileged students enrolled in recognized higher education courses.",
                eligibility="Scored >75% in qualifying board exam with parental annual income under ₹2.5 Lakhs.",
                required_documents="Income Certificate, Marksheet, Bonafide Student Certificate, Bank Details",
                estimated_processing_days=21,
                digital_availability="100% Online",
                fee=0,
                workflow_stages="Submission,Institutional Verification,Academic Audit,State Merit List,DBT Disbursement"
            ),
            ServiceCatalog(
                code="SRV-HEALTH-AYU",
                name="Health Protection Scheme Enrollment",
                department_id=health.id,
                category="Health",
                description="Cashless family health insurance card enrollment providing coverage up to ₹5 Lakhs per annum.",
                eligibility="Families identified in socio-economic demographic registry.",
                required_documents="Ration Card, Family ID, Aadhaar Reference",
                estimated_processing_days=7,
                digital_availability="100% Online",
                fee=0,
                workflow_stages="Submission,Beneficiary Match,E-KYC Verification,Health ID Linking,Digital Card Generated"
            )
        ]
        db.add_all(services)
        db.commit()

    # 5. Seed Applications (25 diverse realistic records)
    if db.query(Application).count() < 10:
        rev = db.query(Department).filter_by(code="REV").first()
        muni = db.query(Department).filter_by(code="MUNI").first()
        soc = db.query(Department).filter_by(code="SOC").first()
        trans = db.query(Department).filter_by(code="TRANS").first()
        edu = db.query(Department).filter_by(code="EDU").first()
        health = db.query(Department).filter_by(code="HEALTH").first()

        sample_apps_data = [
            # Priya Sharma (Demo Citizen) applications
            ("GOV-26129-8421", "Income Certificate", "Priya Sharma", "citizen@govconnect.demo", "+91 98765 43210", "Flat 402, Block B, Govt Colony, New Delhi", "CIT-DEMO-001", rev.id, "Revenue", "High", "In Review", "Department Processing", 68, False, "name,email,citizen_ref,address,income"),
            ("GOV-26129-8422", "Property Tax Assessment & NOC", "Priya Sharma", "citizen@govconnect.demo", "+91 98765 43210", "Flat 402, Block B, Govt Colony, New Delhi", "CIT-DEMO-001", muni.id, "Municipal", "Normal", "Under Verification", "Document Verification", 40, False, "name,email,citizen_ref,property_id"),
            ("GOV-26129-8423", "Merit-cum-Means Higher Education Scholarship", "Priya Sharma", "citizen@govconnect.demo", "+91 98765 43210", "Flat 402, Block B, Govt Colony, New Delhi", "CIT-DEMO-001", edu.id, "Education", "Normal", "Completed", "Service Delivered", 100, False, "name,email,citizen_ref,marksheet,bank_details"),
            ("GOV-26129-8424", "Driving License Renewal & Endorsement", "Priya Sharma", "citizen@govconnect.demo", "+91 98765 43210", "Flat 402, Block B, Govt Colony, New Delhi", "CIT-DEMO-001", trans.id, "Transport", "Normal", "Approved", "Approval", 85, False, "name,email,citizen_ref,existing_dl"),
            ("GOV-26129-8425", "Health Protection Scheme Enrollment", "Priya Sharma", "citizen@govconnect.demo", "+91 98765 43210", "Flat 402, Block B, Govt Colony, New Delhi", "CIT-DEMO-001", health.id, "Health", "High", "Action Required", "Document Verification", 35, True, "name,email,citizen_ref,family_id"),

            # Other Citizens for rich Officer and Admin queue
            ("GOV-26129-1102", "Residence & Domicile Certificate", "Rajesh V. Verma", "rajesh.verma@example.com", "+91 98234 56781", "12 Civil Lines, North District", "CIT-26129-0102", rev.id, "Revenue", "Normal", "Submitted", "Submission", 15, False, "name,email,citizen_ref,address"),
            ("GOV-26129-1103", "Social Welfare Pension Benefit", "Sunita Devi", "sunita.d@example.com", "+91 97112 34567", "Village Rampur, Post Kalan", "CIT-26129-0103", soc.id, "Social Welfare", "High", "Under Verification", "Identity Verification", 30, True, "name,email,citizen_ref,bpl_card"),
            ("GOV-26129-1104", "Commercial Vehicle Transport Permit", "Gurpreet Singh", "singh.trans@example.com", "+91 98110 99887", "Plot 88, Transport Nagar", "CIT-26129-0104", trans.id, "Transport", "High", "Forwarded", "Cross-Department Dispatch", 60, False, "name,email,citizen_ref,rc_number"),
            ("GOV-26129-1105", "New Piped Water Connection", "Ananya Deshmukh", "ananya.d@example.com", "+91 99887 76655", "B-14 Green Park Avenue", "CIT-26129-0105", muni.id, "Municipal", "Normal", "In Review", "Department Processing", 55, False, "name,email,citizen_ref,property_id"),
            ("GOV-26129-1106", "Income Certificate", "Mohammad Tariq", "m.tariq@example.com", "+91 98450 12345", "45 Old City Gate Road", "CIT-26129-0106", rev.id, "Revenue", "Normal", "Completed", "Service Delivered", 100, False, "name,email,citizen_ref,income"),
            ("GOV-26129-1107", "Driving License Renewal & Endorsement", "Kavita Nair", "kavita.n@example.com", "+91 99451 98765", "Flat 302, Palm Meadows", "CIT-26129-0107", trans.id, "Transport", "Low", "On Hold", "Document Verification", 40, False, "name,email,citizen_ref,dl_number"),
            ("GOV-26129-1108", "Merit-cum-Means Higher Education Scholarship", "Rohan Mukherjee", "rohan.m@example.com", "+91 98301 54321", "77 Lake Gardens, South Sector", "CIT-26129-0108", edu.id, "Education", "Normal", "Under Verification", "Document Verification", 30, False, "name,email,citizen_ref,income,marks"),
            ("GOV-26129-1109", "Health Protection Scheme Enrollment", "Fatima Begum", "fatima.b@example.com", "+91 98123 45678", "H.No 204, Ward 7, Old Bazaar", "CIT-26129-0109", health.id, "Health", "High", "In Review", "Department Processing", 70, True, "name,email,citizen_ref,ration_card"),
            ("GOV-26129-1110", "Property Tax Assessment & NOC", "Vikramaditya Sen", "v.sen@example.com", "+91 98310 99881", "Bungalow 5, Ring Road", "CIT-26129-0110", muni.id, "Municipal", "Normal", "Completed", "Service Delivered", 100, False, "name,email,citizen_ref,property_id"),
            ("GOV-26129-1111", "Income Certificate", "Deepak Joshi", "deepak.j@example.com", "+91 97190 22334", "C-88 Housing Board Colony", "CIT-26129-0111", rev.id, "Revenue", "High", "Rejected", "Document Verification", 25, False, "name,email,citizen_ref,salary_slip"),
            ("GOV-26129-1112", "Social Welfare Pension Benefit", "Lakshmi Bai", "lakshmi.bai@example.com", "+91 94250 88776", "Quarter 12, Railway Ward", "CIT-26129-0112", soc.id, "Social Welfare", "Normal", "Approved", "Approval", 90, False, "name,email,citizen_ref,age_proof"),
            ("GOV-26129-1113", "New Piped Water Connection", "Harish Chandra", "h.chandra@example.com", "+91 98260 44556", "Plot 104, Industrial Area", "CIT-26129-0113", muni.id, "Municipal", "Low", "Submitted", "Submission", 15, False, "name,email,citizen_ref,sanction_plan"),
            ("GOV-26129-1114", "Commercial Vehicle Transport Permit", "Balwinder Kaur", "balwinder.k@example.com", "+91 98150 77665", "NH-1 Bypass Logistics Hub", "CIT-26129-0114", trans.id, "Transport", "Normal", "In Review", "Cross-Department Dispatch", 50, True, "name,email,citizen_ref,fitness"),
            ("GOV-26129-1115", "Residence & Domicile Certificate", "Suresh Shenoy", "suresh.s@example.com", "+91 98801 33445", "Villa 9, Coastal enclave", "CIT-26129-0115", rev.id, "Revenue", "Normal", "Approved", "Approval", 85, False, "name,email,citizen_ref,utility_bill")
        ]

        created_apps = []
        for (
            tr_id, srv_name, app_name, app_email, app_phone, app_addr, cit_ref,
            dept_id, cat, prio, stat, stg, prog, sla_r, shared
        ) in sample_apps_data:
            existing = db.query(Application).filter_by(tracking_id=tr_id).first()
            if not existing:
                app_obj = Application(
                    tracking_id=tr_id,
                    service_name=srv_name,
                    applicant_name=app_name,
                    applicant_email=app_email,
                    applicant_phone=app_phone,
                    applicant_address=app_addr,
                    citizen_ref=cit_ref,
                    department_id=dept_id,
                    category=cat,
                    priority=prio,
                    status=stat,
                    stage=stg,
                    progress=prog,
                    consent=True,
                    shared_fields=shared,
                    sla_risk=sla_r,
                    sla_deadline_days=7,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 12), hours=random.randint(1, 20)),
                    updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
                )
                db.add(app_obj)
                created_apps.append(app_obj)

        db.commit()

        # Seed Documents, Events, and Consents for each app
        for app in created_apps:
            # 1. Timeline Events
            db.add(ApplicationEvent(
                application_id=app.id,
                actor="Citizen Portal",
                stage="Submission",
                status="Submitted",
                message=f"Application received via Interoperability Gateway and routed to {app.department.name}.",
                created_at=app.created_at
            ))

            if app.progress >= 30:
                db.add(ApplicationEvent(
                    application_id=app.id,
                    actor="Gateway Identity Engine",
                    stage="Identity Verification",
                    status="Verified",
                    message="Applicant e-KYC reference and biometric hash cross-verified against master registry.",
                    created_at=app.created_at + timedelta(hours=4)
                ))

            if app.progress >= 50:
                db.add(ApplicationEvent(
                    application_id=app.id,
                    actor="Verification Officer (Rajesh Kumar)",
                    stage="Document Verification",
                    status="Verified",
                    message="Uploaded identity proof, address proof, and income declarations verified.",
                    created_at=app.created_at + timedelta(days=1)
                ))

            if app.progress >= 70:
                db.add(ApplicationEvent(
                    application_id=app.id,
                    actor=f"{app.department.name} Connector",
                    stage="Department Processing",
                    status="In Review",
                    message=f"Dispatched transaction packet to {app.department.name} core system. Case assigned.",
                    created_at=app.created_at + timedelta(days=2)
                ))

            if app.status == "Completed":
                db.add(ApplicationEvent(
                    application_id=app.id,
                    actor="Competent Authority",
                    stage="Service Delivered",
                    status="Completed",
                    message="Final digital certificate signed and issued to Citizen Locker. Service successfully fulfilled.",
                    created_at=app.created_at + timedelta(days=3)
                ))

            if app.status == "Action Required":
                db.add(ApplicationEvent(
                    application_id=app.id,
                    actor="Verification Officer",
                    stage="Document Verification",
                    status="Action Required",
                    message="Family member declaration document was illegible. Citizen requested to re-upload clear scan.",
                    created_at=app.created_at + timedelta(days=1)
                ))

            # 2. Documents
            db.add(Document(
                application_id=app.id,
                citizen_ref=app.citizen_ref,
                category="Identity Proof",
                file_name=f"Identity_Verification_{app.tracking_id[-4:]}.pdf",
                file_type="application/pdf",
                file_size_kb=245,
                verification_status="Verified" if app.status != "Action Required" else "Pending Review",
                notes="Simulated citizen identity document",
                uploaded_at=app.created_at
            ))
            db.add(Document(
                application_id=app.id,
                citizen_ref=app.citizen_ref,
                category="Address Proof",
                file_name=f"Address_Proof_{app.tracking_id[-4:]}.pdf",
                file_type="application/pdf",
                file_size_kb=312,
                verification_status="Verified",
                notes="Simulated utility electricity bill",
                uploaded_at=app.created_at
            ))

            # 3. Purpose-limited Consent Record
            db.add(ConsentRecord(
                citizen_ref=app.citizen_ref,
                tracking_id=app.tracking_id,
                department_code=app.department.code,
                department_name=app.department.name,
                purpose=f"Fulfillment & verification for {app.service_name}",
                data_requested=app.shared_fields,
                status="ACTIVE",
                scope="DPDP Purpose-Limited Sharing",
                created_at=app.created_at,
                expires_at=app.created_at + timedelta(days=90)
            ))

            # 4. Notification
            db.add(Notification(
                application_id=app.id,
                citizen_ref=app.citizen_ref,
                title=f"Update: {app.service_name}",
                message=f"Application {app.tracking_id} is currently in stage '{app.stage}' with status '{app.status}'.",
                severity="success" if app.status == "Completed" else ("warning" if app.status == "Action Required" else "info"),
                category="Application",
                read=False if app.status in ("Submitted", "Action Required") else True,
                created_at=app.updated_at
            ))

        # 5. Rich Audit Trail Entries
        audit_samples = [
            ("Priya Sharma", "CITIZEN", "USER_LOGIN", "LOGIN", "auth_sso", "REV", "Single Sign-On initiated via Demo Identity Provider.", "SUCCESS"),
            ("Priya Sharma", "CITIZEN", "CONSENT_GRANTED", "CONSENT_GRANTED", "REV", "REV", "Citizen granted purpose-limited consent for Income Certificate verification.", "SUCCESS"),
            ("Priya Sharma", "CITIZEN", "APPLICATION_CREATED", "APPLICATION_CREATED", "GOV-26129-8421", "REV", "Created Income Certificate request. Data shared: name, email, address, income.", "SUCCESS"),
            ("Gateway Engine", "SYSTEM", "CONNECTOR_REQUEST", "CONNECTOR_REQUEST", "REST_ADAPTER", "REV", "Dispatched payload to Revenue Department REST connector endpoint. HTTP 200 in 115ms.", "SUCCESS"),
            ("Rajesh Kumar", "OFFICER", "DOCUMENT_VERIFIED", "STATUS_CHANGED", "GOV-26129-8421", "REV", "Officer verified income salary slip against employer records.", "SUCCESS"),
            ("Gateway WAF", "SYSTEM", "SECURITY_EVENT", "SECURITY_EVENT", "API_GATEWAY", "GATEWAY", "TLS token validation and rate limiting policy check passed (34 req/min).", "SUCCESS"),
            ("Sunita Rao", "DEPARTMENT_ADMIN", "CONNECTOR_STATUS_CHECK", "CONNECTOR_REQUEST", "MUNI", "MUNI", "Health probe across Municipal Services Corporation completed successfully.", "SUCCESS"),
            ("Priya Sharma", "CITIZEN", "APPLICATION_CREATED", "APPLICATION_CREATED", "GOV-26129-8422", "MUNI", "Submitted Property Tax Assessment request. Interoperability tracking token issued.", "SUCCESS"),
            ("Gateway Engine", "SYSTEM", "APPLICATION_FORWARDED", "APPLICATION_FORWARDED", "GOV-26129-1104", "TRANS", "Cross-department dispatch: Transport Authority requested Municipal tax clearance.", "SUCCESS"),
            ("Rajesh Kumar", "OFFICER", "APPLICATION_APPROVED", "APPLICATION_APPROVED", "GOV-26129-8424", "TRANS", "Driving license renewal authorized and forwarded to card printing queue.", "SUCCESS"),
            ("Dr. V. Narayanan", "SYSTEM_ADMIN", "SECURITY_AUDIT_INSPECT", "SECURITY_EVENT", "AUDIT_STORE", "GATEWAY", "Platform-wide cryptographic integrity verification across 15,200 audit entries: OK.", "SUCCESS")
        ]

        for act, rol, actn, cat, res, dept, det, reslt in audit_samples:
            db.add(AuditLog(
                actor=act,
                role=rol,
                action=actn,
                category=cat,
                resource=res,
                department_code=dept,
                detail=det,
                result=reslt,
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 36))
            ))

        db.commit()

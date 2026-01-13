const { pool } = require('./db');
require('dotenv').config();

const projects = [
    {
        id: '1',
        name: 'Plant A Expansion',
        location: 'Sector 4',
        status: 'In Progress',
        progress: 65,
        budget: 500000,
        spent: 320000,
        committed: 80000,
        assignee_id: '50223344',
        due_date: '2025-06-15',
        priority: 'High',
        risk_level: 'Medium',
        capex_category: 'Engineering',
        target_roi: 12.5,
        lifecycle: JSON.stringify([
            { id: 'l1', name: 'Design', status: 'Completed', progress: 100, startDate: '2025-01-01', endDate: '2025-01-30' },
            { id: 'l2', name: 'Procurement', status: 'In Progress', progress: 80, startDate: '2025-02-01', endDate: '2025-03-15' },
            { id: 'l3', name: 'Construction', status: 'In Progress', progress: 40, startDate: '2025-03-16', endDate: '2025-05-30' },
            { id: 'l4', name: 'Commissioning', status: 'Not Started', progress: 0, startDate: '2025-06-01', endDate: '2025-06-15' }
        ]),
        documents: JSON.stringify([]),
        planned_progress: JSON.stringify([{ date: 'Jan', value: 10 }, { date: 'Feb', value: 25 }, { date: 'Mar', value: 45 }]),
        actual_progress: JSON.stringify([{ date: 'Jan', value: 12 }, { date: 'Feb', value: 22 }]),
        capex_items: JSON.stringify([
            { id: 'CX-101', name: 'Main Intake Pump', category: 'Equipment', proposedCost: 150000, actualCost: 145000, status: 'Paid' }
        ])
    },
    {
        id: '3',
        name: 'Conveyor Automation Line 4',
        location: 'Plant B',
        status: 'Delayed',
        progress: 40,
        budget: 85000,
        spent: 92000,
        committed: 10000,
        assignee_id: '50006020',
        due_date: '2025-04-01',
        priority: 'Medium',
        risk_level: 'High',
        capex_category: 'Automation',
        target_roi: 8.4
    }
];

const plants = [
    { id: 'p1', name: '1402-IFM Tangerang', code: '1402', location: 'Tangerang' },
    { id: 'p2', name: '1403-IFM Semarang', code: '1403', location: 'Semarang' },
    { id: 'p3', name: '1405-IFM Cikupa', code: '1405', location: 'Cikupa' },
    { id: 'p4', name: '1411-IFM Agro', code: '1411', location: 'Agro' },
    { id: 'p5', name: '14xx', code: '14xx', location: 'Various' }
];

const users = [
    {
        id: '50006020',
        name: 'Moh Yusuf Alfian',
        role: 'Manager',
        job_title: 'Project & Engineering Manager',
        department: 'Project Engineering',
        avatar: 'MY',
        birth_place: 'Sidoarjo',
        birth_date: '1988-05-12',
        gender: 'Male',
        marital_status: 'Married',
        address: 'Jl. Raya Engineering No. 45, Surabaya, Jawa Timur',
        phone_number: '+62 812 3456 7890',
        personal_email: 'yusuf.alfian@example.com',
        company_email: 'yusuf.alfian@peak-corp.com',
        join_date: '2015-02-01',
        employment_status: 'Permanent',
        job_history: JSON.stringify([
            { title: 'Project Engineer', period: '2015 - 2018', description: 'Handled plant expansion projects.' },
            { title: 'Lead Engineer', period: '2018 - 2021', description: 'Led mechanical design team.' }
        ]),
        education_history: JSON.stringify([
            { school: 'Sepuluh Nopember Institute of Technology', degree: 'Bachelor of Mechanical Engineering', year: '2010' }
        ]),
        emergency_contact: JSON.stringify({ name: 'Siti Aminah', relationship: 'Spouse', phone: '+62 812 9876 5432' }),
        languages: ['Indonesian', 'English', 'Javanese'],
        allowed_modules: ['dashboard', 'projects', 'performance', 'resources', 'admin', 'requests', 'ai_copilot', 'finance'],
        skills: JSON.stringify([{ name: 'AutoCAD', level: 5 }, { name: 'Project Mgmt', level: 5 }]),
        workload_score: 45,
        job_grade: 'M1',
        job_role: 'Operations Lead',
        motto: 'Leading with excellence and integrity.'
    },
    {
        id: '50155250',
        name: 'Ayodya Maulana Gunoro',
        role: 'Supervisor',
        job_title: 'Supervisor (Process & Mechanical)',
        department: 'Mechanical Maintenance',
        avatar: 'AM',
        birth_place: 'Malang',
        birth_date: '1992-08-20',
        gender: 'Male',
        marital_status: 'Single',
        address: 'Perumahan Indah Mulia Block C-12, Pasuruan',
        phone_number: '+62 856 7890 1234',
        personal_email: 'ayodya.maulana@example.com',
        company_email: 'ayodya.maulana@peak-corp.com',
        join_date: '2019-06-15',
        employment_status: 'Permanent',
        job_history: JSON.stringify([
            { title: 'Maintenance Technician', period: '2019 - 2022', description: 'Daily mechanical maintenance.' }
        ]),
        education_history: JSON.stringify([
            { school: 'Brawijaya University', degree: 'Bachelor of Mechanical Engineering', year: '2014' }
        ]),
        emergency_contact: JSON.stringify({ name: 'Gunawan', relationship: 'Father', phone: '+62 813 4455 6677' }),
        languages: ['Indonesian', 'English'],
        allowed_modules: ['dashboard', 'projects', 'performance', 'resources', 'admin', 'requests', 'ai_copilot', 'finance'],
        skills: JSON.stringify([{ name: 'Mechanical Design', level: 5 }]),
        workload_score: 85,
        job_grade: 'S2',
        job_role: 'Maintenance Specialist',
        motto: 'Reliability through precision.'
    }
];

const seed = async () => {
    try {
        console.log('Seeding database...');

        // Clear existing data (optional, but good for fresh seed)
        await pool.query('DELETE FROM projects');
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM plants');

        // Insert Plants
        for (const plant of plants) {
            await pool.query(
                'INSERT INTO plants (id, name, code, location) VALUES ($1, $2, $3, $4)',
                [plant.id, plant.name, plant.code, plant.location]
            );
        }
        console.log('Plants seeded.');

        // Insert Users
        for (const user of users) {
            await pool.query(
                `INSERT INTO users (
                    id, name, role, job_title, department, avatar, 
                    birth_place, birth_date, gender, marital_status, address, 
                    phone_number, personal_email, company_email, join_date, 
                    employment_status, job_history, education_history, 
                    emergency_contact, languages, allowed_modules, skills, workload_score,
                    job_grade, job_role, motto
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
                [
                    user.id, user.name, user.role, user.job_title, user.department, user.avatar,
                    user.birth_place, user.birth_date, user.gender, user.marital_status, user.address,
                    user.phone_number, user.personal_email, user.company_email, user.join_date,
                    user.employment_status, user.job_history, user.education_history,
                    user.emergency_contact, user.languages, user.allowed_modules, user.skills, user.workload_score,
                    user.job_grade, user.job_role, user.motto
                ]
            );
        }
        console.log('Users seeded.');

        // Insert Projects
        for (const proj of projects) {
            await pool.query(
                `INSERT INTO projects (
          id, name, location, status, progress, budget, spent, committed,
          assignee_id, due_date, priority, risk_level, capex_category, target_roi,
          lifecycle, documents, planned_progress, actual_progress, capex_items
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
                [
                    proj.id, proj.name, proj.location, proj.status, proj.progress, proj.budget, proj.spent, proj.committed,
                    proj.assignee_id, proj.due_date, proj.priority, proj.risk_level, proj.capex_category, proj.target_roi,
                    proj.lifecycle || '[]', proj.documents || '[]', proj.planned_progress || '[]', proj.actual_progress || '[]', proj.capex_items || '[]'
                ]
            );
        }
        console.log('Projects seeded.');

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seed();

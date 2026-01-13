
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', db_time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Projects API
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        // Convert snake_case from DB to camelCase for frontend
        const projects = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            location: row.location,
            status: row.status,
            progress: row.progress,
            budget: parseFloat(row.budget),
            spent: parseFloat(row.spent),
            committed: parseFloat(row.committed),
            assignee: row.assignee_id,
            dueDate: row.due_date,
            priority: row.priority,
            riskLevel: row.risk_level,
            capexCategory: row.capex_category,
            targetROI: parseFloat(row.target_roi),
            lifecycle: row.lifecycle,
            documents: row.documents,
            plannedProgress: row.planned_progress,
            actualProgress: row.actual_progress,
            capexItems: row.capex_items
        }));
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects', async (req, res) => {
    const {
        id, name, location, status, progress, budget, spent, committed,
        assignee, dueDate, priority, riskLevel, capexCategory, targetROI,
        lifecycle, documents, plannedProgress, actualProgress, capexItems
    } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO projects (
                id, name, location, status, progress, budget, spent, committed,
                assignee_id, due_date, priority, risk_level, capex_category, target_roi,
                lifecycle, documents, planned_progress, actual_progress, capex_items
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) 
            RETURNING *`,
            [
                id || `PRJ-${Date.now()}`, name, location, status || 'Planning',
                progress || 0, budget || 0, spent || 0, committed || 0,
                assignee || null, dueDate, priority, riskLevel, capexCategory, targetROI,
                JSON.stringify(lifecycle || []), JSON.stringify(documents || []),
                JSON.stringify(plannedProgress || []), JSON.stringify(actualProgress || []),
                JSON.stringify(capexItems || [])
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: err.message });
    }
});

// Users API
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY name ASC');
        const users = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            role: row.role,
            jobTitle: row.job_title,
            avatar: row.avatar,
            allowedModules: row.allowed_modules,
            skills: row.skills,
            assignments: row.assignments,
            workloadScore: row.workload_score,
            jobGrade: row.job_grade,
            jobRole: row.job_role,
            motto: row.motto
        }));
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submissions API
app.get('/api/submissions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM submissions ORDER BY created_at DESC');
        const submissions = result.rows.map(row => ({
            id: row.id,
            type: row.type,
            title: row.title,
            status: row.status,
            details: row.details,
            flowId: row.flow_id,
            currentStepIndex: row.current_step_index,
            userId: row.user_id,
            date: row.created_at
        }));
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/submissions', async (req, res) => {
    const { id, type, title, status, details, flowId, currentStepIndex, userId } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO submissions (id, type, title, status, details, flow_id, current_step_index, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id || `SUB-${Date.now()}`, type, title, status || 'Pending', JSON.stringify(details || {}), flowId, currentStepIndex || 0, userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Job Assignments API
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM job_assignments ORDER BY created_at DESC');
        const jobs = result.rows.map(row => ({
            id: row.id,
            projectName: row.project_name,
            projectId: row.project_id,
            location: row.location,
            description: row.description,
            category: row.category,
            duration: row.duration,
            priority: row.priority,
            requiredDocuments: row.required_documents,
            materialList: row.material_list,
            assignee: row.assignee_id,
            status: row.status,
            flowId: row.flow_id,
            currentStepIndex: row.current_step_index,
            approvalHistory: row.approval_history,
            date: row.created_at,
            dueDate: row.due_date
        }));
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Plants API
app.get('/api/plants', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM plants ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/jobs', async (req, res) => {
    const {
        id, projectName, projectId, location, description, category,
        duration, priority, requiredDocuments, materialList,
        assignee, status, flowId, currentStepIndex, approvalHistory, dueDate
    } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO job_assignments (
                id, project_name, project_id, location, description, category, 
                duration, priority, required_documents, material_list, 
                assignee_id, status, flow_id, current_step_index, approval_history, due_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
            RETURNING *`,
            [
                id || `JOB-${Date.now()}`, projectName, projectId, location, description, category,
                duration, priority, requiredDocuments, materialList,
                assignee, status || 'Draft', flowId, currentStepIndex || 0,
                JSON.stringify(approvalHistory || []), dueDate
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update Project
app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ error: 'No fields provided' });
    const setClause = keys.map((key, i) => {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbKey} = $${i + 2}`;
    }).join(', ');
    const values = keys.map(key => typeof fields[key] === 'object' ? JSON.stringify(fields[key]) : fields[key]);
    try {
        const result = await pool.query(`UPDATE projects SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...values]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update User
app.patch('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ error: 'No fields provided' });
    const setClause = keys.map((key, i) => {
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbKey} = $${i + 2}`;
    }).join(', ');
    const values = keys.map(key => typeof fields[key] === 'object' ? JSON.stringify(fields[key]) : fields[key]);
    try {
        const result = await pool.query(`UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...values]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

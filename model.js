const express = require('express');
const router = express.Router();
const Student = require('../../db/schemas/studentSchemas'); 
const Department = require('../../db/schemas/departmentSchemas'); 
router.get('/', async (req, res) => {
    try {
        const students = await Student.find().populate('department');
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Internal server error',
         });
    }
});
router.get('/search', async (req, res) => {
    try {
        const queryParams = req.query;
        const filters = {};
        if (queryParams.name) {
            filters.name = { $regex: queryParams.name, $options: 'i' };
        }
        if (queryParams.registrationNumber) {
            filters.registrationNumber = queryParams.registrationNumber;
        }
        const students = await Student.find(filters).populate('department');
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Internal server error',
         });
    }
});
router.post('/', async (req, res) => {
    try {
        const { registrationNumber, name, age, grade, department } = req.body;
        const dept = await Department.findById(department);
        if (!dept) return res.status(400).json({ 
            message: 'Department not found' ,
        });
        const newStudent = new Student({ registrationNumber, name, age, grade, department });
        await newStudent.save();
        res.status(201).json({
             message: 'Student added successfully' ,
            });
    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'Registration Number must be unique' });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const updateData = req.body;
        const student = await Student.findByIdAndUpdate(studentId, updateData, { new: true });
        if (!student) 
        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findByIdAndDelete(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/departments/search', async (req, res) => {
    try {
        const queryParams = req.query;
        const filters = {};

        if (queryParams.name) {
            filters.name = { $regex: queryParams.name, $options: 'i' };
        }

        const departments = await Department.find(filters);
        res.status(200).json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/departments/:id/students', async (req, res) => {
    try {
        const departmentId = req.params.id;
        const students = await Student.find({ department: departmentId }).populate('department');
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.delete('/departments/:id', async (req, res) => {
    try {
        const departmentId = req.params.id;
        const students = await Student.find({ department: departmentId });
        if (students.length > 0) return res.status(400).json({ 
            message: 'Department has students. Remove students first.',
         });
        const department = await Department.findByIdAndDelete(departmentId);
        if (!department) return res.status(404).json({ 
            message: 'Department not found' ,
        });
        res.status(200).json({ 
            message: 'Department deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Internal server error'
         });
    }
});

module.exports = router;
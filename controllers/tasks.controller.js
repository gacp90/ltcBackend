const { response } = require('express');

const Task = require('../models/tasks.model');

/** ======================================================================
 *  GET TASKS
=========================================================================*/
const getTasks = async(req, res) => {

    try {

        const { desde, hasta, ...query } = req.body;

        const [tasks, total] = await Promise.all([
            Task.find(query)
            .populate('staff', 'name role img')
            .populate('create', 'name role img')
            .limit(hasta)
            .skip(desde)
            .sort({fecha: -1}),
            Task.countDocuments({ end: query.end })
        ]);

        res.json({
            ok: true,
            tasks,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });

    }


};
/** =====================================================================
 *  GET TASKS
=========================================================================*/

/** =====================================================================
 *  GET TASK ID
=========================================================================*/
const getTaskId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const taskDB = await Task.findById(id)
            .populate('User');
        if (!taskDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No hemos encontrado esta tarea, porfavor intente nuevamente.'
            });
        }

        res.json({
            ok: true,
            task: taskDB
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};
/** =====================================================================
 *  GET TASK ID
=========================================================================*/

/** =====================================================================
 *  CREATE TASK
=========================================================================*/
const createTask = async(req, res = response) => {


    try {

        const uid = req.uid;

        // SAVE TASK
        const task = new Task(req.body);
        task.create = uid;

        await task.save();

        res.json({
            ok: true,
            task
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }
};
/** =====================================================================
 *  CREATE TASK
=========================================================================*/

/** =====================================================================
 *  UPDATE TASK
=========================================================================*/
const updateTask = async(req, res = response) => {

    const taskid = req.params.id;

    try {

        // SEARCH USER
        const taskDB = await Task.findById(taskid);
        if (!taskDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ninguna tarea con este ID'
            });
        }
        // SEARCH USER

        // VALIDATE USER
        let {...campos } = req.body;

        // UPDATE
        const taskUpdate = await Task.findByIdAndUpdate(taskid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            task: taskUpdate
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }

};
/** =====================================================================
 *  UPDATE TASK
=========================================================================*/
/** =====================================================================
 *  DELETE TASK
=========================================================================*/
const deleteTask = async(req, res = response) => {


    try {
        const taskid = req.params.id;

        // SEARCH PRODUCT
        const taskDB = await Task.findById({ _id: taskid });
        if (!taskDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ninguna tarea con este ID'
            });
        }
        // SEARCH PRODUCT

        await Task.findByIdAndDelete(taskid);

        res.json({
            ok: true,
            msg: 'La tarea fue eliminada con exito'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};
/** =====================================================================
 *  DELETE TASK
=========================================================================*/


// EXPORTS
module.exports = {
    getTasks,
    createTask,
    updateTask,
    getTaskId,
    deleteTask,
};
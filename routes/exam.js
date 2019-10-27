var express = require("express");
var router = express.Router();
const ClassModel = require("../schema/ClassModel");
const SubjectModel = require("../schema/SubjectModel");
const ContentModel = require("../schema/ContentModel");
const ExamModel = require("../schema/ExamModel");
const { success, error, fail } = require("../common")


router.get("/classes", (req, res) => {
    ClassModel.find((err, classes) => {
        if (err) return error(res, err)
        return success(res, classes)
    })
})

router.post("/classes", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Only admin can create classes")
    ClassModel.find({ name: req.body.name }, (err, classes) => {
        if (err) return error(res, err)
        if (classes.length > 0)
            return fail(res, "Class existes")
        ClassModel.create({ name: req.body.name }, (err, c) => {
            if (err) return error(res, err)
            return success(res, c)
        })
    })

})

router.put("/classes/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Only admin can edit classes")
    ClassModel.updateOne({ _id: req.params.id }, { name: req.body.name }, (err, r) => {
        if (err) return error(res, err)
        return success(res, "Edit the class successfully")
    })
})

router.delete("/classes/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Only admin can delete classes")
    ClassModel.deleteOne({_id: req.params.id}, err => {
        if (err) return error(res, err)
        return success(res, "Delete the class successfully")
    })
})


router.get("/subjects", (req, res) => {
    SubjectModel.find((err, subjects) => {
        if (err) return error(res, err)
        return success(res, subjects)
    })
})

router.post("/subjects", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Only admin can create subjects")
    SubjectModel.find({ name: req.body.name }, (err, subjects) => {
        if (err) return error(res, err)
        if (subjects.length > 0)
            return fail(res, "Subject existes")
        SubjectModel.create({ name: req.body.name }, (err, c) => {
            if (err) return error(res, err)
            return success(res, c)
        })
    })

})

router.put("/subjects/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Only admin can edit subjects")
    SubjectModel.updateOne({ _id: req.params.id }, { name: req.body.name }, (err, r) => {
        if (err) return error(res, err)
        return success(res, "Edit the subject successfully")
    })
})

router.delete("/subjects/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Only admin can delete subjects")
    SubjectModel.deleteOne({_id: req.params.id}, err => {
        if (err) return error(res, err)
        return success(res, "Delete the subject successfully")
    })
})

module.exports = router;
var express = require("express");
var router = express.Router();
const ClassModel = require("../schema/ClassModel");
const SubjectModel = require("../schema/SubjectModel");
const ContentModel = require("../schema/ContentModel");
const ExamModel = require("../schema/ExamModel");
const { success, error, fail } = require("../common")
const bcrypt = require("bcrypt");
const saltRounds = 10;


router.get("/classes", (req, res) => {
    ClassModel.find((err, classes) => {
        if (err) return error(res, err)
        return success(res, classes)
    })
})

router.post("/classes", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể tạo lớp học")
    ClassModel.find({ name: req.body.name }, (err, classes) => {
        if (err) return error(res, err)
        if (classes.length > 0)
            return fail(res, "Lớp học đã tồn tại")
        ClassModel.create({ name: req.body.name }, (err, c) => {
            if (err) return error(res, err)
            return success(res, c)
        })
    })

})

router.put("/classes/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể chỉnh sửa lớp học")
    ClassModel.updateOne({ _id: req.params.id }, { name: req.body.name }, (err, r) => {
        if (err) return error(res, err)
        return success(res, null, "Chỉnh sửa lớp học thành công")
    })
})

router.delete("/classes/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể xóa lớp học")
    ClassModel.deleteOne({ _id: req.params.id }, err => {
        if (err) return error(res, err)
        return success(res, null, "Xóa lớp học thành công")
    })
})




router.get("/subjects/:id", (req, res) => {
    SubjectModel.find({ classId: req.params.id })
        // .populate("classId")
        .exec((err, subjects) => {
            if (err) return error(res, err)
            return success(res, subjects)
        })
})

router.post("/subjects", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể tạo môn học")
    ClassModel.find({ _id: req.body.classId }, (err, classes) => {
        if (err) return error(res, err)
        if (classes.length < 1)
            return fail(res, "Lớp học không tồn tại")
        SubjectModel.find({ name: req.body.name, classId: req.body.classId }, (err, subjects) => {
            if (err) return error(res, err)
            if (subjects.length > 0)
                return fail(res, "Môn học đã tồn tại")
            SubjectModel.create({ name: req.body.name, classId: req.body.classId }, (err, c) => {
                if (err) return error(res, err)
                return success(res, c)
            })
        })
    })
})

router.put("/subjects/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể chỉnh sửa môn học")
    SubjectModel.updateOne({ _id: req.params.id }, { name: req.body.name }, (err, r) => {
        if (err) return error(res, err)
        return success(res, null, "Chỉnh sửa môn học thành công")
    })
})

router.delete("/subjects/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể xóa môn học")
    SubjectModel.deleteOne({ _id: req.params.id }, err => {
        if (err) return error(res, err)
        return success(res, null, "Xóa môn học thành công")
    })
})




router.get("/contents/:id", (req, res) => {
    ContentModel.find({ subjectId: req.params.id })
        // .populate("subjectId")
        .exec((err, contents) => {
            if (err) return error(res, err)
            return success(res, contents)
        })
})

router.post("/contents", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể tạo chủ đề")
    SubjectModel.find({ _id: req.body.subjectId }, (err, subjects) => {
        if (err) return error(res, err)
        if (subjects.length < 1)
            return fail(res, "Môn học không tồn tại")
        ContentModel.find({ name: req.body.name, subjectId: req.body.subjectId }, (err, contents) => {
            if (err) return error(res, err)
            if (contents.length > 0)
                return fail(res, "Chủ đề đã tồn tại")
            ContentModel.create({ name: req.body.name, subjectId: req.body.subjectId }, (err, c) => {
                if (err) return error(res, err)
                return success(res, c)
            })
        })
    })
})

router.put("/contents/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể chỉnh sửa chủ đề")
    ContentModel.updateOne({ _id: req.params.id }, { name: req.body.name }, (err, r) => {
        if (err) return error(res, err)
        return success(res, null, "Chỉnh sửa chủ đề thành công")
    })
})

router.delete("/contents/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể xóa chủ đề")
    ContentModel.deleteOne({ _id: req.params.id }, err => {
        if (err) return error(res, err)
        return success(res, null, "Xóa chủ đề thành công")
    })
})





router.get("/exams/:id", (req, res) => {
    ExamModel.find({ contentId: req.params.id })
        // .populate("contentId")
        .select("name time total note datetime password")
        .exec((err, exams) => {
            if (err) return error(res, err)
            exams.forEach(element => {
                if (element.password)
                    element.password = true
                else
                    element.password = false
            });
            return success(res, exams)
        })
})

router.post("/exams", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể tạo bài kiểm tra")
    ContentModel.find({ _id: req.body.contentId }, (err, contents) => {
        if (err) return error(res, err)
        if (contents.length < 1)
            return fail(res, "Chủ đề không tồn tài")
        ExamModel.find({ name: req.body.name, contentId: req.body.contentId }, (err, exams) => {
            if (err) return error(res, err)
            if (exams.length > 0)
                return fail(res, "Bài kiểm tra đã tồn tại")
            if (req.body.password) {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (err) return error(res, err)
                    req.body.password = hash
                    ExamModel.create(req.body, (err, exam) => {
                        if (err) return error(res, err)
                        return success(res, exam)
                    })
                })
            } else
                ExamModel.create(req.body, (err, c) => {
                    if (err) return error(res, err)
                    return success(res, c)
                })
        })
    })
})

router.put("/exams/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể chỉnh sửa bài kiểm tra")
    ExamModel.updateOne({ _id: req.params.id }, req.body, (err, r) => {
        if (err) return error(res, err)
        return success(res, null, "Chỉnh sửa bài kiểm tra thành công")
    })
})

router.delete("/exams/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể xóa bài kiểm tra")
    ExamModel.deleteOne({ _id: req.params.id }, err => {
        if (err) return error(res, err)
        return success(res, null, "Xóa bài kiểm tra thành công")
    })
})



router.post("/answers", (req, res) => {
    if (req.authz.role == "anony")
        return fail(res, "Vui lòng đăng nhập trước khi làm bài kiểm tra")
    ExamModel.create({})
})

module.exports = router;

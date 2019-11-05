var express = require("express");
var router = express.Router();
const ContentModel = require("../schema/ContentModel");
const LectureModel = require("../schema/LectureModel");
const { success, error, fail } = require("../common");

router.get("/lectures", (req, res) => {
    if (req.authz.role != 'admin')
        return fail(res, "Chỉ admin có thể liệt kê tất cả các bài giảng")
    if (!req.query.limit)
        req.query.limit = 10
    if (!req.query.page)
        req.query.page = 1
    LectureModel.find()
        .populate({
            path: 'contentId',
            select: 'name subjectId',
            populate: {
                path: 'subjectId',
                select: 'classId name',
                populate: {
                    path: 'classId',
                    select: 'name'
                }
            }
        })
        .sort('-datetime')
        .skip((req.query.page - 1) * req.query.limit)
        .limit(parseInt(req.query.limit))
        .exec((err, lectures) => {
            if (err) return error(res, err)
            LectureModel.countDocuments({}, (err, totalPage) => {
                if (err) return error(res, err)
                totalPage = Math.ceil(totalPage / req.query.limit)
                previous = req.query.page > 1 ? req.protocol + "://" + req.get("host") + "/api/lectures?page=" + (Number(req.query.page) - 1) + "&limit=" + req.query.limit : null
                next = req.query.page < totalPage ? req.protocol + "://" + req.get("host") + "/api/lectures?page=" + (Number(req.query.page) + 1) + "&limit=" + req.query.limit : null
                data = { totalPage: totalPage, page: req.query.page, data: lectures, previous: previous, next: next }
                return success(res, data)
            })
        })
})


router.get("/lectures/:id", (req, res) => {
    LectureModel.findById(req.params.id, (err, lectures) => {
        if (err) return error(res, err)
        return success(res, lectures)
    })
})

router.get("/lectures/contents/:id", (req, res) => {
    LectureModel.find({ contentId: req.params.id })
        .exec((err, lectures) => {
            if (err) return error(res, err)
            return success(res, lectures)
        })
})

router.post("/lectures", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể tạo bài giảng")
    ContentModel.find({ _id: req.body.contentId }, (err, contents) => {
        if (err) return error(res, err)
        if (contents.length < 1)
            return fail(res, "Chủ đề không tồn tài")
        LectureModel.find({ name: req.body.name, contentId: req.body.contentId }, (err, lectures) => {
            if (err) return error(res, err)
            if (lectures.length > 0)
                return fail(res, "bài giảng đã tồn tại")
            LectureModel.create(req.body, (err, lecture) => {
                if (err) return error(res, err)
                return success(res, lecture)
            })
        })
    })
})

router.put("/lectures/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể chỉnh sửa bài giảng")
    LectureModel.updateOne({ _id: req.params.id }, req.body, (err, r) => {
        if (err) return error(res, err)
        return success(res, null, "Chỉnh sửa bài giảng thành công")
    })
})

router.delete("/lectures/:id", (req, res) => {
    if (req.authz.role != "admin")
        return fail(res, "Chỉ admin có thể xóa bài giảng")
    LectureModel.deleteOne({ _id: req.params.id }, err => {
        if (err) return error(res, err)
        return success(res, null, "Xóa bài giảng thành công")
    })
})


module.exports = router;
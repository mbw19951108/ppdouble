const express = require("express");
const router = express.Router();
const ArticleModel = require("../model/articleModel");
const mongoose = require("../model/core");

router
  .route("/articles")
  .get(async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageable = req.query.pageable;
    const showAll = req.query.showAll;
    let params = {};
    if(req.query.categoryId) {
      params.category_id = mongoose.Types.ObjectId(req.query.categoryId);
    }
    if (!showAll) {
      params.is_show = true;
    }
    let result;
    if (pageable === "0") {
      result = await ArticleModel.find(params, { content: 0, mdcontent: 0 }).sort(
        { created_time: -1 }
      );
    } else {
      result = await ArticleModel.find(params, { content: 0, mdcontent: 0 })
        .skip((pageNo - 1) * pageSize)
        .limit(pageSize)
        .sort({ created_time: -1 });
    }
    const total = await (
      await ArticleModel.find(params, { content: 0, mdcontent: 0 })
    ).length;
    res.json({
      data: result,
      meta: {
        pageNo,
        pageSize,
        total,
      },
    });
  });
router
  .route("/article")
  .post(async (req, res) => {
    const { title, category_id } = { ...req.body };
    if (!category_id) {
      res.status(500).json({
        message: "请选择文章分类",
      });
    }
    if (!title) {
      res.status(500).json({
        message: "请填写文章标题",
      });
    }
    const newArticle = new ArticleModel({
      category_id: mongoose.Types.ObjectId(category_id),
      title,
      created_time: new Date(),
    });
    const result = await newArticle.save();
    result &&
      res.json({
        success: true,
      });
  });

router
  .route("/article/:articleId")
  .get(async (req, res) => {
    const _id = mongoose.Types.ObjectId(req.params.articleId);
    const { click_count } = await ArticleModel.findOne({ _id });
    const result = await ArticleModel.findOneAndUpdate(
      { _id },
      {
        click_count: click_count + 1,
      }
    );
    res.json({
      data: result,
    });
  })
  .put(async (req, res) => {
    const _id = mongoose.Types.ObjectId(req.params.articleId);
    const { title, keywords, content, mdcontent, is_show } = {
      ...req.body,
    };

    const result = await ArticleModel.findOneAndUpdate(
      { _id },
      {
        title,
        keywords,
        content,
        mdcontent,
        is_show,
        updated_time: new Date(),
      }
    );

    result &&
      res.json({
        success: true,
      });
  })
  .delete(async (req, res) => {
    const _id = mongoose.Types.ObjectId(req.params.articleId);
    const result = await ArticleModel.deleteOne({ _id });
    result &&
      res.json({
        success: true,
      });
  });

router.route("/article/:articleId/publish").put(async (req, res) => {
  const _id = mongoose.Types.ObjectId(req.params.articleId);
  const result = await ArticleModel.findOneAndUpdate(
    { _id },
    {
      is_show: true,
    }
  );

  result &&
    res.json({
      success: true,
    });
});

router.route("/article/:articleId/unpublish").put(async (req, res) => {
  const _id = mongoose.Types.ObjectId(req.params.articleId);
  const result = await ArticleModel.findOneAndUpdate(
    { _id },
    {
      is_show: false,
    }
  );

  result &&
    res.json({
      success: true,
    });
});
module.exports = router;

<template>
  <el-row>
    <el-col :span="24">
      <el-form class="article-edit-form" ref="dataForm" :rules="rules" :model="editDataModel" label-position="right" label-width="0" :show-message="false" :status-icon="false">
        <div class="flex-row-ver-center title-row">
          <div class="flex-auto-item">
            <!-- 标题 -->
            <el-form-item class="mb-8" prop="postTitle">
              <el-input v-model="editDataModel.postTitle" maxlength="100" placeholder="请输入标题..." />
            </el-form-item>
          </div>
          <div class="btn-area flex-fixed-item">
            <el-button v-if="editMode === 'm'" type="danger" @click="handleDelete">
              删除
            </el-button>
            <el-button v-if="editDataModel.postStatus === 'DRAFT'" @click="saveData('DRAFT')">
              保存草稿
            </el-button>
            <el-button type="primary" @click="pubButtonClick">
              发布
            </el-button>
          </div>
        </div>
        <!-- 正文 :html="false"   -->
        <el-form-item prop="postContent">
          <mavon-editor v-model="editDataModel.postContent" ref="md" :style="'height:'+ mdEditorHeight + ';box-shadow:none;border:1px solid #efefef;'" @change="handleEditorChange" @imgAdd="handleEditorImgAdd" :toolbars="toolbars" >
            <template v-slot:left-toolbar-before>
              <div class="styleof-inlineblock">
                <el-upload class="upload-demo" :action="importMdUrl" :headers="{Authorization: getToken()}" accept=".md" :show-file-list="false" :on-success="importMdSuccess" :before-upload="beforeImportMdSuccess">
                  <button type="button" title="导入md文件" class="op-icon fa">
                    <more-icon style="width: 18px; top: 0;" iconClass="iconfont-import"></more-icon>
                  </button>
                </el-upload>
              </div>
            </template>
          </mavon-editor>
        </el-form-item>
      </el-form>
    </el-col>
    <!-- 发布弹出对话框 -->
    <el-dialog title="发布选项" :visible="pubDialogShow" :show-close="false" width="800px">
      <el-form ref="pubForm" :rules="rules" :model="editDataModel" label-position="right" label-width="100px">
        <!-- 文章标签 -->
        <el-form-item label="标签">
          <el-select v-model="selectedTagArray" class="full-row" filterable :multiple-limit="5" multiple placeholder="可输入文字查询">
            <el-option v-for="item in allTagList" :key="item.postTagId" :label="item.description" :value="item.postTagId">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 摘要 -->
        <el-form-item label="摘要">
          <el-input v-model="editDataModel.postExcerpt" :rows="3" :autosize="{ minRows: 3, maxRows: 3}" type="textarea" placeholder="请输入摘要" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="封面图">
          <div class="styleof-inlineblock" @mouseover="articleCoverOpLayerShow = true" @mouseleave="articleCoverOpLayerShow = false">
            <el-upload class="article-cover" :action="uploadUrl" :headers="{Authorization: getToken()}" :show-file-list="false" :on-success="handleArticleCoverSuccess" :before-upload="beforeArticleCoverUpload">
              <el-image v-if="articleCoverUrl" :src="articleCoverUrl" fit="cover" class="article-cover"></el-image>
              <i v-else class="el-icon-plus cover-uploader-icon"></i>
              <div v-show="articleCoverUrl && articleCoverOpLayerShow" class="op-layer">
                <el-button type="danger" size="mini" @click.stop="articleCoverUrl=''"><i class="el-icon-refresh"></i>删除</el-button>
              </div>
            </el-upload>
          </div>
          <div class="red-tip">只能上传jpg/png文件，最佳宽高比为3:2，展示端文章详情页最大宽度820px, 且不超过2M</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="text-right">
        <el-button @click="pubDialogShow = false">取消</el-button>
        <el-button type="primary" @click="saveData('PUBLISHED')">确定</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>
<script>
import { getToken } from '@/utils/auth'
import { getArticleById, deleteArticle, createArticle, updateArticle, getTagList, mdEditorUploadImage, uploadUrl, importMdUrl } from '@/api/articles'
import { emptyChecker } from '@/utils/validate'
import { createUuid, handleFormValidError, getTextFormHtml } from '@/utils/common'
import qs from 'qs'
import { mavonEditor } from 'mavon-editor'
import MoreIcon from '@/components/more-icon'
import 'mavon-editor/dist/css/index.css'
import './page.css'
import Vue from 'vue'
Vue.use(mavonEditor)

export default {
  name: 'articleEdit',
  components: { mavonEditor, MoreIcon },
  computed: {
    currentUserInfo() {
      return this.$store.state.userInfo
    }
  },
  data() {
    return {
      // 上传接口URL
      uploadUrl,

      // 导入md文件接口url
      importMdUrl,

      // 页面顶部显示当前操作类型的标题部分
      topOperTitlePart: '新增',

      // 页面用来编辑的数据模型
      editDataModel: {
        postsId: undefined,
        postTitle: '', // 标题
        postContent: '', // 正文
        htmlContent: '', // html内容，现在转化了，前端直接查询展示就好了
        postExcerpt: '', // 摘要
        postType: 'POST', // 文章类型
        postStatus: 'DRAFT', // 文章状态
        termTaxonomyId: '', // 所属栏目id
        attribute: '', // 属性
        tags: '' // 标签
      },

      // 所有标签列表
      allTagList: [],
      // 已经选择的标签
      selectedTagArray: [],

      // 编辑弹窗校验规则
      rules: {
        postTitle: [{ required: true, validator: emptyChecker, message: '文章标题不能为空', trigger: 'none' }],
        postContent: [{ required: true, validator: emptyChecker, message: '文章正文不能为空', trigger: 'none' }]
      },

      articleCoverUrl: '',
      articleCoverOpLayerShow: false,

      // 文章标题相关设置数据
      otherSettings: {
        articleCoverUrl: ''
        // isBold: false, // 是否粗体
        // textColor: 'green', // 链接文字的颜色，目前支持蓝色和绿色
        // rightButton: { // 右侧按钮设置
        //   show: false, // 是否显示右侧按钮
        //   bgColor: '', // 按钮背景色：绿色(green)、蓝色(blue)、黑色(默认，没有值就是黑色)
        //   textContent: '查看更多', // 按钮上的文字
        //   linkType: '0', // 链接类型
        //   linkTo: '' // 按钮链接是否链接本文章或者可以设置任意外链，如果不填写，就链接本篇文章
        // }
      },

      // 标签名称校验规则
      tagCheckRule: [{ required: true, validator: emptyChecker, message: '标签名称不能为空', trigger: 'blur' }],

      // 当前编辑页面的id
      editId: null,
      // 新增时候的所属栏目id
      columnId: null,
      // 编辑模式
      editMode: null,

      // 发布弹窗可见性
      pubDialogShow: false,
      // md编辑器高度变量
      mdEditorHeight: '700px',
      // md编辑器加载项
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: false, // 上角标
        subscript: false, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: true, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: false, // 展示html源码
        help: true, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: false, // 左对齐
        aligncenter: false, // 居中
        alignright: false, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true // 预览
      }
    }
  },
  methods: {
    // 查询标签列表方法
    getSystemTagList() {
      return getTagList({ page: 1, pageSize: 1000 }).then(res => {
        res.items.forEach((item, i) => {
          item.oriIndex = i
          item.selected = false
        })
        this.allTagList = res.items
      })
    },

    // 上传文章封面图之前验证的方法
    beforeArticleCoverUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 2
      if (!isLt1M) {
        this.$message.error('封面图片大小不能超过2MB!')
      }
      return isLt1M
    },
    // 上传文章封面图成功后回调函数
    handleArticleCoverSuccess(res, file) {
      this.articleCoverUrl = res.result
      console.log('this.articleCoverUrl=', this.articleCoverUrl)
    },

    // 上传文章封面图之前验证的方法
    beforeImportMdSuccess(file) {
      const isLt1M = file.size / 1024 / 1024 < 10
      if (!isLt1M) {
        this.$message.error('封面图片大小不能超过10MB!')
      }
      return isLt1M
    },
    // 上传文章封面图成功后回调函数
    importMdSuccess(res, file) {
      if (res && res.code === 0) {
        if (res.result.postTitle.endsWith('.md')) {
          res.result.postTitle = res.result.postTitle.substr(0, res.result.postTitle.length - 3)
        }
        this.editDataModel.postTitle = res.result.postTitle
        this.editDataModel.postContent = res.result.content
      } else {
        if (res.message) {
          this.this.$message.error(res.message)
        } else {
          this.$message.error('导入失败，请重试或联系管理员')
        }
      }
    },

    getToken,
    createUuid,

    // md编辑器上传图片方法
    handleEditorImgAdd(pos, $file) {
      let formdata = new FormData()
      formdata.append('file', $file)
      mdEditorUploadImage(formdata).then(res => {
        this.$refs.md.$img2Url(pos, res)
        this.$nextTick(() => {
          let mdCurrentValue = this.editDataModel.postContent
          // 查找图片插入的字符串位置
          let pattern = /(!\[.*\]\()(.+)(\))/g
          let matchArr = mdCurrentValue.match(pattern)
          for (let i = matchArr.length - 1; i >= 0; i--) {
            const item = matchArr[i]
            if (item.indexOf(res) > -1) {
              const currentMaxLength = this.editDataModel.postContent.length
              const imgStrIndex = mdCurrentValue.indexOf(item)
              const prevPrevChar = imgStrIndex - 2 >= 0 ? mdCurrentValue.substr(imgStrIndex - 2, 1) : ''
              const prevChar = imgStrIndex - 1 >= 0 ? mdCurrentValue.substr(imgStrIndex - 1, 1) : ''
              const nextChar = mdCurrentValue.substr(imgStrIndex + item.length, 1)
              const nextNextChar = imgStrIndex + item.length + 1 <= currentMaxLength ? mdCurrentValue.substr(imgStrIndex + item.length + 1, 1) : ''
              let repItem = (prevPrevChar == '\n' ? '' : '\n') +
                (prevChar == '\n' ? '' : '\n') + item +
                (nextChar == '\n' ? '' : '\n') +
                (nextNextChar == '\n' ? '' : '\n')
              if (repItem.length != item.length) {
                this.editDataModel.postContent = mdCurrentValue.replace(item, repItem)
              }
            }
          }
        })
      })
    },

    // md编辑器内容change事件
    handleEditorChange(value, transToHtml) {
      this.editDataModel.htmlContent = transToHtml
    },

    // 弹出警告错误信息提示，点击确定后关闭窗口方法
    alertMessageAndCloseWindow(message, iconType) {
      this.$alert(message, {
        type: iconType || 'failed',
        callback: action => {
          window.close()
        }
      }).then(() => {
        window.close()
      })
    },
    // 保存文章方法
    saveData(stateSetting) {
      // 赋值文章状态
      this.editDataModel.postStatus = stateSetting
      // 赋值属性
      this.otherSettings.articleCoverUrl = this.articleCoverUrl
      this.editDataModel.attribute = JSON.stringify(this.otherSettings)
      // 赋值文章标签
      if (this.selectedTagArray.length > 0) {
        this.editDataModel.tags = this.selectedTagArray.join(',')
      }

      this.$refs['dataForm'].validate((valid, errorInfo) => {
        if (valid) {
          this.dialogLoading = true
          const postData = qs.stringify(this.editDataModel)

          const saveFunc = this.editMode === 'n' ? createArticle : updateArticle

          saveFunc(postData).then(() => {
            this.$notify({
              title: '成功',
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
            this.$router.push('/content/articles')
          })
        } else {
          handleFormValidError(errorInfo)
        }
      })
    },
    // 发布按钮点击方法
    pubButtonClick() {
      this.$refs['dataForm'].validate((valid, errorInfo) => {
        if (valid) {
          if (!this.editDataModel.postExcerpt && this.editDataModel.htmlContent) {
            let allText = (getTextFormHtml(this.editDataModel.htmlContent)).trim()
            this.editDataModel.postExcerpt = allText.length > 100 ? allText.substr(0, 97) + '...' : allText
          }
          this.pubDialogShow = true
        } else {
          // 显示错误信息
          handleFormValidError(errorInfo)
        }
      })
    },
    // 加载编辑的数据
    loadData() {
      getArticleById({ postsId: this.editId }).then(res => {
        this.editDataModel = res
        if (this.editDataModel.attribute) {
          // 赋值界面属性对象
          this.otherSettings = this.editDataModel.attribute
          this.articleCoverUrl = this.otherSettings.articleCoverUrl
        }
        // 赋值界面标签数组对象
        if (this.editDataModel.tagsName) {
          let tempArr = res.tagsName.split(',')
          tempArr.forEach(x => {
            this.selectedTagArray.push(parseInt(x))
          })
        }
        this.$refs['dataForm'].clearValidate()
      })
      // .catch(() => {
      //   this.alertMessageAndCloseWindow('查询编辑文章信息发生异常，请刷新文章列表重试，将关闭编辑窗口')
      // })
    },
    // 文章删除方法
    handleDelete() {
      const confirmMes = '是否确认删除该文章？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.viewLoading = true
        deleteArticle({ postsId: this.editId }).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.$router.push('/content/articles')
        }).catch((msg) => {
          this.$alert(`删除失败，服务器返回信息：${msg}`, { type: 'failed' })
        })
      })
    }
  },
  mounted() {
    // this.$store.dispatch('refleshUserInfo')
    // 初始化可供选择的标签列表
    this.getSystemTagList().then(() => {
      // 编辑的情况
      if (this.$route.query.aid) {
        this.editId = this.$route.query.aid
        this.editMode = 'm'
        this.topOperTitlePart = '编辑'
        this.loadData()
      } else {
        // 新增的情况
        this.editMode = 'n'
        this.columnId = this.$route.query.cid
        this.editDataModel.termTaxonomyId = this.columnId
      }
    })
    // 使md编辑器高度，随浏览器窗口自动变化
    let that = this
    that.mdEditorHeight = (window.innerHeight - 55 - 98) + 'px'
    window.addEventListener('resize', () => {
      that.mdEditorHeight = (window.innerHeight - 55 - 98) + 'px'
    })
  }
}
</script>

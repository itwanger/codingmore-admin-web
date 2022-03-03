<template>
  <el-row>
    <el-col :span="24">
      <el-form class="article-edit-form" ref="dataForm" :rules="rules" :model="editDataModel" label-position="right" label-width="0" :show-message="false" :status-icon="false">
        <div class="flex-row-ver-center title-row">
          <div class="flex-auto-item">
            <!-- 标题 -->
            <el-form-item prop="postTitle">
              <el-input v-model="editDataModel.postTitle" maxlength="100" placeholder="请输入标题..." />
            </el-form-item>
          </div>
          <div class="btn-area flex-fixed-item">
            <el-button v-if="editMode === 'm'" type="danger" @click="handleDelete">
              删除
            </el-button>
            <el-button @click="saveData('DRAFT')">
              保存草稿
            </el-button>
            <!-- <el-button type="primary" @click="saveData('PUBLISHED')"> -->
            <el-button type="primary" @click="pubButtonClick">
              发布
            </el-button>
          </div>
          <!-- <div class="user-area flex-fixed-item">
            <el-popover trigger="click">
              <el-button type="primary">修改密码</el-button>
              <el-button type="danger" @click="logoutSystemClick">退出登陆</el-button>
              <el-image :src="currentUserInfo && currentUserInfo.userDetail.userUrl ? currentUserInfo.userDetail.userUrl: defaultUserImage" class="user-image" slot="reference">
              </el-image>
            </el-popover>
          </div> -->
        </div>

        <!-- 正文 -->
        <el-form-item prop="postContent">
          <mavon-editor v-model="editDataModel.postContent" ref="md" :html="false" :style="'height:'+ mdEditorHeight + ';box-shadow:none;border:1px solid #efefef;'" :toolbars="toolbars" @imgAdd="handleEditorImgAdd" @change="handleEditorChange" />
        </el-form-item>
      </el-form>
    </el-col>

    <!-- 发布弹出对话框 -->
    <el-dialog title="发布选项" :visible="pubDialogShow" :show-close="false" width="800px">
      <el-form ref="pubForm" :rules="rules" :model="editDataModel" label-position="right" label-width="100px">
        <!-- 文章标签 -->
        <el-form-item label="标签">
          <!-- 新增按钮 -->
          <el-button type="primary" icon="el-icon-plus" @click="addTagClick"></el-button>
          <!-- 调整到最前面按钮 -->
          <el-button @click="moveTag(tagSelectedIndex, 't')" type="primary" icon="el-icon-d-arrow-left" size="mini" :disabled="tagSelectedIndex == -1 || tagSelectedIndex == 0" circle></el-button>
          <!-- 向前调整一位按钮 -->
          <el-button @click="moveTag(tagSelectedIndex, 'f')" type="primary" icon="el-icon-arrow-left" size="mini" :disabled="tagSelectedIndex == -1 || tagSelectedIndex == 0" circle></el-button>
          <!-- <el-input v-model="editDataModel.tags" maxlength="100" placeholder="请输入标签，多个标签之间使用逗号分隔" /> -->

          <!-- 标签列表 -->
          <el-tag class="article-tag" :type="(tagSelectedIndex == index ? 'warning': '')" :key="tag.key" v-for="(tag, index) in tagArray" effect="light" closable :disable-transitions="false" @click="selectTag(index)" @close="deleteTag(index)">
            {{tag.name}}
          </el-tag>
          <!-- 向后调整一个位置按钮 -->
          <el-button @click="moveTag(tagSelectedIndex, 'b')" style="margin-left:10px;" type="primary" icon="el-icon-arrow-right" size="mini" :disabled="tagSelectedIndex == -1 || tagSelectedIndex == tagArray.length - 1" circle></el-button>
          <!-- 调整到最后位置按钮 -->
          <el-button @click="moveTag(tagSelectedIndex, 'l')" type="primary" icon="el-icon-d-arrow-right" size="mini" :disabled="tagSelectedIndex == -1 || tagSelectedIndex == tagArray.length - 1" circle></el-button>
        </el-form-item>
        <!-- 摘要 -->
        <el-form-item label="摘要">
          <el-input v-model="editDataModel.postExcerpt" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="请输入摘要" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="text-right">
        <el-button @click="pubDialogShow = false">取消</el-button>
        <el-button type="primary" @click="saveData('PUBLISHED')">确定</el-button>
      </div>
    </el-dialog>

    <!-- 添加标签对话框 -->
    <el-dialog title="添加标签" :visible="addTagDialog.show" width="350px" :show-close="false">
      <el-form ref="addTagForm" :model="addTagDialog" label-width="80px">
        <el-form-item label="名称" prop="text" :rules="tagCheckRule">
          <el-input v-model="addTagDialog.text" placeholder="请填写标签名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="addTagConfirm">确定并继续</el-button>
        <el-button type="primary" @click="addTagConfirmAndClose">确定</el-button>
        <el-button @click="addTagDialog.show = false">关闭</el-button>
      </div>
    </el-dialog>
  </el-row>
</template>
<script>
import { UserLogout } from '@/api/users'
import { removeToken } from '@/utils/auth'
import { getArticleById, deleteArticle, createArticle, updateArticle, mdEditorUploadImage } from '@/api/articles'
import { emptyChecker } from '@/utils/validate'
import { createUuid } from '@/utils/common'
import qs from 'qs'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import './page.css'
import Vue from 'vue'
Vue.use(mavonEditor)

export default {
  name: 'articleEdit',
  components: { mavonEditor },
  computed: {
    currentUserInfo() {
      return this.$store.state.userInfo
    },
    getMarkdownHeight() {
      return (window.innerHeight - 40.5 - 16 * 3 - 75) + 'px'
    }
  },
  data() {
    return {
      // 默认头像路径
      defaultUserImage: require('@/assets/default_user_image.jpg'),

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

      // 标签数组
      tagArray: [],
      tagSelectedIndex: -1,

      // 编辑弹窗校验规则
      rules: {
        postTitle: [{ required: true, validator: emptyChecker, message: '文章标题不能为空', trigger: 'none' }],
        postContent: [{ required: true, validator: emptyChecker, message: '文章正文不能为空', trigger: 'none' }]
      },

      // 文章标题相关设置数据
      titleDisplaySettings: {
        isBold: false, // 是否粗体
        textColor: 'green', // 链接文字的颜色，目前支持蓝色和绿色
        rightButton: { // 右侧按钮设置
          show: false, // 是否显示右侧按钮
          bgColor: '', // 按钮背景色：绿色(green)、蓝色(blue)、黑色(默认，没有值就是黑色)
          textContent: '查看更多', // 按钮上的文字
          linkType: '0', // 链接类型
          linkTo: '' // 按钮链接是否链接本文章或者可以设置任意外链，如果不填写，就链接本篇文章
        }
      },

      // 添加标签对话框可见性
      addTagDialog: {
        show: false,
        text: ''
      },
      // 标签名称校验规则
      tagCheckRule: [{ required: true, validator: emptyChecker, message: '标签名称不能为空', trigger: 'blur' }],

      // 当前编辑页面的id
      editId: null,
      // 新增时候的所属栏目id
      columnId: null,
      // 编辑模式
      editMode: null,

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
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true // 预览
      }
    }
  },
  methods: {
    // md编辑器上传图片方法
    handleEditorImgAdd(pos, $file) {
      var formdata = new FormData()
      formdata.append('file', $file)
      mdEditorUploadImage(formdata).then(res => {
        this.$refs.md.$img2Url(pos, res)
      })
    },

    // md编辑器内容change事件
    handleEditorChange(value, transToHtml) {
      this.editDataModel.htmlContent = transToHtml
    },

    // 标签移动方法
    moveTag(index, way) {
      let targetIndex = 0
      let moved = true
      let temp = this.tagArray[index]
      if ((way == 'f' && index != 0) || (way == 'b' && index < this.tagArray.length - 1)) {
        if (way == 'f') {
          targetIndex = parseInt(index - 1)
        } else {
          targetIndex = parseInt(index + 1)
        }
        this.tagArray[index] = this.tagArray[targetIndex]
        this.tagArray[targetIndex] = temp
      } else if (way == 't' && index != 0) {
        this.tagArray.splice(index, 1)
        this.tagArray.splice(0, 0, temp)
      } else if (way == 'l' && index < this.tagArray.length - 1) {
        targetIndex = this.tagArray.length - 1
        this.tagArray.splice(index, 1)
        this.tagArray.push(temp)
      } else {
        moved = false
        console.log('不移动分支，targetIndex=', targetIndex, 'index=', index, 'way=', way)
      }
      if (moved) {
        console.log('移动后结果', this.tagArray, this.$refs[`elpp_${index}`])
        this.tagSelectedIndex = targetIndex
        // this.$refs[`elpp_${index}`].doClose()
        // this.tagArray = JSON.parse(JSON.stringify(this.tagArray))
        // this.$nextTick(() => {
        //   this.$refs[`elpp_${targetIndex}`].doShow()
        // })
      }
    },

    // 选择标签方法
    selectTag(index) {
      if (this.tagSelectedIndex != index) {
        this.tagSelectedIndex = index
      } else {
        this.tagSelectedIndex = -1
      }
    },

    // 删除标签方法
    deleteTag(index) {
      this.tagArray.splice(index, 1)
    },

    // 添加标签确认按钮事件
    addTagConfirmAndClose() {
      this.$refs['addTagForm'].validate(valid => {
        if (valid) {
          const tagText = this.addTagDialog.text
          this.addTagDataToArray(tagText)
          this.addTagDialog.text = ''
          this.addTagDialog.show = false
        }
      })
    },
    // 添加标签确认并继续按钮事件
    addTagConfirm() {
      this.$refs['addTagForm'].validate(valid => {
        if (valid) {
          const tagText = this.addTagDialog.text
          this.addTagDataToArray(tagText)
          this.addTagDialog.text = ''
        }
      })
    },

    // 向数组中添加数据方法
    addTagDataToArray(tagName) {
      tagName = tagName.trim()
      let tagObject = {
        name: tagName,
        key: createUuid()
      }
      this.tagArray.push(tagObject)
    },

    // 添加标签点击事件
    addTagClick() {
      if (this.$refs['addTagForm']) {
        this.$refs['addTagForm'].clearValidate()
      }
      this.addTagDialog.text = ''
      this.addTagDialog.show = true
    },

    // 退出登陆方法
    logoutSystemClick() {
      // 调用服务器方法退出登陆
      UserLogout().then(() => {
        // 移除token
        removeToken()
        // 移除vuex中的用户信息
        this.$store.dispatch('removeUserInfo')
        // 跳转到登录页面
        this.$router.push('/login')
      })
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
      this.editDataModel.attribute = JSON.stringify(this.titleDisplaySettings)
      // 赋值文章标签
      if (this.tagArray.length > 0) {
        let tempArr = this.tagArray.map(x => x.name)
        let tagsValue = tempArr.join(',')
        this.editDataModel.tags = tagsValue
      }

      this.$refs['dataForm'].validate((valid) => {
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
        }
      })
    },
    // 发布按钮点击方法
    pubButtonClick() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.pubDialogShow = true
        }
      })
    },
    // 加载编辑的数据
    loadData() {
      getArticleById({ postsId: this.editId }).then(res => {
        this.editDataModel = res
        if (this.editDataModel.attribute) {
          // 赋值界面属性对象
          this.titleDisplaySettings = this.editDataModel.attribute
        }
        // 赋值界面标签数组对象
        if (this.editDataModel.tagsName) {
          let tempArr = res.tagsName.split(',')
          tempArr.forEach(x => {
            this.addTagDataToArray(x)
          })
        }
        this.$refs['dataForm'].clearValidate()
      })
      // .catch(() => {
      //   this.alertMessageAndCloseWindow('查询编辑文章信息发生异常，请刷新文章列表重试，将关闭编辑窗口')
      // })
    },
    // 刷新主页面列表
    refleshMainPageTable() {
      window.opener.refleshTable(this.columnId || this.editDataModel.termTaxonomyId)
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
    this.$store.dispatch('refleshUserInfo')
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

    // 使md编辑器高度，随浏览器窗口自动变化
    let that = this
    that.mdEditorHeight = (window.innerHeight - 55 - 90) + 'px'
    window.addEventListener('resize', () => {
      that.mdEditorHeight = (window.innerHeight - 55 - 90) + 'px'
    })
  }
}
</script>

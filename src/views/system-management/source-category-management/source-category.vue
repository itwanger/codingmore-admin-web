<template>
  <div class="app-container">
    <div class="flex-row-ver-center">
      <div class="flex-auto-item">
        <el-input v-model="tableAbout.listQuery.userLogin" placeholder="请输入账号" clearable></el-input>
      </div>
      <div class="flex-auto-item">
        <el-input v-model="tableAbout.listQuery.userNicename" placeholder="请输入昵称" clearable></el-input>
      </div>
      <div class="flex-fixed-item">
        <el-button class="filter-item" style="margin-left: 14px" type="primary" icon="el-icon-search" @click="search">
          搜索
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          新增
        </el-button>
      </div>
    </div>
    <div class="table-container">
      <el-table ref="multipleTable" height="calc(100% - 10px)" :key="tableAbout.tableKey" :data="tableAbout.tableData" border fit highlight-current-row class="normal-table">
        <el-table-column label="编号" prop="id" width="80px" align="center" />
        <el-table-column label="账号" prop="userLogin" />
        <el-table-column label="昵称" prop="userNicename" />
        <el-table-column label="邮箱" prop="userEmail" align="center" />
        <el-table-column label="添加时间" prop="userRegistered" align="center" />
        <el-table-column label="状态" prop="userStatus" align="center">
          <template slot-scope="{ row }">
            <el-switch v-model="row.userStatus" :active-value="0" :inactive-value="1" @change="userStatusChange($event, row.id)">
            </el-switch>
          </template>
        </el-table-column>
        <!-- <el-table-column label="排序号" prop="menuOrder" width="80px" align="center" /> -->
        <el-table-column label="操作" align="center" width="280px">
          <template slot-scope="{ row, $index }">
            <el-button type="success" size="mini" @click="handleUpdate(row)">
              分配角色
            </el-button>
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button v-if="row.status != 'deleted'" size="mini" type="danger" @click="handleDelete(row, $index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="text-right">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableAbout.listQuery.page" background :page-size="tableAbout.listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[15, 30, 50, 100]" :total="tableAbout.listQuery.total">
      </el-pagination>
    </div>

    <el-dialog :title="editDialog.title[editDialog.status]" width="500px" :visible.sync="editDialog.visible">
      <el-form ref="userInfoForm" :model="editDataModel" :rules="editDialog.rules" label-position="right" label-width="60px">
        <el-form-item label="头像" v-if="editDialog.status === 1">
          <div class="user-image-container" v-if="editDataModel.userUrl" @mouseover="userImageOptionsShow = true" @mouseleave="userImageOptionsShow = false">
            <img :src="editDataModel.userUrl" class="avatar">
            <div v-show="userImageOptionsShow" class="user-image-float-layer">
              <el-button type="primary" size="mini"><i class="el-icon-download" @click="window.open(editDataModel.userUrl)"></i>下载</el-button>
              <el-button type="danger" size="mini" @click="editDataModel.userUrl=''"><i class="el-icon-refresh"></i>删除</el-button>
            </div>
          </div>
          <el-upload class="avatar-uploader" v-show="!editDataModel.userUrl" :action="uploadUrl" :headers="{Authorization: getToken()}" :on-success="handleUserImageUploadSuccess" :before-upload="beforeUserImageUpload" :file-list="userImageFileList" :show-file-list="false" :on-remove="handleUserImageRemove">
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="账号" prop="userLogin" v-if="editDialog.status === 0">
          <el-input v-model="editDataModel.userLogin" autocomplete="off" maxlength="20" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="userNicename">
          <el-input v-model="editDataModel.userNicename" autocomplete="off" maxlength="20" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="userPass" v-if="editDialog.status === 0">
          <el-input v-model="editDataModel.userPass" autocomplete="off" maxlength="30" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="editDataModel.userEmail" autocomplete="off" maxlength="100" placeholder="请输入邮箱"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- <el-dialog title="分配文章到专栏" width="400px" :visible.sync="assignArticlesDialogShow">
      <div class="filter-container">
        <el-input v-model="searchTreeText" placeholder="专栏名称" @keyup.enter.native="searchTree">
          <el-button slot="append" icon="el-icon-search" @click="searchTree" />
        </el-input>
      </div>
      <div class="tree-area">
        <el-tree ref="columnTree" :filter-node-method="filterNode" :auto-expand-parent="true" :highlight-current="true" :data="treeData" node-key="termTaxonomyId" :expand-on-click-node="false" :props="treeDefaultProps" show-checkbox :check-strictly="true" @current-change="handleTreeNodeChange" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignArticlesDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="confirmArticleToColumns">确 定</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { getUserList, setUserStatus, addUser, getUserInfoById, updateUserInfoById, deleteUser, uploadUrl } from '@/api/users'
import { emptyChecker } from '@/utils/validate'
import qs from 'qs'
import './page.css'

export default {
  name: 'ArticlesManagement',
  data() {
    return {
      uploadUrl,

      statusList: [
        { value: 'DRAFT', label: '草稿' },
        { value: 'PUBLISHED', label: '发布' }
      ], // { value: 'DELETED', label: '删除' },

      // 文章列表相关属性
      tableAbout: {
        listQuery: {
          page: 1,
          pageSize: 15,
          total: 0,
          userLogin: '',
          userNicename: ''
        },
        tableKey: 0,
        tableData: [],
        selectedRowList: [] // 被选中行集合
      },

      // 页面用来编辑的数据模型
      editDataModel: {
        userLogin: '',
        userNicename: '',
        userPass: '',
        userEmail: '',
        displayName: ''
      },

      // 编辑用户信息弹窗数据模型
      editDialog: {
        title: ['新增用户', '编辑用户'],
        visible: false,
        status: 0,
        rules: {
          userLogin: [{ required: true, validator: emptyChecker, message: '账号不能为空', trigger: 'blur' }],
          userNicename: [{ required: true, validator: emptyChecker, message: '昵称不能为空', trigger: 'blur' }],
          userPass: [{ required: true, validator: emptyChecker, message: '密码不能为空', trigger: 'blur' }]
        }
      },

      userImageFileList: [],
      userImageOptionsShow: false
    }
  },
  // watch: {
  //   'editDialog.status'(val) {
  //   }
  // },
  mounted() {
    // 获取列表
    this.getList()
  },
  methods: {
    getToken,
    handleUserImageRemove(file, fileList) {
      this.editDataModel.userUrl = ''
    },
    // 上传用户头像之前验证的方法
    beforeUserImageUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1
      if (!isLt1M) {
        this.$message.error('封面图片大小不能超过1MB!')
      }
      return isLt1M
    },
    // 用户头像上传成功回调方法
    handleUserImageUploadSuccess(res, file) {
      this.editDataModel.userUrl = res.result
    },

    // 启用/禁用用户事件处理方法
    userStatusChange(status, usersId) {
      const reqData = qs.stringify({ status, usersId })
      setUserStatus(reqData).then(() => {
        this.$message.success('操作成功')
      })
    },

    // 处理页码改变事件
    handleSizeChange(val) {
      this.tableAbout.listQuery.pageSize = val
      this.search()
    },

    // 处理页码改变事件
    handleCurrentChange(val) {
      this.tableAbout.listQuery.page = val
      this.getList()
    },

    // 文章搜索方法
    search() {
      this.tableAbout.listQuery.page = 1
      this.getList()
    },

    // 列表查询方法
    getList() {
      getUserList(this.tableAbout.listQuery).then((res) => {
        this.tableAbout.tableData = res.items
        this.tableAbout.listQuery.total = res.total
      })
    },

    // 保存用户信息方法
    saveUserInfo() {
      this.$refs['userInfoForm'].validate((valid) => {
        if (valid) {
          const saveFunc = this.editDialog.status == 0 ? addUser : updateUserInfoById
          saveFunc(qs.stringify(this.editDataModel)).then(() => {
            this.$notify({
              title: '成功',
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
            this.editDialog.visible = false
          })
        }
      })
    },

    // 新增的时候重置编辑数据模型
    getAddUserModel() {
      this.editDataModel = {
        userLogin: '',
        userNicename: '',
        userPass: '',
        userEmail: '',
        displayName: '',
        attribute: '', // 暂时没用到的json属性
        userUrl: '' // 用户头像网址
      }
    },

    // 更新数据的时候根据返回数据构建编辑数据模型
    getUpdateUserModel(data) {
      this.editDataModel = {
        id: data.id,
        userNicename: data.userNicename,
        userEmail: data.userEmail,
        displayName: data.displayName,
        userUrl: data.userUrl // 用户头像网址
      }
    },

    // 新增按钮点击方法
    handleCreate() {
      this.editDialog.status = 0
      this.getAddUserModel()
      this.editDialog.visible = true
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      this.editDialog.status = 1
      getUserInfoById({ usersId: row.id }).then(res => {
        this.getUpdateUserModel(res)
        this.editDialog.visible = true
      })
    },
    // 行删除按钮处理
    handleDelete(row, index) {
      const confirmMes = '是否确认删除该用户？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser({ usersId: row.id }).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.editDialog.visible = false
          this.getList()
        })
      })
    }
  }
}
</script>

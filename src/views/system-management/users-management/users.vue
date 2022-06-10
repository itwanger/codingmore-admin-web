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
        <el-select v-model="tableAbout.listQuery.roleId" clearable placeholder="请选择角色">
          <el-option v-for="item in allRoleList" :label="item.name" :value="item.roleId" :key="item.roleId">{{item.name}}</el-option>
        </el-select>
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
        <el-table-column label="编号" prop="usersId" width="80px" align="center" />
        <el-table-column label="账号" prop="userLogin" />
        <el-table-column label="昵称" prop="userNicename" />
        <el-table-column label="邮箱" prop="userEmail" align="center" />
        <el-table-column label="添加时间" prop="userRegistered" align="center" />
        <el-table-column label="状态" prop="userStatus" align="center">
          <template slot-scope="{ row }">
            <el-switch v-model="row.userStatus" :active-value="0" :inactive-value="1" @change="handleStatusChange($event, row.usersId)">
            </el-switch>
          </template>
        </el-table-column>
        <!-- <el-table-column label="排序号" prop="menuOrder" width="80px" align="center" /> -->
        <el-table-column label="操作" align="center" width="280px">
          <template slot-scope="{ row }">
            <el-button type="success" size="mini" @click="handleSetRolePower(row)">
              分配角色
            </el-button>
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button v-if="row.status != 'deleted'" size="mini" type="danger" @click="handleDelete(row)">
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
    <!-- 详情编辑对话框 -->
    <el-dialog :title="editDialog.title[editDialog.status]" width="500px" :visible.sync="editDialog.visible">
      <el-form ref="editInfoForm" :model="editDataModel" :rules="editDialog.rules" label-position="right" label-width="60px">
        <el-form-item label="头像" v-if="editDialog.status === 1">
          <div class="user-image-container" v-if="editDataModel.userUrl" @mouseover="userImageOptionsShow = true" @mouseleave="userImageOptionsShow = false">
            <img :src="editDataModel.userUrl" class="avatar">
            <div v-show="userImageOptionsShow" class="user-image-float-layer">
              <!-- <el-button type="primary" size="mini"><i class="el-icon-download" @click="window.open(editDataModel.userUrl)"></i>下载</el-button> -->
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

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" width="700px" :visible.sync="setRolePowerDialogShow">
      <div class="role-split-area">
        <el-checkbox-group v-model="roleSettingInfo.roleIds">
          <el-row>
            <el-col :span="8" v-for="item in allRoleList" :key="item.roleId">
              <el-checkbox :label="item.roleId">{{ item.name }}</el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolePowerDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="saveRolePowerSetting">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { getAllRoles } from '@/api/roles'
import {
  getUserList, setUserStatus, getUserRoles, setUserRoles,
  addUser, getUserInfoById, updateUserInfoById, deleteUser, uploadUrl} from '@/api/users'
import { emptyChecker } from '@/utils/validate'
import qs from 'qs'
import './page.css'

export default {
  name: 'UsersManagement',
  data() {
    return {
      uploadUrl,

      // 列表相关属性
      tableAbout: {
        listQuery: {
          page: 1,
          pageSize: 15,
          total: 0,
          roleId: null,
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

      // 上传用户头像文件列表
      userImageFileList: [],
      // 上传用户头像选项：下载、删除可见性
      userImageOptionsShow: false,

      // 分配角色对话框可见性
      setRolePowerDialogShow: false,
      // 所有角色选项
      allRoleList: [],
      // 分配角色数据对象
      roleSettingInfo: {
        userId: null,
        roleIds: []
      }
    }
  },
  mounted() {
    // 角色管理列表中点击用户数一列跳转过来接参数
    if (this.$route.params && this.$route.params.rid) {
      this.tableAbout.listQuery.roleId = this.$route.params.rid
    }

    // 获取列表
    this.getList()
    this.getAllRoleList()
  },
  methods: {
    getToken,

    // 查询所有角色列表方法
    getAllRoleList() {
      getAllRoles().then(res => {
        this.allRoleList = res
      })
    },

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
      this.userImageOptionsShow = false
    },

    // 启用/禁用用户事件处理方法
    handleStatusChange(status, usersId) {
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
      this.$refs['editInfoForm'].validate((valid) => {
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
        usersId: data.usersId,
        userNicename: data.userNicename,
        userEmail: data.userEmail,
        displayName: data.displayName,
        userUrl: data.userUrl // 用户头像网址
      }
    },

    // 打开编辑对话框方法
    openEditDialog(dialogStatus) {
      this.editDialog.status = dialogStatus
      if (this.$refs['editInfoForm']) {
        this.$refs['editInfoForm'].clearValidate()
      }
      this.userImageOptionsShow = false
      this.editDialog.visible = true
    },

    // 保存分配角色
    saveRolePowerSetting() {
      // setUserRoles()
      const reqData = qs.stringify({userId: this.roleSettingInfo.userId, roleIds: this.roleSettingInfo.roleIds.join()})
      setUserRoles(reqData).then(() => {
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000
        })
        this.setRolePowerDialogShow = false
      })
    },

    // 处理分配角色点击事件
    handleSetRolePower(row) {
      getUserRoles({ userId: row.usersId }).then(res => {
        console.log('获取用户角色数据', res)
        this.roleSettingInfo.userId = row.usersId
        this.roleSettingInfo.roleIds = res.map(item => item.roleId)
        this.setRolePowerDialogShow = true
      })
    },

    // 新增按钮点击方法
    handleCreate() {
      this.getAddUserModel()
      this.openEditDialog(0)
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      getUserInfoById({ usersId: row.usersId }).then(res => {
        this.getUpdateUserModel(res)
        this.openEditDialog(1)
      })
    },
    // 行删除按钮处理
    handleDelete(row) {
      const confirmMes = '是否确认删除该用户？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser({ usersId: row.usersId }).then(() => {
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

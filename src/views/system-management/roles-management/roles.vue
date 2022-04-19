<template>
  <div class="app-container">
    <div class="flex-row-ver-center">
      <div class="flex-auto-item">
        <el-input v-model="tableAbout.listQuery.keyword" placeholder="请输入角色名称" clearable></el-input>
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
        <el-table-column label="编号" prop="roleId" width="80px" align="center" />
        <el-table-column label="角色名称" prop="name" />
        <el-table-column label="描述" prop="description" />
        <el-table-column label="用户数" align="center">
          <template slot-scope="{ row }">
            <el-link @click="handleCheckRoleUsers(row)"> {{ row.adminCount ? row.adminCount: 0 }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="添加时间" prop="createTime" align="center" />
        <el-table-column label="是否启用" align="center">
          <template slot-scope="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange($event, row.roleId)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="340px">
          <template slot-scope="{ row }">
            <el-button type="success" size="mini" @click="handleSetMenu(row)">
              分配菜单
            </el-button>
            <el-button type="success" size="mini" @click="handleSetSource(row)">
              分配资源
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
      <el-form ref="editInfoForm" :model="editDataModel" :rules="editDialog.rules" label-position="right" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editDataModel.name" autocomplete="off" maxlength="20" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="editDataModel.description" autocomplete="off" maxlength="200" :rows="5" :cols="15" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="editDataModel.status">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配菜单对话框 -->
    <el-dialog title="分配菜单" width="400px" :visible.sync="setManuPowerDialogShow">
      <div class="filter-container">
        <el-input v-model="searchTreeText" placeholder="菜单名称" @keyup.enter.native="searchTree">
          <el-button slot="append" icon="el-icon-search" @click="searchTree" />
        </el-input>
      </div>
      <div class="tree-area">
        <el-tree ref="columnTree" :filter-node-method="filterNode" :auto-expand-parent="true" :highlight-current="true" :data="treeData" node-key="menuId" :expand-on-click-node="false" :props="treeDefaultProps" show-checkbox :default-expand-all="true" :check-on-click-node="true" @current-change="handleTreeNodeChange" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setManuPowerDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleMenuPower">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配资源对话框 -->
    <el-dialog title="分配资源" width="700px" :visible.sync="setSourcePowerDialogShow">
      <div class="source-split-area">
        <el-card v-for="item in sourceFormdData" :key="item.id" class="box-card">
          <div slot="header" class="clearfix">
            <el-checkbox :indeterminate="item.checkedIds.length > 0 && item.checkedIds.length !== item.options.length" v-model="item.checked" @change="handleCheckAllChange($event, item)">{{ item.label }}</el-checkbox>
          </div>
          <el-checkbox-group v-model="item.checkedIds">
            <el-row>
              <el-col :span="8" v-for="(subItem) in item.options" :key="subItem.value">
                <el-checkbox :label="subItem.value">{{subItem.label}}</el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </el-card>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setSourcePowerDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleSourcePower">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAllMenusTree } from '@/api/menus'
import { getSourceAllList } from '@/api/sources'
import { getSourceCategoryList } from '@/api/source-categories'
import {
  getRoleList, setRoleStatus, addRole,
  updateRole, deleteRoleBatch,
  getRoleOwnedMenuList, setMenuPowerForRole,
  getRoleOwnedSourceList, setSourcePowerForRole} from '@/api/roles'
import { emptyChecker } from '@/utils/validate'
import qs from 'qs'

export default {
  name: 'RolesManagement',
  data() {
    return {
      // 文章列表相关属性
      tableAbout: {
        listQuery: {
          page: 1,
          pageSize: 15,
          total: 0,
          keyword: ''
        },
        tableKey: 0,
        tableData: []
      },

      // 页面用来编辑的数据模型
      editDataModel: {
        roleId: '',
        name: '',
        status: 1,
        description: ''
      },

      // 编辑用户信息弹窗数据模型
      editDialog: {
        title: ['新增角色', '编辑角色'],
        visible: false,
        status: 0,
        rules: {
          name: [{ required: true, validator: emptyChecker, message: '角色名称不能为空', trigger: 'blur' }],
          status: [{ required: true, validator: emptyChecker, message: '角色是否启用不能为空', trigger: 'blur' }]
        }
      },

      // 分配菜单或者资源操作的角色id
      operatingRoleId: null,
      // 树形栏目数据
      treeData: null,
      // 当前选中树节点的数据
      treeSelectedNode: null,
      // 当前树节点过滤条件
      searchTreeText: '',
      treeDefaultProps: {
        children: 'children',
        label: 'title'
      },
      treeDataList: [],

      // 分配菜单对话框的可见度
      setManuPowerDialogShow: false,

      // 分配资源对话框的可见度
      setSourcePowerDialogShow: false,
      // 资源可选项数据，用来构建界面，记录选择项使用
      sourceFormdData: []
    }
  },
  mounted() {
    // 获取列表
    this.getList()
    this.getTreeData()
    this.getAllSource()
  },
  methods: {
    // 点击角色统计用户的数字，跳转到用户列表，按照点击的角色id进行查询
    handleCheckRoleUsers(row) {
      this.$router.push({ name: `users-management`, params: { rid: row.roleId } })
    },

    // 分配菜单点击事件
    handleSetMenu(row) {
      getRoleOwnedMenuList({ roleId: row.roleId }).then((res) => {
        this.operatingRoleId = row.roleId
        this.setManuPowerDialogShow = true
        this.$nextTick(() => {
          if (res.length > 0) {
            let valuesToSet = []
            res.forEach(item => {
              let marked = this.treeDataList.find(x => x.isLeaf && x.menuId === item.menuId)
              console.log('marked=', marked)
              if (marked) {
                valuesToSet.push(item.menuId)
              }
            })
            this.$refs.columnTree.setCheckedKeys(valuesToSet, true)
          } else {
            this.$refs.columnTree.setCheckedKeys([])
          }
        })
      })
    },

    // 分配资源点击事件
    handleSetSource(row) {
      getRoleOwnedSourceList({ roleId: row.roleId }).then((res) => {
        console.log('获得角色拥有的资源数据', res)
        this.operatingRoleId = row.roleId
        this.sourceFormdData.forEach(item => {
          let matchedCategoryItems = res.filter(x => x.categoryId === item.id)
          item.checkedIds = matchedCategoryItems.map(x => x.resourceId)
          item.checked = item.checkedIds.length === item.options.length
        })
        this.setSourcePowerDialogShow = true
      })
    },

    // 启用/禁用用户事件处理方法
    handleStatusChange(status, id) {
      const reqData = qs.stringify({ status, id })
      setRoleStatus(reqData).then(() => {
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
      getRoleList(this.tableAbout.listQuery).then((res) => {
        this.tableAbout.tableData = res.items
        this.tableAbout.listQuery.total = res.total
      })
    },

    // 保存用户信息方法
    saveUserInfo() {
      this.$refs['editInfoForm'].validate((valid) => {
        if (valid) {
          const saveFunc = this.editDialog.status == 0 ? addRole : updateRole
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
        roleId: '',
        name: '',
        status: 1,
        description: ''
      }
    },
    // 打开编辑对话框方法
    openEditDialog(dialogStatus) {
      this.editDialog.status = dialogStatus
      if (this.$refs['editInfoForm']) {
        this.$refs['editInfoForm'].clearValidate()
      }
      this.editDialog.visible = true
    },

    // 新增按钮点击方法
    handleCreate() {
      this.getAddUserModel()
      this.openEditDialog(0)
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      this.editDataModel = row
      this.openEditDialog(1)
    },
    // 行删除按钮处理
    handleDelete(row) {
      const confirmMes = '是否确认删除该角色？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // const reqData
        deleteRoleBatch(qs.stringify({ ids: row.roleId })).then(() => {
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
    },
    // 获得所有资源方法
    getAllSource() {
      getSourceCategoryList().then(res => {
        this.sourceFormdData = res.map(item => {
          return { id: item.resourceCategoryId, checked: false, halfChecked: false, label: item.name, options: [], checkedIds: [] }
        })
      }).then(() => {
        getSourceAllList().then(res => {
          // console.log('加载所有资源列表', res)
          this.sourceFormdData.forEach(item => {
            let itemOptions = res.filter(x => x.categoryId === item.id)
            if (itemOptions && itemOptions.length > 0) {
              item.options = itemOptions.map(m => {
                return { label: m.name, value: m.resourceId, checked: false }
              })
            }
          })
        })
      })
    },
    handleCheckAllChange(val, item) {
      if (val) {
        item.checkedIds = item.options.map(x => x.value)
      } else {
        item.checkedIds = []
      }
    },

    // 获得菜单树数据方法
    getTreeData() {
      getAllMenusTree().then(res => {
        this.initTreeDataList(res)
        console.log('treeDataList.length', this.treeDataList.length)
        const columns = res
        this.treeData = columns
        if (this.treeSelectedNode === null) {
          this.treeSelectedNode = this.treeData[0]
        }
      })
    },
    // 初始化树数据的列表数据，方便以后查询
    initTreeDataList(treeFormData) {
      treeFormData.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.isLeaf = false
          this.initTreeDataList(item.children)
        } else {
          item.isLeaf = true
        }
        this.treeDataList.push(item)
      })
    },
    // 触发搜索树方法
    searchTree() {
      this.$refs.columnTree.filter(this.searchTreeText)
    },
    // 按名称搜索树节点方法
    filterNode(value, data) {
      if (!value) return true
      return data.title.indexOf(value) !== -1
    },
    // 处理当前选中节点改变方法
    handleTreeNodeChange(data, node) {
      if (this.treeSelectedNode !== data) {
        console.log('handleCurrentChange:重新赋值', data, node)
        this.treeSelectedNode = data
      }
      if (node.expanded === false) {
        node.expanded = true
      }
    },
    // 保存分配的菜单
    saveRoleMenuPower() {
      const checkedData = this.$refs.columnTree.getCheckedKeys()
      const halfCheckedData = this.$refs.columnTree.getHalfCheckedKeys()
      const checkManuData = [...checkedData, halfCheckedData]
      const menuIds = checkManuData.length > 0 ? checkManuData.join() : ''
      const reqData = qs.stringify({ roleId: this.operatingRoleId, menuIds })
      setMenuPowerForRole(reqData).then(() => {
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000
        })
        this.setManuPowerDialogShow = false
      })
    },

    // 保存分配的资源
    saveRoleSourcePower() {
      let selectedSourceIds = []
      this.sourceFormdData.forEach(item => {
        if (item.checkedIds.length > 0) {
          selectedSourceIds = [...selectedSourceIds, ...item.checkedIds]
        }
      })
      const reqData = qs.stringify({ roleId: this.operatingRoleId, resourceIds: selectedSourceIds.join() })
      setSourcePowerForRole(reqData).then(() => {
        this.$notify({
          title: '成功',
          message: '保存成功',
          type: 'success',
          duration: 2000
        })
        this.setSourcePowerDialogShow = false
      })
    }
  }
}
</script>
<style scoped>
.source-split-area {
  height: 500px;
  overflow: auto;
}
</style>

<template>
  <div class="app-container">
    <div class="flex-row-ver-center">
      <div class="flex-auto-item">
      </div>
      <div class="flex-fixed-item">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          新增
        </el-button>
      </div>
    </div>
    <div class="table-container">
      <el-table ref="multipleTable" height="calc(100% - 10px)" :key="tableAbout.tableKey" :data="tableAbout.tableData" border fit highlight-current-row class="normal-table" :tree-props="tableAbout.treeProp">
        <el-table-column label="菜单名称" prop="title" />
        <el-table-column label="菜单级数" prop="level" align="center">
          <template slot-scope="{ row }">
            {{row.level + '级'}}
          </template>
        </el-table-column>
        <el-table-column label="路由名称" prop="name" align="center" />
        <el-table-column label="前端图标" prop="icon" align="center" />
        <el-table-column label="是否显示" prop="hidden" align="center">
          <template slot-scope="{ row }">
            <el-switch v-model="row.hidden" :active-value="0" :inactive-value="1" @change="userStatusChange($event, row.id)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" align="center" />
        <el-table-column label="操作" align="center" width="160px">
          <template slot-scope="{ row }">
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

    <el-dialog :title="editDialog.title[editDialog.status]" width="500px" :visible.sync="editDialog.visible">
      <el-form ref="menuInfoForm" :model="editDataModel" :rules="editDialog.rules" label-position="right" label-width="80px">
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="editDataModel.title" autocomplete="off" maxlength="20" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentId">
          <el-select v-model="editDataModel.parentId" filterable placeholder="上级菜单">
            <el-option v-for="item in allMenuList" :label="item.label" :value="item.value" :key="item.value">{{item.label}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="editDataModel.name" autocomplete="off" maxlength="20" placeholder="请输入路由名称"></el-input>
        </el-form-item>
        <el-form-item label="前端图标" prop="icon">
          <el-input v-model="editDataModel.icon" autocomplete="off" maxlength="20" placeholder="请输入前端图标"></el-input>
        </el-form-item>
        <el-form-item label="是否显示" prop="hidden">
          <el-radio-group v-model="editDataModel.hidden">
            <el-radio :label="0">是</el-radio>
            <el-radio :label="1">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input v-model="editDataModel.sort" autocomplete="off" maxlength="20" placeholder="请输入分类排序号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveMenuInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addSourceCatagory, updateSourceCatagory, deleteSourceCatagory } from '@/api/source-categories'
import { getAllMenusTree } from '@/api/menus'
import { emptyChecker } from '@/utils/validate'
import qs from 'qs'

export default {
  name: 'MenuManagement',
  data() {
    return {
      // 文章列表相关属性
      tableAbout: {
        tableKey: 0,
        tableData: [],
        treeProp: { children: 'children', hasChildren: 'hasChildren' }
      },

      // 页面用来编辑的数据模型
      editDataModel: {
        title: '', // 菜单名称
        name: '', // 路由名称
        icon: '', // 前端图标
        hidden: 1, // 是否显示，0-显示，1-隐藏
        level: '', // 菜单级数
        parentId: 0, // 默认是定级菜单，0代表是根节点
        sort: 0
      },

      allMenuList: [{ label: '无上级菜单', value: 0 }],

      // 编辑用户信息弹窗数据模型
      editDialog: {
        title: ['新增菜单', '编辑菜单'],
        visible: false,
        status: 0,
        rules: {
          title: [{ required: true, validator: emptyChecker, message: '菜单名称不能为空', trigger: 'blur' }],
          name: [{ required: true, validator: emptyChecker, message: '路由名称不能为空', trigger: 'blur' }],
          icon: [{ required: true, validator: emptyChecker, message: '前段图标不能为空', trigger: 'blur' }],
          hidden: [{ required: true, validator: emptyChecker, message: '是否显示不能为空', trigger: 'blur' }]
        }
      }
    }
  },
  mounted() {
    // 获取列表
    this.getList()
  },
  methods: {

    // 列表查询方法
    getList() {
      getAllMenusTree().then((res) => {
        this.allMenuList = [{ label: '无上级菜单', value: 0 }]
        this.handleTreeData(res)
        this.tableAbout.tableData = res
      })
    },

    handleTreeData(layerTreeNodes) {
      layerTreeNodes.forEach(item => {
        let selectItem = { label: item.title, value: item.menuId }
        this.allMenuList.push(selectItem)
        if (item.children && item.children.length > 0) {
          this.handleTreeData(item.children)
        }
      })
    },

    // 保存用户信息方法
    saveMenuInfo() {
      this.$refs['menuInfoForm'].validate((valid) => {
        if (valid) {
          const saveFunc = this.editDialog.status == 0 ? addSourceCatagory : updateSourceCatagory
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
    getAddCategoryModel() {
      this.editDataModel = {
        resourceCategoryId: '',
        name: '',
        sort: 0
      }
    },

    // 新增按钮点击方法
    handleCreate() {
      this.editDialog.status = 0
      this.getAddCategoryModel()
      this.editDialog.visible = true
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      this.editDialog.status = 1
      this.editDataModel = row
      this.editDialog.visible = true
    },
    // 行删除按钮处理
    handleDelete(row) {
      const confirmMes = '是否确认删除该资源分类？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSourceCatagory(qs.stringify({ id: row.resourceCategoryId })).then(() => {
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
<style scoped>
.table-container {
  height: calc(100% - 41px);
}
</style>

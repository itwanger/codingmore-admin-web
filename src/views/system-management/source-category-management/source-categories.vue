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
      <el-table ref="multipleTable" height="calc(100% - 10px)" :key="tableAbout.tableKey" :data="tableAbout.tableData" border fit highlight-current-row class="normal-table">
        <el-table-column label="编号" prop="resourceCategoryId" width="80px" align="center" />
        <el-table-column label="名称" prop="name" />
        <el-table-column label="添加时间" prop="createTime" align="center" />
        <el-table-column label="排序号" prop="sort" align="center" />
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

    <el-dialog :title="editDialog.title[editDialog.status]" width="400px" :visible.sync="editDialog.visible">
      <el-form ref="editInfoForm" :model="editDataModel" :rules="editDialog.rules" label-position="right" label-width="60px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="editDataModel.name" autocomplete="off" maxlength="20" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input v-model="editDataModel.sort" autocomplete="off" maxlength="20" placeholder="请输入分类排序号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveCategoryInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSourceCategoryList, addSourceCatagory, updateSourceCatagory, deleteSourceCatagory } from '@/api/source-categories'
import { emptyChecker, emptyOrIntegerChecker } from '@/utils/validate'
import qs from 'qs'

export default {
  name: 'SourceCategoriesManagement',
  data() {
    return {
      // 文章列表相关属性
      tableAbout: {
        tableKey: 0,
        tableData: [],
        selectedRowList: [] // 被选中行集合
      },

      // 页面用来编辑的数据模型
      editDataModel: {
        resourceCategoryId: '',
        name: '',
        sort: 0
      },

      // 编辑用户信息弹窗数据模型
      editDialog: {
        title: ['新增分类', '编辑分类'],
        visible: false,
        status: 0,
        rules: {
          name: [{ required: true, validator: emptyChecker, message: '分类名称不能为空', trigger: 'blur' }],
          sort: [{ required: false, validator: emptyOrIntegerChecker, message: '排序号必须是整数', trigger: 'blur' }]
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
      getSourceCategoryList().then((res) => {
        this.tableAbout.tableData = res
      })
    },

    // 保存用户信息方法
    saveCategoryInfo() {
      this.$refs['editInfoForm'].validate((valid) => {
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
      this.getAddCategoryModel()
      this.openEditDialog(0)
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      this.editDataModel = row
      this.openEditDialog(1)
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

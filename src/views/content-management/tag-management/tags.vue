<template>
  <div class="app-container">
    <div class="flex-row-ver-center">
      <div class="flex-auto-item">
        <el-input v-model="tableAbout.listQuery.tagName" placeholder="请输入标签名称"></el-input>
      </div>
      <div class="flex-fixed-item">
        <el-button class="filter-item" style="margin-left:14px;" type="primary" icon="el-icon-search" @click="search">
          搜索
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          新增
        </el-button>
      </div>
    </div>
    <div class="table-container">
      <el-table ref="multipleTable" height="calc(100% - 10px)" :key="tableAbout.tableKey" :data="tableAbout.tableData" border fit highlight-current-row class="normal-table">
        <el-table-column label="编号" prop="postTagId" width="80px" align="center" />
        <el-table-column label="标签名称" prop="description" />
        <el-table-column label="操作" align="center" width="160px">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">
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
    <!-- 编辑详情对话框 -->
    <el-dialog :title="editDialog.title[editDialog.status]" width="500px" :visible.sync="editDialog.visible">
      <el-form ref="editInfoForm" :model="editDataModel" :rules="editDialog.rules" label-position="right" label-width="80px">
        <el-form-item label="标签名称" prop="description">
          <el-input v-model="editDataModel.description" autocomplete="off" maxlength="20" placeholder="标签名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveTagInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getTagList, deleteTag, addTag, updateTag } from '@/api/tags'
import { emptyChecker } from '@/utils/validate'
import qs from 'qs'

export default {
  name: 'TagManagement',
  data() {
    return {
      // 文章列表相关属性
      tableAbout: {
        listQuery: {
          page: 1,
          pageSize: 15,
          total: 0,
          tagName: ''
        },
        tableKey: 0,
        tableData: []
      },

      // 页面用来编辑的数据模型
      editDataModel: {
        postTagId: null,
        description: ''
      },

      // 编辑用户信息弹窗数据模型
      editDialog: {
        title: ['新增标签', '编辑标签'],
        visible: false,
        status: 0,
        rules: {
          description: [{ required: true, validator: emptyChecker, message: '标签名称不能为空', trigger: 'blur' }]
        }
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
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
      getTagList(this.tableAbout.listQuery).then((res) => {
        this.tableAbout.tableData = res.items
        this.tableAbout.listQuery.total = res.total
      })
    },
    // 保存编辑信息方法
    saveTagInfo() {
      this.$refs['editInfoForm'].validate((valid) => {
        if (valid) {
          const saveFunc = this.editDialog.status == 0 ? addTag : updateTag
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
        postTagId: null,
        description: ''
      }
    },

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
      const confirmMes = '是否确认删除该标签？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteTag({ postTagId: row.postTagId }).then(() => {
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

<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="title"  :name="params.name" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        class="mt-3"
        :form="form.fc">
        <a-form-item :label="$t('common.text00076')" v-bind="formItemLayout">
          <a-radio-group  v-decorator="decorators.disable_delete">
            <a-radio :value="true">{{$t('status.enabled.true')}}</a-radio>
            <a-radio :value="false">{{$t('status.enabled.false')}}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ChangeDisableDelete',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const isAllNotDisable = this.params.data.every((item) => { return !item.disable_delete })
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, { onFieldsChange: this.onFieldsChange }),
      },
      decorators: {
        disable_delete: [
          'disable_delete',
          {
            initialValue: !isAllNotDisable,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 21 },
        labelCol: { span: 3 },
      },
    }
  },
  computed: {
    title () {
      return this.params.title || this.$t('common.text00077')
    },
  },
  created () {},
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const isDelete = this.form.fc.getFieldValue('disable_delete')
        if (this.params.data.length === 1) {
          this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data: {
                disable_delete: isDelete,
                protected: isDelete,
              },
            },
          })
        } else {
          const ids = this.params.data.map(({ id }) => id)
          await this.params.onManager('batchUpdate', {
            id: ids,
            managerArgs: {
              data: {
                disable_delete: isDelete,
                protected: isDelete,
              },
            },
          })
        }
        this.cancelDialog()
        this.$message.success(this.$t('common.success'))
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

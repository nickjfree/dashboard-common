<template>
  <a-form
    :form="form"
    :style="{ width: `${width}px` }"
    @submit="handleSubmit">
    <a-form-item :label="label" v-bind="formLayout">
      <a-input class="w-100" v-decorator="decorators.input" :placeholder="placeholder" allowClear />
    </a-form-item>
    <div class="text-right">
      <a-button type="primary" html-type="submit">{{$t('common.ok')}}</a-button>
      <a-button class="ml-3" @click="cancel">{{$t('common.cancel')}}</a-button>
    </div>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import i18n from '@/locales'

export default {
  name: 'EditForm',
  props: {
    width: {
      type: Number,
      default: 400,
    },
    formLayout: {
      type: Object,
      default: () => ({
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      }),
    },
    label: {
      type: String,
      default: i18n.t('common.name'),
    },
    defaultValue: {
      type: String,
    },
    formRules: {
      type: Array,
    },
  },
  data () {
    return {
      form: this.$form.createForm(this),
      decorators: {
        input: [
          'input',
          {
            initialValue: this.defaultValue,
            validateFirst: true,
            rules: this.formRules || [
              { required: true, message: `${this.$t('common.placeholder')}${this.label}` },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    placeholder () {
      if (this.label) return `${this.$t('common.placeholder')}${this.label}`
      return this.$t('common.placeholder')
    },
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          const trimValue = R.map(value => {
            if (R.is(String, value)) {
              return value.trim()
            }
            return value
          }, values)
          this.$emit('submit', trimValue)
        }
      })
    },
  },
}
</script>

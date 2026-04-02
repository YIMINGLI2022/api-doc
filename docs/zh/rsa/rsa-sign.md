---
title: RSA签名
permalink: /rsa/rsa-sign/
---
# **RSA签名**

::: tabs
@tab 加签

<div class="box">
<div class="title">加签</div>
<div class="hint-container tip" style="margin: 20px 20px 0;">
<p class="hint-container-title">提示</p>
<ul>
  <li>1.注意请求body字段顺序，有没有格式化等都会影响加签结果，所以再发送http请求的时候要拿原始body进行加签，不要先处理请求body再加签，否则可能导致序列化到http body中报文发生变化</li>
  <li>2.如果加签有错误确认自己私钥填写是否有问题</li>
</ul>
</div>
 <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules"  :size="formSize" label-width="auto" status-icon style="padding: 30px 15px;">
    <el-form-item label="商户私钥:" prop="merchantPrivateKey">
         <el-input v-model="ruleForm.merchantPrivateKey" :rows="15" type="textarea" />
    </el-form-item>
    <el-form-item label="请求报文:" prop="requestMessage">
        <el-input v-model="ruleForm.requestMessage" :rows="8" type="textarea" />
    </el-form-item>
     <div style="position: relative;" >
      <el-form-item label="加签结果:" prop="endorsementResults">
        <el-input v-model="ruleForm.endorsementResults" :rows="8" type="textarea" id="endorsementResultsId" />
      </el-form-item>
      <div style="position: absolute;right: 0%;top: 0%;color: #118eea;" v-if="ruleForm.endorsementResults">
        <el-button type="primary" :icon="CopyDocument" @click="handCopy('endorsementResults')">复制</el-button>
      </div>
    </div>
    <el-form-item>
      <div style="margin: auto"><el-button type="primary" @click="Signature(ruleFormRef)" :loading="isLoading" style={{ margin-top: "20px" }} >加 签</el-button></div>
    </el-form-item>
 </el-form>
 </div>



@tab 验签

<div class="box">
<div class="title">验签</div>
<div class="hint-container tip" style="margin: 20px 20px 0;">
<p class="hint-container-title">提示</p>
<ul>
  <li>1.同加签一致也需要注意获取原始http报文进行验签</li>
</ul>
</div>
 <el-form ref="ruleFormVerifyRef" :model="ruleFormVerify" :rules="rulesVerify"  :size="formSize" label-width="auto" status-icon style="padding: 30px 15px;">
    <el-form-item label="商户公钥:" prop="merchantPublicKey">
         <el-input v-model="ruleFormVerify.merchantPublicKey" :rows="15" type="textarea" />
    </el-form-item>
    <el-form-item label="响应报文:" prop="responseMessage">
        <el-input v-model="ruleFormVerify.responseMessage" :rows="8" type="textarea" />
    </el-form-item>
     <el-form-item label="响应签名:" prop="responseSignature">
        <el-input v-model="ruleFormVerify.responseSignature" :rows="8" type="textarea" />
      </el-form-item>
      <el-form-item label="校验结果:" prop="verificationResults">
        <el-input v-model="ruleFormVerify.verificationResults" :rows="5" type="textarea" />
      </el-form-item>
    <el-form-item>
      <div style="margin: auto"><el-button type="primary" @click="verifySignature(ruleFormVerifyRef)" :loading="isLoadingVerify">验 签</el-button></div>
    </el-form-item>
 </el-form>
</div>

:::

<style>
  .el-form-item__label {
    font-size: 18px;
  }
  .box {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: rgba(0, 0, 0, 0.88);
    font-size: 14px;
    position: relative;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
  }
  .title {
    color: rgba(0, 0, 0, 0.88);
    font-weight: 600;
    font-size: 16px;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 8px 8px 0 0;
    padding: 20px;
  }

</style>
<script setup lang="ts">  
import { ref,reactive } from 'vue'  
import forge from 'node-forge';
import { ElButton,ElInput,ElForm, ElFormItem,ElMessage } from 'element-plus';
import type { ComponentSize, FormInstance, FormRules } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

interface RuleForm {
  merchantPrivateKey: string
  requestMessage: string
  endorsementResults: string
}
const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
   merchantPrivateKey: '',
   requestMessage: '',
   endorsementResults: '',
})
const rules = reactive<FormRules<RuleForm>>({
  merchantPrivateKey: [
    { required: true, message: '请输入商户私钥', trigger: 'blur' },
  ],
  requestMessage: [
    { required: true, message: '请输入请求报文', trigger: 'blur' },
  ],
})


const isLoading = ref(false)
const Signature = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  isLoading.value = true;
  await formEl.validate((valid, fields) => {
    if (valid) {
        const message = ruleForm.requestMessage;
        let key = ruleForm.merchantPrivateKey || '';
           if(key.indexOf('-----BEGIN RSA PRIVATE KEY-----')<0){
               key = '-----BEGIN RSA PRIVATE KEY-----\n' + key + '\n-----END RSA PRIVATE KEY-----'
           }           
        const privateKey = forge.pki.privateKeyFromPem(key);

        // const privateKey = forge.pki.privateKeyFromPem(ruleForm.merchantPrivateKey);
        const md = forge.md.sha256.create();
        md.update(message);
        const signature = privateKey.sign(md);
        const signaturePem = forge.util.encode64(signature);
        ruleForm.endorsementResults = signaturePem
        isLoading.value = false;
    } else {
      console.log('error submit!', fields)
    }
  })
}

interface RuleFormVerify {
  merchantPublicKey: string
  responseMessage: string
  responseSignature: string
}
const ruleFormVerifyRef = ref<FormInstance>()
const ruleFormVerify = reactive<RuleFormVerify>({
   merchantPublicKey: '',
   responseMessage: '',
   responseSignature: '',
   verificationResults: '',
})
const rulesVerify = reactive<FormRules<RuleFormVerify>>({
  merchantPublicKey: [
    { required: true, message: '请输入商户公钥', trigger: 'blur' },
  ],
  responseMessage: [
    { required: true, message: '请输入响应报文', trigger: 'blur' },
  ],
  responseSignature: [
    { required: true, message: '请输入响应签名', trigger: 'blur' },
  ]
})
const isLoadingVerify = ref(false)
const verifySignature = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  isLoadingVerify.value = true;
  await formEl.validate((valid, fields) => {
    if (valid) {
        const message = ruleFormVerify.responseMessage;
          let key = ruleFormVerify.merchantPublicKey || '';
           if(key.indexOf('-----BEGIN PUBLIC KEY-----')<0){
               key = '-----BEGIN PUBLIC KEY-----\n' + key + '\n-----END PUBLIC KEY-----'
           } 
        const publicKey = forge.pki.publicKeyFromPem(key);
        // const publicKey = forge.pki.publicKeyFromPem(ruleFormVerify.merchantPublicKey);
        const md = forge.md.sha256.create();  
        md.update(message);
        const signatureBytes = forge.util.decode64(ruleFormVerify.responseSignature);  
        const isVerified = publicKey.verify(md.digest().bytes(), signatureBytes);  
        ruleFormVerify.verificationResults = isVerified ? '校验成功': '校验失败'
         isLoadingVerify.value = false;
    } else {
      console.log('error submit!', fields)
    }
  })
}

const handCopy = (key) => {
   if(!key){
          return
        }
        // // 使用Clipboard API复制文本到剪贴板中
        if (navigator.clipboard && window.isSecureContext){
            console.log('1.copy');
            //Navigator API 的安全策略禁用了非安全域的 navigator.clipboard 对象，API 仅支持通过 HTTPS 提供的页面。
            // const copy_text = ruleForm.endorsementResults;//拿到想要复制的值
            const copy_text = String(ruleForm.endorsementResults).replace(/[\s\p{Z}\r\n]+/gu, '')
            navigator.clipboard.writeText(copy_text).then(() => {
               ElMessage({
                    type: 'success',
                    message: '复制成功'
                })
            }).catch((err)=>{
                 ElMessage({
                    type: 'error',
                    message: '复制异常，请尝试其他方式复制内容'
                })
            })

        }else{
            console.log('2.copy');
            window.getSelection().removeAllRanges()
            const text = String(ruleForm.endorsementResults).replace(/[\s\p{Z}\r\n]+/gu, '')
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            // const questionToCopy = document.querySelector('#endorsementResultsId')
            // const range = document.createRange()
            // range.selectNode(questionToCopy)
            // window.getSelection().addRange(range)
            try {
                const successful = document.execCommand('copy')
                if (successful) {
                   ElMessage({
                    type: 'success',
                    message: '复制成功'
                })
                }
            } catch (error) {
                 ElMessage({
                    type: 'error',
                    message: '复制异常，请尝试其他方式复制内容'
                })
            }finally{
                document.body.removeChild(textarea);
                window.getSelection().removeAllRanges()
            }

        }
}
</script>
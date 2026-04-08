---
title: RSA Signature
permalink: /en/rsa/rsa_sign/
---

# **RSA Signature**

::: tabs
@tab Signing

<div class="box">
<div class="title">Signing</div>
<div class="hint-container tip" style="margin: 20px 20px 0;">
<p class="hint-container-title">Tips</p>
<ul>
  <li>1. Be careful with the order of fields in the request body. Any formatting issues may affect the signing result, so when sending the HTTP request, use the raw body for signing. Do not process the request body before signing, as it may cause changes in the serialized HTTP body.</li>
  <li>2. If there is an error during signing, check if the private key is entered correctly.</li>
</ul>
</div>
 <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules"  :size="formSize" label-width="auto" status-icon style="padding: 30px 15px;">
    <el-form-item label="Merchant Private Key:" prop="merchantPrivateKey">
         <el-input v-model="ruleForm.merchantPrivateKey" :rows="15" type="textarea" />
    </el-form-item>
    <el-form-item label="Request Message:" prop="requestMessage">
        <el-input v-model="ruleForm.requestMessage" :rows="8" type="textarea" />
    </el-form-item>
     <div style="position: relative;" >
      <el-form-item label="Signing Result:" prop="endorsementResults">
        <el-input v-model="ruleForm.endorsementResults" :rows="8" type="textarea" id="endorsementResultsId" />
      </el-form-item>
      <div style="position: absolute;right: 0%;top: 0%;color: #118eea;" v-if="ruleForm.endorsementResults">
        <el-button type="primary" :icon="CopyDocument" @click="handCopy('endorsementResults')">Copy</el-button>
      </div>
    </div>
    <el-form-item>
      <div style="margin: auto"><el-button type="primary" @click="Signature(ruleFormRef)" :loading="isLoading" style={{ margin-top: "20px" }} >Sign</el-button></div>
    </el-form-item>
 </el-form>
 </div>

@tab Verification

<div class="box">
<div class="title">Verification</div>
<div class="hint-container tip" style="margin: 20px 20px 0;">
<p class="hint-container-title">Tips</p>
<ul>
  <li>1. Just like signing, you must use the raw HTTP message for verification.</li>
</ul>
</div>
 <el-form ref="ruleFormVerifyRef" :model="ruleFormVerify" :rules="rulesVerify"  :size="formSize" label-width="auto" status-icon style="padding: 30px 15px;">
    <el-form-item label="Merchant Public Key:" prop="merchantPublicKey">
         <el-input v-model="ruleFormVerify.merchantPublicKey" :rows="15" type="textarea" />
    </el-form-item>
    <el-form-item label="Response Message:" prop="responseMessage">
        <el-input v-model="ruleFormVerify.responseMessage" :rows="8" type="textarea" />
    </el-form-item>
     <el-form-item label="Response Signature:" prop="responseSignature">
        <el-input v-model="ruleFormVerify.responseSignature" :rows="8" type="textarea" />
      </el-form-item>
      <el-form-item label="Verification Result:" prop="verificationResults">
        <el-input v-model="ruleFormVerify.verificationResults" :rows="5" type="textarea" />
      </el-form-item>
    <el-form-item>
      <div style="margin: auto"><el-button type="primary" @click="verifySignature(ruleFormVerifyRef)" :loading="isLoadingVerify">Verify</el-button></div>
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
    { required: true, message: 'Please enter the merchant private key', trigger: 'blur' },
  ],
  requestMessage: [
    { required: true, message: 'Please enter the request message', trigger: 'blur' },
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
    { required: true, message: 'Please enter the merchant public key', trigger: 'blur' },
  ],
  responseMessage: [
    { required: true, message: 'Please enter the response message', trigger: 'blur' },
  ],
  responseSignature: [
    { required: true, message: 'Please enter the response signature', trigger: 'blur' },
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
        ruleFormVerify.verificationResults = isVerified ? 'Verification successful' : 'Verification failed'
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
        // // Use Clipboard API to copy text to the clipboard
        if (navigator.clipboard && window.isSecureContext){
            console.log('1.copy');
            // Navigator API's security policy disables the clipboard object in non-secure domains, the API only works on HTTPS pages.
            // const copy_text = ruleForm.endorsementResults; // Get the value to copy
            const copy_text = String(ruleForm.endorsementResults).replace(/[\s\p{Z}\r\n]+/gu, '')
            navigator.clipboard.writeText(copy_text).then(() => {
               ElMessage({
                    type: 'success',
                    message: 'Copy successful'
                })
            }).catch((err) => {
                 ElMessage({
                    type: 'error',
                    message: 'Copy error, please try other ways to copy the content'
                })
            })

        } else {
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
                    message: 'Copy successful'
                })
                }
            } catch (error) {
                 ElMessage({
                    type: 'error',
                    message: 'Copy error, please try other ways to copy the content'
                })
            } finally {
                document.body.removeChild(textarea);
                window.getSelection().removeAllRanges()
            }

        }
}
</script>
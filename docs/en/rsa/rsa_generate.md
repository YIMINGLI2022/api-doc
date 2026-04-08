---
title: RSA Key Generation
permalink: /en/rsa/rsa_generate/
---

# **RSA Key Generation**

::: tip  
- The key pair is generated using JavaScript, so no requests are sent to the server. The generation speed might be slow in the browser, so please be patient.  
- Keep the private key safe, and manually upload the public key to the Haipay server.  
:::

<el-form ref="ruleFormRef" :model="ruleForm" label-width="150px" status-icon>
  <el-row>
    <el-col :span="12">
      <div style="position: relative;">
        <el-form-item label="privateKey:" prop="privateKey" style="">
          <el-input v-model="ruleForm.privateKey" :rows="20" type="textarea" id="privateKeyId" />
        </el-form-item>
        <div style="position: absolute;right: 0%;top: 0%;color: #118eea;" v-if="ruleForm.privateKey">
          <el-button type="primary" :icon="CopyDocument" @click="handCopy('privateKey')">Copy</el-button>
        </div>
      </div>
    </el-col>
    <el-col :span="12">
      <div style="position: relative;">
        <el-form-item label="publicKey:" prop="publicKey">
          <el-input v-model="ruleForm.publicKey" :rows="20" type="textarea" id="publicKeyId" />
        </el-form-item>
        <div style="position: absolute;right: 0%;top: 0%;color: #118eea;" v-if="ruleForm.publicKey">
          <el-button type="primary" :icon="CopyDocument" @click="handCopy('publicKey')">Copy</el-button>
        </div>
      </div>
    </el-col>
  </el-row>
  <el-form-item>
    <div style="margin: auto"><el-button type="primary" @click="Generate()" :loading="isLoading" style={{ padding: "20px" }} >Generate Key Pair</el-button></div>
  </el-form-item>
</el-form>

<style>
 .el-form-item__label {
   font-size: 18px;
 }
 .flex-container {
   display: flex;
   /* Optional: If spacing is needed, you can add the gap property */
   /* gap: 10px; Controls the spacing between components */
}
</style>

<script setup>  
import { ref, reactive } from 'vue';
import forge from 'node-forge';
import { ElButton, ElInput, ElForm, ElFormItem, ElMessage } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

const ruleForm = reactive({
  privateKey: '',
  publicKey: ''
})
const isLoading = ref(false)

const Generate = async () => {
  isLoading.value = true;
  // Generate RSA key pair
  const keys = await forge.pki.rsa.generateKeyPair(2048);
  
  // Get private key in PKCS#8 format without headers
  const privateKey = forge.pki.privateKeyFromPem(forge.pki.privateKeyToPem(keys.privateKey));
  const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey);
  const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
  const privateKeyPem = forge.pki.privateKeyInfoToPem(privateKeyInfo);
  ruleForm.privateKey = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '')
    .trim();
    ruleForm.privateKey = String(ruleForm.privateKey).replace(/[\s\p{Z}\r\n]+/gu, '')

  // Get public key without headers
  const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);
  ruleForm.publicKey = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\n/g, '')
    .trim();

    ruleForm.publicKey = String(ruleForm.publicKey).replace(/[\s\p{Z}\r\n]+/gu, '')

  isLoading.value = false;
}

const handCopy = (key) => {
  let text
  if (key === 'privateKey') {
     text = String(ruleForm.privateKey).replace(/[\s\p{Z}\r\n]+/gu, ''); // Remove spaces and newlines
  } else if (key === 'publicKey') {
     text = String(ruleForm.publicKey).replace(/[\s\p{Z}\r\n]+/gu, ''); // Remove spaces and newlines
  }
  if (!key) {
    return
  }
  // Use Clipboard API to copy the text to the clipboard
  if (navigator.clipboard && window.isSecureContext) {
    console.log('1.copy');
    // The security policy of the Navigator API disables the navigator.clipboard object on non-secure domains. The API is only supported on pages served over HTTPS.
    const copy_text = text; // Get the text to copy
    navigator.clipboard.writeText(copy_text).then(() => {
      ElMessage({
        type: 'success',
        message: 'Copied successfully'
      })
    }).catch((err) => {
      ElMessage({
        type: 'error',
        message: 'Copy error, please try another method'
      })
    })

  } else {
    console.log('2.copy');
    window.getSelection().removeAllRanges()
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
            // window.getSelection().removeAllRanges()
            // const questionToCopy = document.querySelector(`#${key}Id`)
            // const range = document.createRange()
            // range.selectNode(questionToCopy)
            // window.getSelection().addRange(range)
    try {
      const successful = document.execCommand('copy')
      if (successful) {
        ElMessage({
          type: 'success',
          message: 'Copied successfully'
        })
      }
    } catch (error) {
      ElMessage({
        type: 'error',
        message: 'Copy error, please try another method'
      })
    } finally {
      document.body.removeChild(textarea);
      window.getSelection().removeAllRanges()
    }
  }
}
</script>

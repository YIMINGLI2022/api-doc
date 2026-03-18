---
title: RSA密钥生成
permalink: /rsa/rsa-generate/
---
# **RSA密钥生成**  
  
::: tip  
- 使用JavaScript生成，不会向服务器发送任何请求，浏览器生成速度很慢请耐心等待  
- 私钥自己保存，公钥手动上传给haipay服务端即可  
:::  

 <el-form ref="ruleFormRef" :model="ruleForm" label-width="150px"status-icon>
    <el-row>
      <el-col :span="12">
        <div style="position: relative;" >      
          <el-form-item label="privateKey:" prop="privateKey" style="">
            <el-input v-model="ruleForm.privateKey" :rows="20" type="textarea" id="privateKeyId" />
          </el-form-item>
          <div style="position: absolute;right: 0%;top: 0%;color: #118eea;" v-if="ruleForm.privateKey">
            <el-button type="primary" :icon="CopyDocument" @click="handCopy('privateKey')">复制</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div style="position: relative;" >
          <el-form-item label="publicKey:" prop="publicKey">
            <el-input v-model="ruleForm.publicKey" :rows="20" type="textarea" id="publicKeyId" />
          </el-form-item>
          <div style="position: absolute;right: 0%;top: 0%;color: #118eea;" v-if="ruleForm.publicKey">
            <el-button type="primary" :icon="CopyDocument" @click="handCopy('publicKey')">复制</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-form-item>
      <div style="margin: auto"><el-button type="primary" @click="Generate()" :loading="isLoading" style="padding: 20px">Generate Key Pair</el-button></div>
    </el-form-item>
</el-form>

<style>  
 .el-form-item__label {
  font-size: 18px;
 }
 .flex-container {
  display: flex;
  /* 可选: 如果需要间距，可以添加 gap 属性 */
  /* gap: 10px; 用于控制组件间的间距 */
}
</style>



<script setup>  
import { ref, reactive } from 'vue';
import forge from 'node-forge';
import { ElButton,ElInput,ElForm, ElFormItem,ElMessage } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

const ruleForm = reactive({
  privateKey: '',
  publicKey: ''
})
const isLoading = ref(false)

// const  Generate = async () => {
//       isLoading.value = true;
//       // 生成RSA密钥对
//       const keys = await forge.pki.rsa.generateKeyPair(2048);
//       // ruleForm.privateKey = forge.pki.privateKeyToPem(keys.privateKey);
//       // ruleForm.publicKey = forge.pki.publicKeyToPem(keys.publicKey);

//         // 获取生成的私钥
//         // PEM 格式的 RSA 私钥
//         const privateKey = forge.pki.privateKeyFromPem(forge.pki.privateKeyToPem(keys.privateKey));
//         // 将原始的私钥（一般是传统格式）转换为ASN.1格式表示的私钥
//         const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey);
//         // 使用wrapRsaPrivateKey将ASN.1格式的私钥包装进PKCS#8的ASN.1 PrivateKeyInfo结构中
//         const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
//         // 再将PKCS#8的ASN.1 PrivateKeyInfo结构转换为PEM格式的字符串，得到PKCS#8格式的私钥
//         ruleForm.privateKey = forge.pki.privateKeyInfoToPem(privateKeyInfo);
//         // 公钥部分保持原格式转换逻辑不变（一般为X.509格式）
//         ruleForm.publicKey = forge.pki.publicKeyToPem(keys.publicKey);
//       isLoading.value = false;
// }

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
  if(key === 'privateKey') {
     text = String(ruleForm.privateKey).replace(/[\s\p{Z}\r\n]+/gu, ''); // 移除空格和换行
  }else if(key === 'publicKey') {
     text = String(ruleForm.publicKey).replace(/[\s\p{Z}\r\n]+/gu, ''); // 移除空格和换行
  }
   if(!key){
          return
        }
        // // 使用Clipboard API复制文本到剪贴板中
        if (navigator.clipboard && window.isSecureContext){
            console.log('1.copy');
            //Navigator API 的安全策略禁用了非安全域的 navigator.clipboard 对象，API 仅支持通过 HTTPS 提供的页面。
            const copy_text = text;//拿到想要复制的值
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
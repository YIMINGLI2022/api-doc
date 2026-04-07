var SIGN_FIELD = 'sign'

/**
 * 触发组件输入事件
 * @param element
 * @param value
 */
function triggerReactInput(element, value) {
    // 获取原生 setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    ).set;

    // 使用原生 setter 改变值
    nativeInputValueSetter.call(element, value);

    // 触发 input 事件（React 监听这个）
    const inputEvent = new Event('input', {bubbles: true});
    element.dispatchEvent(inputEvent);

    // 额外触发 change 事件
    const changeEvent = new Event('change', {bubbles: true});
    element.dispatchEvent(changeEvent);
}

/**
 * 获取所有字段和输入框的映射关系
 * @returns {Map<string, HTMLInputElement>}
 */
function getFields2InputsMap() {
    const fieldInputs = document.querySelectorAll('[id="api-playground-input"]');
    const fields2InputsMap = new Map();
    for (let i = 0; i < fieldInputs.length; i++) {
        let fieldName = fieldInputs[i].getAttribute('aria-label').substring(2)
        fields2InputsMap.set(fieldName, fieldInputs[i]);
    }
    return fields2InputsMap;
}

function mapToObject(fields2InputsMap) {
    const result = {};

    fields2InputsMap.forEach((inputElement, fieldName) => {
        if (inputElement) {
            result[fieldName] = inputElement.value;
        }
    });

    return result;
}

/**
 * 构建签名字符串
 * @param 需要签名的对象
 * @param {string} secretKey - 密钥
 * @returns {string} 待签名字符串
 */
function getSign(fields2InputsMap, secretKey) {
    const obj = mapToObject(fields2InputsMap);
    // 获取所有键并排序
    const keys = Object.keys(obj).sort();

    // 构造签名键值对
    const parts = [];
    for (const key of keys) {
        const val = obj[key];
        // 跳过空值、null、undefined，以及 sign_type 和 sign 字段
        if (val !== "" && val !== null && val !== undefined &&
            key !== "sign_type" && key !== "sign") {
            parts.push(`${key}=${val}`);
        }
    }

    // 添加 key 参数
    parts.push(`key=${secretKey}`);

    return parts.join("&");
}

/**
 * RSA 签名（对应 Java 的 buildRSASignByPrivateKey）
 * @param {string} data - 待签名字符串（getSign 的输出）
 * @param {string} privateKeyPem - Base64 编码的 PKCS#8 私钥
 * @returns {string} Base64 编码的签名
 */
function buildRSASignByPrivateKey(data, privateKeyPem) {
    try {
        // 将私钥转换为 PEM 格式（如果还不是）
        let pemKey = privateKeyPem;

        // 如果传入的是纯 Base64（没有 PEM 头尾），则添加 PEM 格式
        if (!pemKey.includes("-----BEGIN PRIVATE KEY-----")) {
            pemKey = `-----BEGIN PRIVATE KEY-----\n${pemKey}\n-----END PRIVATE KEY-----`;
        }

        // 使用 KEYUTIL 解析私钥
        const privateKey = KEYUTIL.getKey(pemKey);

        // 创建签名对象
        const sig = new KJUR.crypto.Signature({alg: "SHA256withRSA"});

        // 初始化签名（传入私钥对象）
        sig.init(privateKey);

        // 更新待签名数据
        sig.updateString(data);

        // 生成签名（返回 Base64 字符串）
        // 获取十六进制签名结果
        const hexSignature = sig.sign();

        // 将十六进制转换为 Base64
        return btoa(
            hexSignature.match(/.{1,2}/g)
                .map(byte => String.fromCharCode(parseInt(byte, 16)))
                .join('')
        );
    } catch (error) {
        throw new Error(`签名字符串[${data}]时遇到异常: ${error.message}`);
    }
}

/**
 * 密钥是否提供了
 * @returns {boolean}
 */
function keyProvided(secretKeyComp, privateKeyComp) {
    if (!secretKeyComp || !privateKeyComp) {
        return false
    }
    let secretKey = secretKeyComp.value
    let privateKey = privateKeyComp.value
    return !(!secretKey || !privateKey);
}

/**
 * 是否是目标输入框
 * 不包括签名字段
 * @returns {boolean}
 */
function isTargetInput(e) {
    const targetElement = e.target;
    // 这里假设你要监听的输入框有特定的类名，如果没有可以省略 .matches 判断
    if (!targetElement.matches('input')) {
        return false
    }
    let fieldName = targetElement.getAttribute('aria-label')
    if (!fieldName) {
        return false
    }
    if (!fieldName.includes("输入")) {
        return false
    }
    return !fieldName.includes(SIGN_FIELD);
}

document.body.addEventListener('input', (e) => {
    let secretKeyComp = document.getElementById("secret-key")
    let privateKeyComp = document.getElementById("private-key")
    if (!keyProvided(secretKeyComp, privateKeyComp)) {
        return
    }
    if (!isTargetInput(e)) {
        return
    }
    const fields2components = getFields2InputsMap()
    if (fields2components.size === 0) {
        return
    }
    let signRaw = getSign(fields2components, secretKeyComp.value);
    let sign = buildRSASignByPrivateKey(signRaw, privateKeyComp.value)
    triggerReactInput(fields2components.get(SIGN_FIELD), sign)
});



const AK = "Vu7wSzNFhyn2JxdvZ4VExCslx7lWNQUqsyC6XqRV";
const SK = "5IJxAJr8d4-wLAuSVhm8f3W6zL4hJfk_ZVAtSrbH";
const qiniuurl = "http://qiniu.yiwangxuan.com/";
const qiniuupurl = "https://up-z1.qbox.me";
const putPolicy = '{"scope":"pxquan","deadline":2480414056}';
// const putPolicy = '{"scope":"cloudy","deadline":2480414056}';

// const COSAK = 'AKIDaM7nIrpNKEAvUqS84rUDoDQQODqK4IrE'
// const COSSK = 'I5jAPEtMekgZVIzYv660iEZifZHn8HE1'
// const COSAPPIDE = '1251112994'
// const BUCKET = 'pxq1'
// const RANDOMNUM = '123456'


module.exports = {
    base64encode: base64encode,
    genUpToken() {
        var accessKey = AK;
        var secretKey = SK;
        var put_policy = putPolicy;
        //SETP 2
        // var put_policy = JSON.stringify(putPolicy);

        console && console.log("put_policy = ", put_policy);

        //SETP 3
        //         var encoded = base64encode(utf16to8(put_policy));
        var encoded = base64encode(put_policy);
        console && console.log("encoded = ", encoded);
        //SETP 4
        // var hash = CryptoJS.HmacSHA1(encoded, secretKey);
        // var encoded_signed = hash.toString(CryptoJS.enc.Base64);
        // var hash = b64_hmac_sha1(secretKey, encoded);
        var hash = b64_hmac_sha1(secretKey, encoded);
        // var hash='57a649d74c0f2a8931956551f3d5d63a30c43c2d';
        console && console.log("hash=", hash)
        // var encoded_signed = base64encode(hash);
        var encoded_signed = hash;
        console && console.log("encoded_signed=", encoded_signed)

        //SETP 5
        var upload_token = accessKey + ":" + safe64(encoded_signed) + ":" + encoded;
        console && console.log("upload_token=", upload_token)
        return upload_token;
    },


    //目前都是公共读权限，不需要下载token
    genDownloadTokenUrl(downloadUrl) {
        var accessKey = AK;
        var secretKey = SK;
        var TS = '2480414056';
        TS = Date.parse(new Date()) / 1000 + 3600;

        // 1.构造下载 URL：
        // DownloadUrl = 'http://78re52.com1.z0.glb.clouddn.com/resource/flower.jpg'
        // oi2hoq4f7.qnssl.com 
        downloadUrl = 'https://' + downloadUrl.split('//')[1];

        // 2.为下载 URL 加上过期时间 e 参数，Unix时间戳：
        // DownloadUrl = 'http://78re52.com1.z0.glb.clouddn.com/resource/flower.jpg?e=1451491200'
        downloadUrl = downloadUrl + '?e=' + TS;

        // 3.对上一步得到的 URL 字符串计算HMAC-SHA1签名（假设SecretKey是 MY_SECRET_KEY），并对结果做URL安全的Base64编码：
        // Sign = hmac_sha1(DownloadUrl, 'MY_SECRET_KEY')
        // EncodedSign = urlsafe_base64_encode(Sign)
        var basesign = b64_hmac_sha1(secretKey, downloadUrl);
        var safeSign = safe64(basesign);

        // 4.将AccessKey（假设是 MY_ACCESS_KEY）与上一步计算得到的结果用英文符号 : 连接起来：
        // Token = 'MY_ACCESS_KEY:yN9WtB0lQheegAwva64yBuH3ZgU='
        var token = accessKey + ':' + safeSign;

        // 5.将上述 Token 拼接到含过期时间参数 e 的 DownloadUrl 之后，作为最后的下载 URL：
        // RealDownloadUrl = 'http://78re52.com1.z0.glb.clouddn.com/resource/flower.jpg?e=1451491200&token=MY_ACCESS_KEY:yN9WtB0lQheegAwva64yBuH3ZgU='
        // downloadUrl = 'https://' + downloadUrl.split('//')[1];
        var realDownloadUrl = downloadUrl + '&token=' + token;
        return realDownloadUrl;
    },


    genHttpsDownUrl(downloadUrl) {


        // 1.构造下载 URL：
        // DownloadUrl = 'http://78re52.com1.z0.glb.clouddn.com/resource/flower.jpg'
        // oi2hoq4f7.qnssl.com 
        console.log(downloadUrl);
        downloadUrl = 'https://' + downloadUrl.split('//')[1];
        console.log(downloadUrl);

        return downloadUrl;
    },
    getImageUrl(pickey) {
        return qiniuurl + pickey;
    },
    getUploadUrl() {
        return qiniuupurl;
    },


    // getCOSToken() {

    //     var appid = COSAPPIDE;
    //     var bucket = BUCKET;
    //     var secret_id = COSAK;
    //     var secret_key = COSSKT;
    //     var expired = Date.parse(new Date()) / 1000 + 3600;;
    //     var current = Date.parse(new Date());
    //     var rdm = Math.round(Math.random() * 1000000);;
    //     var multi_effect_signature = 'a=' + appid + '&b=' + bucket + '&k=' + secret_id + '&e=' + expired + '&t=' + current + '&r=' + rdm + '&f=';
    //     multi_effect_signature = base64encode(b64_hmac_sha1(multi_effect_signature, secret_key)+$multi_effect_signature);

    //     return multi_effect_signature;
    // }

};


/* utf.js - UTF-8 <=> UTF-16 convertion
 *
 * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0
 * LastModified: Dec 25 1999
 * This library is free. You can redistribute it and/or modify it.
 */
/*
 * Interfaces:
 * utf8 = utf16to8(utf16);
 * utf16 = utf8to16(utf8);
 */
// var CryptoJS = require('../../utils/components/core.js');
// var CryptoJS = require('../../utils/rollups/hmac-sha256.js');
function utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}

function utf8to16(str) {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = str.length;
    i = 0;
    while (i < len) {
        c = str.charCodeAt(i++);
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                // 110x xxxx 10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx 10xx xxxx 10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;
        }
    }
    return out;
}

/*
 * Interfaces:
 * b64 = base64encode(data);
 * data = base64decode(b64);
 */
var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

function base64decode(str) {
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        /* c1 */
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1) break;
        /* c2 */
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1) break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61) return out;
            c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1) break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61) return out;
            c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1) break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}
var safe64 = function (base64) {
    base64 = base64.replace(/\+/g, "-");
    base64 = base64.replace(/\//g, "_");
    return base64;
};


/**
* Computes a HMAC-SHA1 code.
*
* @param {string} k Secret key.
* @param {string} d Data to be hashed.
* @return {string} The hashed string.
*/
function b64_hmac_sha1(k, d, _p, _z) {
    // heavily optimized and compressed version of http://pajhome.org.uk/crypt/md5/sha1.js
    // _p = b64pad, _z = character size; not used here but I left them available just in case
    if (!_p) { _p = '='; } if (!_z) { _z = 8; } function _f(t, b, c, d) { if (t < 20) { return (b & c) | ((~b) & d); } if (t < 40) { return b ^ c ^ d; } if (t < 60) { return (b & c) | (b & d) | (c & d); } return b ^ c ^ d; } function _k(t) { return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514; } function _s(x, y) { var l = (x & 0xFFFF) + (y & 0xFFFF), m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); } function _r(n, c) { return (n << c) | (n >>> (32 - c)); } function _c(x, l) { x[l >> 5] |= 0x80 << (24 - l % 32); x[((l + 64 >> 9) << 4) + 15] = l; var w = [80], a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776; for (var i = 0; i < x.length; i += 16) { var o = a, p = b, q = c, r = d, s = e; for (var j = 0; j < 80; j++) { if (j < 16) { w[j] = x[i + j]; } else { w[j] = _r(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1); } var t = _s(_s(_r(a, 5), _f(j, b, c, d)), _s(_s(e, w[j]), _k(j))); e = d; d = c; c = _r(b, 30); b = a; a = t; } a = _s(a, o); b = _s(b, p); c = _s(c, q); d = _s(d, r); e = _s(e, s); } return [a, b, c, d, e]; } function _b(s) { var b = [], m = (1 << _z) - 1; for (var i = 0; i < s.length * _z; i += _z) { b[i >> 5] |= (s.charCodeAt(i / 8) & m) << (32 - _z - i % 32); } return b; } function _h(k, d) { var b = _b(k); if (b.length > 16) { b = _c(b, k.length * _z); } var p = [16], o = [16]; for (var i = 0; i < 16; i++) { p[i] = b[i] ^ 0x36363636; o[i] = b[i] ^ 0x5C5C5C5C; } var h = _c(p.concat(_b(d)), 512 + d.length * _z); return _c(o.concat(h), 512 + 160); } function _n(b) { var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s = ''; for (var i = 0; i < b.length * 4; i += 3) { var r = (((b[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((b[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((b[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF); for (var j = 0; j < 4; j++) { if (i * 8 + j * 6 > b.length * 32) { s += _p; } else { s += t.charAt((r >> 6 * (3 - j)) & 0x3F); } } } return s; } function _x(k, d) { return _n(_h(k, d)); } return _x(k, d);
}



/////////////// char function end //////////////////////////////////////////////

var { JSDOM } = require("@lwjjike/xbsdom");

const logger = {
    __log: console.log,
    info: function () {
        try {
            xbs.setGlog(false);
            return this.__log.apply(null, arguments);
        } finally {
            xbs.setGlog(true);
        }
    }
}

xbs.setMainJSDOM(new JSDOM("", {
    url: "https://www.jd.com"
}))

xbs.setWINMethod("WebGLRenderingContext", "getSupportedExtensions", function () {
    return ["ANGLE_instanced_arrays","EXT_blend_minmax","EXT_clip_control","EXT_color_buffer_half_float","EXT_depth_clamp","EXT_disjoint_timer_query","EXT_float_blend","EXT_frag_depth","EXT_polygon_offset_clamp","EXT_shader_texture_lod","EXT_texture_compression_bptc","EXT_texture_compression_rgtc","EXT_texture_filter_anisotropic","EXT_texture_mirror_clamp_to_edge","EXT_sRGB","KHR_parallel_shader_compile","OES_element_index_uint","OES_fbo_render_mipmap","OES_standard_derivatives","OES_texture_float","OES_texture_float_linear","OES_texture_half_float","OES_texture_half_float_linear","OES_vertex_array_object","WEBGL_blend_func_extended","WEBGL_color_buffer_float","WEBGL_compressed_texture_s3tc","WEBGL_compressed_texture_s3tc_srgb","WEBGL_debug_renderer_info","WEBGL_debug_shaders","WEBGL_depth_texture","WEBGL_draw_buffers","WEBGL_lose_context","WEBGL_multi_draw","WEBGL_polygon_mode"];
})

var storage = {
    WQ_dy1_vk: "{\"5.3\":{\"73806\":{\"e\":31536000,\"v\":\"5n5nypp5yn57avm0\",\"t\":1776178523031},\"b5216\":{\"e\":31536000,\"v\":\"jpe55ieijmvjeiz2\",\"t\":1776178523249},\"fb5df\":{\"e\":31536000,\"v\":\"inevb5enne2ze258\",\"t\":1776178524597}}}",
    JDst_behavior_flag: "[{\"t\":1776177616542,\"e\":3600,\"v\":\"Fs\"}]",
    WQ_gather_cv1: "{\"v\":\"c7def5db117f6139d5ee8f43fe9d5cc3\",\"t\":1776177422324,\"e\":31536000}",
}
for (let key in storage) {
    window.localStorage.setItem(key, storage[key]);
}
document.cookie = '__jdv=76161171|direct|-|none|-|1776177420429; __jdu=17761774204291754555989; 3AB9D23F7A4B3CSS=jdd03TQI72RUAHTVZCDCRF62E5JTGYTJCOISYLHVLCWXIE2JVW3Z3LER7I73AOYUIJLEREDGDP2ILIVCGWXEXURPACYKLPUAAAAM5RRWJR6YAAAAADSEK6ACT57XWPEX; 3AB9D23F7A4B3C9B=TQI72RUAHTVZCDCRF62E5JTGYTJCOISYLHVLCWXIE2JVW3Z3LER7I73AOYUIJLEREDGDP2ILIVCGWXEXURPACYKLPU; o2State={%22webp%22:true%2C%22avif%22:true}; shshshfpa=85b4cb3c-8a37-47ac-5bd0-08b743a9634b-1776177421; shshshfpx=85b4cb3c-8a37-47ac-5bd0-08b743a9634b-1776177421; areaId=18; ipLoc-djd=18-1482-0-0; PCSYCityID=CN_430000_430100_0; wlfstk_smdl=sj225honbf7s9w22b1jod5d84uke2p3u; sdtoken=AAbEsBpEIOVjqTAKCQtvQu17PyK3ywnZ8UO2-O6pBCLIc__UuTCzk71dQx-vt335e3Vq_s1U_MOZsmw9IIsSQt0Ssf-JBDEYPKV_4Kuw881BbT-soqhy09Ntp62oa2UTt5wNntuGAmY; shshshfpb=BApXWjSFkj_hAQmUseHCpGOkZYcD4b9KRBjRWcw5o9xJ1MrJqw4-28XTv3in_MdNwIbcI7_LT0_HGtfk; __jda=76161171.17761774204291754555989.1776177420.1776177420.1776177420.1; __jdc=76161171; __jdb=76161171.21.17761774204291754555989|1.1776177420';

xbs.setFingerPrint({
    "location": {
        hash: "",
        host:"www.jd.com",
        hostname:"www.jd.com",
        href:"https://www.jd.com/",
        origin:"https://www.jd.com",
        pathname:"/",
        port: "",
        protocol: "https:"
    }
})

xbs.funcCallTrack = function (funcRef, func_caller, funcSig, funcParams, funcReturn) {
    logger.info("函数:", funcRef, "调用者:", func_caller, "函数参数:", funcParams, "函数返回值:", funcReturn);
}

xbs.globalGetter = function (target, targetName, property) {
    if (targetName === "window" && !["document", "history", "location", "screen", "navigator"].includes(property)) return;
    if (targetName === "HTMLHeadElement_instance") targetName = "head";
    if (targetName === "HTMLScriptElement_instance") targetName = "script";
    logger.info(targetName, "get属性：", property, "值：", target[property]);
}

xbs.globalSetter = function (target, targetName, property, value) {
    logger.info(targetName, "set属性：", property, "值：", value);
}

delete global;
delete Buffer;
delete process;

require("./xbs_js_security_v3_0.1.4.js");

window.PSign = new window.ParamsSign({
    appId: "b5216",
    preRequest: !1,
    onSign: function onSign(e) {
        0 != e.code && y.colorApi.postDraData(704, "ParamsSign签名不可用", "ParamsSign", "code != 0", "", "")
    },
    onRequestTokenRemotely: function onRequestTokenRemotely(e) {
        e.code,
            e.message
    },
    onRequestToken: function onRequestToken(e) {
        e.code,
            e.message
    }
});
var A = { "functionId": "pc_home_feed", "appid": "www-jd-com", "body": "cf1297c356d12ea7388643b9f7ff2cb26978ef442f7768479736d43a762b64c6", "client": "pc", "clientVersion": "1.0.0", "t": 1775738880678 }
var sign = window.PSign.sign(A);
logger.info(sign);
